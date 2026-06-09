import { NextResponse } from 'next/server'
import { assertAdmin, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function GET() {
  const user = await assertAdmin()
  if (!user) return UNAUTHORIZED()

  const { data, error } = await adminClient()
    .from('memberships')
    .select('id, user_id, gym_id, status, source, free_until, created_at, gyms(name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: authUsers } = await adminClient().auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  ;(authUsers?.users ?? []).forEach((u: any) => { emailMap[u.id] = u.email })

  const members = (data ?? []).map((m: any) => ({ ...m, user_email: emailMap[m.user_id] ?? null }))

  return NextResponse.json({ members })
}
