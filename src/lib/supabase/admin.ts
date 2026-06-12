import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export { adminClient }

/** Look up a user's role from the public.users table (bypasses user_metadata self-write). */
export async function getDbRole(userId: string): Promise<string | null> {
  const { data } = await adminClient()
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle()
  return data?.role ?? null
}

/** Assert the request is from an admin. Returns the user or null. */
export async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const role = await getDbRole(user.id)
  return role === 'admin' ? user : null
}

/** Assert the request is from a gym_owner. Returns the user or null. */
export async function assertGymOwner() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const role = await getDbRole(user.id)
  return role === 'gym_owner' ? user : null
}

export const UNAUTHORIZED = () =>
  NextResponse.json({ error: 'Not authorized' }, { status: 403 })
