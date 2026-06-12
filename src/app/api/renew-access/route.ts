import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { gymId, couponCode } = await req.json()
  if (!gymId || !couponCode) {
    return NextResponse.json({ error: 'Missing gymId or couponCode' }, { status: 400 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Validate coupon
  const { data: coupon } = await adminClient
    .from('coupons')
    .select('*')
    .eq('code', couponCode.trim().toUpperCase())
    .eq('is_active', true)
    .maybeSingle()

  if (!coupon) {
    return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
  }

  if (coupon.max_uses > 0 && coupon.times_used >= coupon.max_uses) {
    return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
  }

  // Find existing membership
  const { data: membership } = await adminClient
    .from('memberships')
    .select('id, free_until, current_period_end')
    .eq('user_id', user.id)
    .eq('gym_id', gymId)
    .eq('status', 'active')
    .maybeSingle()

  if (!membership) {
    return NextResponse.json({ error: 'No membership found for this gym' }, { status: 404 })
  }

  // Compute new free_until: extend from today (or existing expiry if still in future)
  let newFreeUntil: string | null = null
  const now = new Date()

  if (coupon.type === 'free_days') {
    const base = new Date()
    base.setDate(base.getDate() + coupon.value)
    newFreeUntil = base.toISOString()
  } else if (coupon.type === 'percent_off' && coupon.value === 100) {
    const base = new Date()
    base.setDate(base.getDate() + 30)
    newFreeUntil = base.toISOString()
  } else {
    return NextResponse.json({ error: 'This coupon type cannot be used for renewal' }, { status: 400 })
  }

  // Update membership free_until
  const { error: updateErr } = await adminClient
    .from('memberships')
    .update({ free_until: newFreeUntil })
    .eq('id', membership.id)

  if (updateErr) {
    return NextResponse.json({ error: 'Failed to renew access' }, { status: 500 })
  }

  // Record redemption and increment usage
  const { data: currentCoupon } = await adminClient
    .from('coupons').select('times_used').eq('id', coupon.id).single()

  await Promise.all([
    adminClient.from('coupons')
      .update({ times_used: (currentCoupon?.times_used ?? 0) + 1 })
      .eq('id', coupon.id),
    adminClient.from('coupon_redemptions').insert({
      coupon_id: coupon.id,
      user_id: user.id,
      gym_id: gymId,
      free_until: newFreeUntil,
    }),
  ])

  const days = coupon.type === 'free_days' ? coupon.value : 30
  return NextResponse.json({ success: true, days, newFreeUntil })
}
