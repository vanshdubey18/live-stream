import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function GET() {
  const user = await assertAdmin()
  if (!user) return UNAUTHORIZED()

  const { data, error } = await adminClient()
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupons: data })
}

export async function POST(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return UNAUTHORIZED()

  const { code, type, value, maxUses, expiresAt, notes } = await req.json()
  if (!code || !type || value == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await adminClient()
    .from('coupons')
    .insert({
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      plan_type: 'full_mma',
      max_uses: Number(maxUses ?? 100),
      times_used: 0,
      expires_at: expiresAt || null,
      is_active: true,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A coupon with that code already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon: data })
}

export async function PATCH(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return UNAUTHORIZED()

  const { id, isActive } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await adminClient()
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
