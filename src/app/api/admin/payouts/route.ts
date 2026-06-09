import { NextResponse } from 'next/server'
import { assertAdmin, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function GET() {
  const user = await assertAdmin()
  if (!user) return UNAUTHORIZED()

  const { data, error } = await adminClient()
    .from('payouts')
    .select('id, gym_id, amount_paise, status, period_start, period_end, gyms(name)')
    .order('period_start', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payouts: data ?? [] })
}
