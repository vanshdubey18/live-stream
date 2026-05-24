import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const supabase = createClient()
  const { data: session } = await supabase
    .from('sessions')
    .select('status, mux_playback_id, gym_id')
    .eq('id', sessionId)
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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
