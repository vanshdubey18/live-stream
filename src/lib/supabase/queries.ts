import { createClient } from '@/lib/supabase/server'

// ─── Member queries ───────────────────────────────────────────────────────────

export async function getMemberGyms(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('memberships')
    .select(`
      id,
      plan_type,
      disciplines,
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
    .select('id, slug, name, city, location, disciplines, logo_url, description')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (error) { console.error('getAllActiveGyms:', error); return [] }
  return data ?? []
}

export async function getGymBySlug(slug: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
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
  const supabase = createClient()
  const { count, error } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', gymId)
    .eq('status', 'active')

  if (error) return 0
  return count ?? 0
}
