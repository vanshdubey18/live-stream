import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { staleLiveCutoffISO } from '@/lib/session-live'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Anon-key client with no cookie/session dependency — required inside
// unstable_cache (Next's Data Cache can't wrap anything that reads
// cookies/headers, since the result would then vary per user despite being
// cached). Only used for genuinely public reads: gym browsing, not
// membership-gated or personalized data.
function publicClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// ─── Member queries ─────────────────────────────────────────────────────────────

export async function getMemberGyms(userId: string) {
  // Uses the admin client, not the request-scoped session client — this read is
  // already tightly gated by an authenticated userId from getUser() upstream, so
  // routing it through the browser's rotating auth cookies just exposes it to a
  // JWT-refresh race (a stale/mid-refresh token can make RLS legitimately return
  // zero rows) that looks identical to "this member really has no gyms."
  const supabase = adminClient()
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
        cover_url,
        status
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')

  // A real Supabase error is not the same as "this member has no gyms" —
  // throw so the error boundary offers a retry instead of silently showing
  // "join a gym" to someone who already has.
  if (error) { console.error('getMemberGyms:', error); throw new Error(`Failed to load memberships: ${error.message}`) }
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
  // cf_video_uid/ai_summary are locked down at the column-grant level (see
  // migration 019) since the RLS row-policy alone can't tell a member of
  // this gym apart from a random anon caller. gymIds here always come from
  // the authenticated caller's own getMemberGyms() upstream, so the
  // service-role client is safe — the membership check already happened.
  const supabase = adminClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, title, discipline, duration_minutes, mux_playback_id, cf_video_uid, ai_summary, scheduled_at,
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

export async function getReplayLibrary(gymIds: string[]) {
  if (gymIds.length === 0) return []
  // Same reasoning as getRecentReplays above — cf_video_uid is column-locked;
  // gymIds is always the caller's own membership list, so admin client is safe.
  const supabase = adminClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, title, discipline, duration_minutes, mux_playback_id, cf_video_uid, scheduled_at,
      gym_id, level,
      coaches ( name ),
      gyms ( id, name )
    `)
    .in('gym_id', gymIds)
    .eq('status', 'ended')
    .order('scheduled_at', { ascending: false })
    .limit(50)

  if (error) { console.error('getReplayLibrary:', error); return [] }
  return data ?? []
}

// Reads the modules_public view — a plain Postgres view has no FK metadata
// for PostgREST to embed coaches/gyms through, so this is deliberately flat.
// Callers already have the member's own gym list to map gym_id -> name.
export async function getInstructionalsLibrary(gymIds: string[]) {
  if (gymIds.length === 0) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('modules_public')
    .select('id, title, description, discipline, level, price_paise, status, thumbnail_uid, duration_seconds, sales_count, gym_id, coach_id, created_at')
    .in('gym_id', gymIds)
    .order('created_at', { ascending: false })

  if (error) { console.error('getInstructionalsLibrary:', error); return [] }
  return data ?? []
}

export async function getOwnedModuleIds(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('module_purchases')
    .select('module_id')
    .eq('user_id', userId)
    .eq('status', 'paid')

  if (error) { console.error('getOwnedModuleIds:', error); return [] }
  return (data ?? []).map(r => r.module_id)
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
    // Ignore sessions stuck in 'live' from a crashed/abandoned stream — no real
    // class runs this long, so treat them as if they'd been ended.
    .gte('scheduled_at', staleLiveCutoffISO())
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

// Public gym browsing (list + detail) is the same data for every visitor,
// changes slowly, and was previously re-fetched from the DB on literally
// every page view — the biggest uncached hot path in the app. Cached for
// 60s via Next's Data Cache; a gym-profile edit can take up to that long
// to show publicly, which is an acceptable tradeoff for this data.
export const getAllActiveGyms = unstable_cache(
  async () => {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('gyms')
      .select('id, slug, name, city, location, disciplines, logo_url, description, sessions(status, scheduled_at)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (error) { console.error('getAllActiveGyms:', error); return [] }
    return data ?? []
  },
  ['gyms-active-list'],
  { revalidate: 60, tags: ['gyms'] }
)

export const getGymBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('gyms')
      // Explicit allowlist — stream_key / mux_live_stream_id / mux_playback_id are intentionally excluded
      .select('id, name, slug, description, city, location, logo_url, cover_url, disciplines, monthly_price_paise, status, owner_id, instagram, created_at')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle()
    if (error) { console.error('getGymBySlug:', error); return null }
    return data
  },
  ['gym-by-slug'],
  { revalidate: 60, tags: ['gyms'] }
)

export async function getMemberAnnouncements(gymIds: string[]) {
  if (gymIds.length === 0) return []
  const supabase = createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select('id, gym_id, body, created_at, gyms ( name, logo_url )')
    .in('gym_id', gymIds)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) { console.error('getMemberAnnouncements:', error); return [] }
  return data ?? []
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
  // Same reasoning as getMemberGyms above — avoid the request-scoped session
  // client's JWT-refresh race for a read that's already gated by an
  // authenticated userId.
  const supabase = adminClient()
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle()

  // A real Supabase error is not the same as "this account has no gym" —
  // throw so the error boundary offers a retry instead of silently
  // showing the misleading "no gym" screen.
  if (error) { console.error('getGymByOwnerId:', error); throw new Error(`Failed to load gym: ${error.message}`) }
  return data
}

// Public-safe — used by the /gyms/[slug] browse page, which anyone (not
// just members) can view. Deliberately excludes replay_url/cf_video_uid/
// clip_* — those are column-locked (migration 019) and would otherwise let
// a non-member extract a direct playback URL from the page's server-
// rendered payload even if the UI never visibly renders them.
export const getGymSessionsPublic = unstable_cache(
  async (gymId: string) => {
    const supabase = publicClient()
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

    if (error) { console.error('getGymSessionsPublic:', error); return [] }
    return data ?? []
  },
  ['gym-sessions-public'],
  // Shorter window than gym profile data — a class going live/ending is
  // exactly the kind of change that shouldn't sit stale for a full minute.
  { revalidate: 20, tags: ['gym-sessions'] }
)

// Owner-only — includes replay/clip management fields. Callers must already
// have verified the caller owns this gym before calling this.
export async function getGymSessionsForOwner(gymId: string) {
  const supabase = adminClient()
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      id, title, discipline, scheduled_at, duration_minutes,
      level, status, mux_playback_id, replay_url,
      clip_status, clip_url, clip_banner_dismissed, cf_video_uid,
      coaches ( id, name )
    `)
    .eq('gym_id', gymId)
    .gte('scheduled_at', new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(20)

  if (error) { console.error('getGymSessionsForOwner:', error); return [] }
  return data ?? []
}

export const getGymCoaches = unstable_cache(
  async (gymId: string) => {
    const supabase = publicClient()
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: true })

    if (error) { console.error('getGymCoaches:', error); return [] }
    return data ?? []
  },
  ['gym-coaches'],
  { revalidate: 60, tags: ['gym-coaches'] }
)

export const getGymMemberCount = unstable_cache(
  async (gymId: string) => {
    const { count, error } = await adminClient()
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .eq('status', 'active')

    if (error) return 0
    return count ?? 0
  },
  ['gym-member-count'],
  { revalidate: 60, tags: ['gym-member-count'] }
)

export async function getGymMembers(gymId: string) {
  const { data: memberships, error } = await adminClient()
    .from('memberships')
    .select(`
      id, plan_type, status, free_until, current_period_end, created_at, source, user_id,
      users ( email, name )
    `)
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false })

  if (error) { console.error('getGymMembers:', error); return [] }

  return (memberships ?? []).map(m => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = m.users as any
    return {
      ...m,
      profile: { email: u?.email ?? '', full_name: u?.name ?? null },
    }
  })
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
