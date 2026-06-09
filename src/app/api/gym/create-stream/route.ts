import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'
import { createLiveStream } from '@/lib/mux'

export async function POST(_req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const supabase = createClient()
  const { data: gym, error: gymErr } = await supabase
    .from('gyms')
    .select('id, mux_live_stream_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (gymErr || !gym) {
    return NextResponse.json({ error: 'No gym found for this account' }, { status: 404 })
  }

  if (gym.mux_live_stream_id) {
    const { data: existing } = await adminClient()
      .from('gyms')
      .select('mux_live_stream_id, stream_key, mux_playback_id')
      .eq('id', gym.id)
      .single()
    return NextResponse.json({
      already_exists: true,
      stream_key: existing?.stream_key,
      playback_id: existing?.mux_playback_id,
      stream_id: existing?.mux_live_stream_id,
    })
  }

  let muxResult: { id: string; stream_key: string | undefined; playback_id: string | undefined }
  try {
    muxResult = await createLiveStream()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Mux API error'
    console.error('[create-stream] Mux error:', msg)
    return NextResponse.json({ error: `Mux error: ${msg}` }, { status: 502 })
  }
  const { id, stream_key, playback_id } = muxResult

  const { error: updateErr } = await adminClient()
    .from('gyms')
    .update({ mux_live_stream_id: id, stream_key, mux_playback_id: playback_id })
    .eq('id', gym.id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })
  return NextResponse.json({ stream_key, playback_id, stream_id: id })
}
