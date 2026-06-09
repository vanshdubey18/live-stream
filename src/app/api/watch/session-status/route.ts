import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const supabase = createClient()

  // Require authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: session } = await supabase
    .from('sessions')
    .select('status, mux_playback_id, gym_id')
    .eq('id', sessionId)
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Require active membership in the session's gym
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('gym_id', session.gym_id)
    .eq('status', 'active')
    .maybeSingle()
  if (!membership) return NextResponse.json({ error: 'No active membership' }, { status: 403 })

  let livePlaybackId: string | null = null
  if (session.status === 'live') {
    const { data: gym } = await supabase
      .from('gyms')
      .select('mux_playback_id')
      .eq('id', session.gym_id)
      .maybeSingle()
    livePlaybackId = gym?.mux_playback_id ?? null
  }

  return NextResponse.json({
    status: session.status,
    playback_id: session.status === 'live' ? livePlaybackId : session.mux_playback_id,
  })
}
