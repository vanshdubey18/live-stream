import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLiveStreamStatus } from '@/lib/mux'

export async function GET(req: NextRequest) {
  const gymId = req.nextUrl.searchParams.get('gym_id')
  if (!gymId) return NextResponse.json({ error: 'gym_id required' }, { status: 400 })

  const supabase = createClient()

  // Require authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // Require active membership in this gym
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('gym_id', gymId)
    .eq('status', 'active')
    .maybeSingle()
  if (!membership) return NextResponse.json({ error: 'No active membership' }, { status: 403 })

  const { data: gym, error } = await supabase
    .from('gyms')
    .select('mux_live_stream_id, mux_playback_id')
    .eq('id', gymId)
    .maybeSingle()

  if (error || !gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  if (!gym.mux_live_stream_id) {
    return NextResponse.json({ status: 'idle', has_stream: false })
  }

  try {
    const { status, viewer_count } = await getLiveStreamStatus(gym.mux_live_stream_id)
    return NextResponse.json({
      has_stream: true,
      status,
      viewer_count,
      playback_id: gym.mux_playback_id,
    })
  } catch {
    return NextResponse.json({ has_stream: true, status: 'idle', viewer_count: 0 })
  }
}
