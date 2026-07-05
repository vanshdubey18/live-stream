import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { data: gym } = await supabase
    .from('gyms')
    .select('id, status, mux_playback_id, mux_live_stream_id, cf_hls_url')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ error: 'No gym found' }, { status: 404 })
  if (gym.status !== 'active') return NextResponse.json({ error: 'Gym not active' }, { status: 403 })

  const { title, discipline, session_id } = await req.json().catch(() => ({}))
  const classTitle = title?.trim() || `Live Class — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
  const classDisc = discipline || 'BJJ'

  // End any other live session for this gym first (never the one we're about to go live with)
  await admin()
    .from('sessions')
    .update({ status: 'ended' })
    .eq('gym_id', gym.id)
    .eq('status', 'live')
    .neq('id', session_id ?? '00000000-0000-0000-0000-000000000000')

  // Camera/mic are already verified connected at this point (caller only hits this
  // route after the WHIP publish succeeds) — this is the single place a session is
  // ever marked 'live', so members never see a LIVE badge with no actual stream.
  if (session_id) {
    // Going live against an already-scheduled class — update it in place instead of
    // creating a duplicate, so its real title/discipline carry through.
    const { data: session, error } = await admin()
      .from('sessions')
      .update({
        status: 'live',
        scheduled_at: new Date().toISOString(),
        mux_playback_id: gym.mux_playback_id,
        cf_hls_url: gym.cf_hls_url ?? null,
      })
      .eq('id', session_id)
      .eq('gym_id', gym.id)
      .select('id')
      .single()

    if (error || !session) return NextResponse.json({ error: error?.message ?? 'Failed to update session' }, { status: 500 })
    return NextResponse.json({ sessionId: session.id })
  }

  // No scheduled class — create an ad-hoc live session immediately.
  const { data: session, error } = await admin()
    .from('sessions')
    .insert({
      gym_id: gym.id,
      title: classTitle,
      discipline: classDisc,
      scheduled_at: new Date().toISOString(),
      duration_minutes: 60,
      level: 'Beginner',
      status: 'live',
      mux_playback_id: gym.mux_playback_id,
      cf_hls_url: gym.cf_hls_url ?? null,
    })
    .select('id')
    .single()

  if (error || !session) return NextResponse.json({ error: error?.message ?? 'Failed to create session' }, { status: 500 })

  return NextResponse.json({ sessionId: session.id })
}
