import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if ((user.user_metadata?.role ?? 'member') !== 'admin') return null
  return user
}

// GET — list all coupons
export async function GET() {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { data, error } = await adminClient()
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupons: data })
}

// POST — create a coupon
export async function POST(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

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
      plan_type: 'all',
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

// PATCH — toggle is_active
export async function PATCH(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { id, isActive } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await adminClient()
    .from('coupons')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
