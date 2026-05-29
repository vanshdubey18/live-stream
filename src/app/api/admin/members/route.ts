import { NextResponse } from 'next/server'
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

export async function GET() {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { data, error } = await adminClient()
    .from('memberships')
    .select('id, user_id, gym_id, status, source, free_until, created_at, gyms(name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch emails from auth.users for each unique user_id
  const userIds = Array.from(new Set((data ?? []).map((m: any) => m.user_id)))
  const { data: authUsers } = await adminClient().auth.admin.listUsers()
  const emailMap: Record<string, string> = {}
  ;(authUsers?.users ?? []).forEach((u: any) => { emailMap[u.id] = u.email })

  const members = (data ?? []).map((m: any) => ({ ...m, user_email: emailMap[m.user_id] ?? null }))

  return NextResponse.json({ members })
}
