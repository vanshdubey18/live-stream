import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLiveStreamStatus } from '@/lib/mux'

export async function GET(req: NextRequest) {
  const gymId = req.nextUrl.searchParams.get('gym_id')
  if (!gymId) return NextResponse.json({ error: 'gym_id required' }, { status: 400 })

  const supabase = createClient()

  const { data: gym, error } = await supabase
    .from('gyms')
    .select('mux_live_stream_id, stream_key, mux_playback_id')
    .eq('id', gymId)
    .maybeSingle()

  if (error || !gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  if (!gym.mux_live_stream_id) {
    return NextResponse.json({ status: 'no_stream', has_stream: false })
  }

  const { status, viewer_count } = await getLiveStreamStatus(gym.mux_live_stream_id)

  return NextResponse.json({
    has_stream: true,
    status,          // 'idle' | 'active' | 'disconnected'
    viewer_count,
    playback_id: gym.mux_playback_id,
  })
}
