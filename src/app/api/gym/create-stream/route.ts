import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'
import { createLiveStream, getLiveStreamKey } from '@/lib/mux'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(_req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { data: gym, error: gymErr } = await supabase
    .from('gyms')
    .select('id, status, mux_live_stream_id, stream_key, mux_playback_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (gymErr || !gym) {
    return NextResponse.json({ error: 'No gym found for this account' }, { status: 404 })
  }

  if (gym.status !== 'active') {
    return NextResponse.json({ error: 'Your gym is pending approval' }, { status: 403 })
  }

  // Already have everything we need
  if (gym.stream_key) {
    return NextResponse.json({
      stream_key: gym.stream_key,
      playback_id: gym.mux_playback_id,
      stream_id: gym.mux_live_stream_id,
    })
  }

  // Have a stream ID but no key — try fetching from Mux
  if (gym.mux_live_stream_id) {
    try {
      const fetched = await getLiveStreamKey(gym.mux_live_stream_id)
      if (fetched.stream_key) {
        await getAdmin().from('gyms').update({
          stream_key: fetched.stream_key,
          mux_playback_id: fetched.playback_id ?? gym.mux_playback_id,
        }).eq('id', gym.id)
        return NextResponse.json({
          stream_key: fetched.stream_key,
          playback_id: fetched.playback_id ?? gym.mux_playback_id,
          stream_id: gym.mux_live_stream_id,
        })
      }
    } catch (err) {
      console.error('[create-stream] Mux retrieve failed, will create fresh stream:', err)
    }
  }

  // No key found anywhere — create a brand new Mux stream
  let muxResult: { id: string; stream_key: string | undefined; playback_id: string | undefined }
  try {
    muxResult = await createLiveStream()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Mux API error'
    console.error('[create-stream] Mux create error:', msg)
    return NextResponse.json({ error: `Mux error: ${msg}` }, { status: 502 })
  }

  const { id, stream_key, playback_id } = muxResult
  const { error: updateErr } = await getAdmin()
    .from('gyms')
    .update({ mux_live_stream_id: id, stream_key, mux_playback_id: playback_id })
    .eq('id', gym.id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  return NextResponse.json({ stream_key, playback_id, stream_id: id })
}
