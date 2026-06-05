import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { gymId, couponCode } = await req.json()

  if (!gymId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check not already a member
  const { data: existing } = await adminClient
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('gym_id', gymId)
    .eq('status', 'active')
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Already a member of this gym' }, { status: 400 })

  const { data: gym } = await adminClient
    .from('gyms')
    .select('status')
    .eq('id', gymId)
    .maybeSingle()

  if (!gym || gym.status !== 'active') {
    return NextResponse.json({ error: 'This gym is not currently active' }, { status: 400 })
  }

  let couponId: string | null = null
  let freeUntil: string | null = null

  if (couponCode) {
    const { data: coupon, error: couponErr } = await adminClient
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .maybeSingle()

    if (couponErr || !coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 400 })
    }

    if (coupon.max_uses > 0 && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
    }

    couponId = coupon.id

    // Set content-access window from coupon — membership itself stays permanent
    if (coupon.type === 'free_days') {
      const until = new Date()
      until.setDate(until.getDate() + coupon.value)
      freeUntil = until.toISOString()
    } else if (coupon.type === 'percent_off' && coupon.value === 100) {
      const until = new Date()
      until.setDate(until.getDate() + 30)
      freeUntil = until.toISOString()
    }
  }

  // Membership is permanent (status stays 'active' until gym removes member).
  // free_until only gates content access — it doesn't affect membership itself.
  const { error: membershipErr } = await adminClient.from('memberships').insert({
    user_id: user.id,
    gym_id: gymId,
    status: 'active',
    source: couponCode ? 'coupon' : 'paid',
    free_until: freeUntil,
    plan_type: 'full_mma',
  })

  if (membershipErr) return NextResponse.json({ error: membershipErr.message }, { status: 400 })

  // Increment coupon usage and record redemption
  if (couponId) {
    const { data: currentCoupon } = await adminClient
      .from('coupons').select('times_used').eq('id', couponId).single()
    await Promise.all([
      adminClient.from('coupons')
        .update({ times_used: (currentCoupon?.times_used ?? 0) + 1 })
        .eq('id', couponId),
      adminClient.from('coupon_redemptions').insert({
        coupon_id: couponId,
        user_id: user.id,
        gym_id: gymId,
        plan_type: 'full_mma',
        free_until: freeUntil,
      }),
    ])
  }

  return NextResponse.json({ success: true })
}
