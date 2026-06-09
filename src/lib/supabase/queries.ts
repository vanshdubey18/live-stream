import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// ─── Member queries ───────────────────────────────────────────────────────────

export async function getMemberGyms(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      id,
      status,
      source,
      free_until,
      current_period_end,
      gyms (
        id,
        name,
        slug,
        city,
        location,
        disciplines,
        logo_url,
        status
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) { console.error('getMemberGyms:', error); return [] }
  return data ?? []
}

export async function getUpcomingSessions(gymIds: string[]) {
  if (gymIds.length === 0) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, title, discipline, scheduled_at, duration_minutes,
      level, status, mux_playback_id,
      coaches ( name ),
      gyms ( name )
    `)
    .in('gym_id', gymIds)
    .in('status', ['scheduled', 'live'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(20)

  if (error) { console.error('getUpcomingSessions:', error); return [] }
  return data ?? []
}

export async function getRecentReplays(gymIds: string[]) {
  if (gymIds.length === 0) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, title, discipline, duration_minutes, mux_playback_id, scheduled_at,
      coaches ( name ),
      gyms ( name )
    `)
    .in('gym_id', gymIds)
    .eq('status', 'ended')
    .order('scheduled_at', { ascending: false })
    .limit(4)

  if (error) { console.error('getRecentReplays:', error); return [] }
  return data ?? []
}

export async function getLiveSession(gymIds: string[]) {
  if (gymIds.length === 0) return null
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, title, discipline, mux_playback_id,
      coaches ( name ),
      gyms ( name )
    `)
    .in('gym_id', gymIds)
    .eq('status', 'live')
    .limit(1)
    .maybeSingle()

  if (error) { console.error('getLiveSession:', error); return null }
  return data
}

export async function getNextSessionForGym(gymId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('id, title, scheduled_at, discipline')
    .eq('gym_id', gymId)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data
}

export async function getAllActiveGyms() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('gyms')
    .select('id, slug, name, city, location, disciplines, logo_url, description, sessions(status)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (error) { console.error('getAllActiveGyms:', error); return [] }
  return data ?? []
}

export async function getGymBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('gyms')
    // Explicit allowlist — stream_key / mux_live_stream_id / mux_playback_id are intentionally excluded
    .select('id, name, slug, description, city, location, logo_url, disciplines, monthly_price_paise, status, owner_id, instagram, website, created_at')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()
  if (error) { console.error('getGymBySlug:', error); return null }
  return data
}

export async function getMembershipForGym(userId: string, gymId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('memberships')
    .select('id, plan_type, status, free_until, current_period_end')
    .eq('user_id', userId)
    .eq('gym_id', gymId)
    .eq('status', 'active')
    .maybeSingle()
  if (error) return null
  return data
}

// ─── Gym owner queries ────────────────────────────────────────────────────────

export async function getGymByOwnerId(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle()

  if (error) { console.error('getGymByOwnerId:', error); return null }
  return data
}

export async function getGymSessions(gymId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, title, discipline, scheduled_at, duration_minutes,
      level, status, mux_playback_id,
      coaches ( id, name )
    `)
    .eq('gym_id', gymId)
    .gte('scheduled_at', new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(20)

  if (error) { console.error('getGymSessions:', error); return [] }
  return data ?? []
}

export async function getGymCoaches(gymId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('coaches')
    .select('*')
    .eq('gym_id', gymId)
    .order('created_at', { ascending: true })

  if (error) { console.error('getGymCoaches:', error); return [] }
  return data ?? []
}

export async function getGymMemberCount(gymId: string) {
  const { count, error } = await adminClient()
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', gymId)
    .eq('status', 'active')

  if (error) return 0
  return count ?? 0
}

export async function getGymMembers(gymId: string) {
  const client = adminClient()

  const [{ data: memberships, error }, { data: authUsers }] = await Promise.all([
    client
      .from('memberships')
      .select('id, plan_type, status, free_until, current_period_end, created_at, source, user_id')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false }),
    client.auth.admin.listUsers({ perPage: 1000 }),
  ])

  if (error) { console.error('getGymMembers:', error); return [] }

  const userMap: Record<string, { email: string; full_name: string | null }> = {}
  for (const u of authUsers?.users ?? []) {
    userMap[u.id] = { email: u.email ?? '', full_name: u.user_metadata?.full_name ?? null }
  }

  return (memberships ?? []).map(m => ({
    ...m,
    profile: userMap[m.user_id] ?? { email: '', full_name: null },
  }))
}

// Membership stats for the owner dashboard action items: total active, expiring
// within 7 days, and joined within the last 7 days.
export async function getGymMembershipStats(gymId: string) {
  const { data, error } = await adminClient()
    .from('memberships')
    .select('id, free_until, current_period_end, created_at')
    .eq('gym_id', gymId)
    .eq('status', 'active')

  if (error || !data) return { active: 0, expiringSoon: 0, newThisWeek: 0 }

  const now = Date.now()
  const week = 7 * 24 * 60 * 60 * 1000

  let expiringSoon = 0
  let newThisWeek = 0
  for (const m of data) {
    const end = m.current_period_end ?? m.free_until
    if (end) {
      const t = new Date(end).getTime()
      if (t >= now && t <= now + week) expiringSoon++
    }
    if (m.created_at && new Date(m.created_at).getTime() >= now - week) newThisWeek++
  }

  return { active: data.length, expiringSoon, newThisWeek }
}
