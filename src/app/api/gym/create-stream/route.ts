import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'
import { createLiveStream } from '@/lib/mux'

export async function POST(_req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Get the gym owned by this user
  const { data: gym, error: gymErr } = await supabase
    .from('gyms')
    .select('id, status, mux_live_stream_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (gymErr || !gym) {
    return NextResponse.json({ error: 'No gym found for this account' }, { status: 404 })
  }

  if (gym.status !== 'active') {
    return NextResponse.json({ error: 'Your gym is pending approval' }, { status: 403 })
  }

  // If a stream already exists, return existing credentials (fetching from Mux if key is missing in DB)
  if (gym.mux_live_stream_id) {
    const { data: existing } = await supabase
      .from('gyms')
      .select('mux_live_stream_id, stream_key, mux_playback_id')
      .eq('id', gym.id)
      .single()

    let streamKey = existing?.stream_key
    let playbackId = existing?.mux_playback_id

    // stream_key was never saved (partial provision) — fetch from Mux and backfill
    if (!streamKey && existing?.mux_live_stream_id) {
      try {
        const { video } = new (await import('@mux/mux-node')).default()
        const muxStream = await video.liveStreams.retrieve(existing.mux_live_stream_id)
        streamKey = muxStream.stream_key ?? undefined
        playbackId = playbackId ?? muxStream.playback_ids?.[0]?.id ?? undefined
        if (streamKey) {
          const admin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
          )
          await admin.from('gyms').update({ stream_key: streamKey, mux_playback_id: playbackId }).eq('id', gym.id)
        }
      } catch (err) {
        console.error('[create-stream] failed to fetch stream key from Mux:', err)
      }
    }

    return NextResponse.json({
      already_exists: true,
      stream_key: streamKey,
      playback_id: playbackId,
      stream_id: existing?.mux_live_stream_id,
    })
  }

  // Create a new Mux live stream
  let muxResult: { id: string; stream_key: string | undefined; playback_id: string | undefined }
  try {
    muxResult = await createLiveStream()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Mux API error'
    console.error('[create-stream] Mux error:', msg)
    return NextResponse.json({ error: `Mux error: ${msg}` }, { status: 502 })
  }
  const { id, stream_key, playback_id } = muxResult

  // Save to Supabase using service role to bypass RLS
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { error: updateErr } = await admin
    .from('gyms')
    .update({
      mux_live_stream_id: id,
      stream_key,
      mux_playback_id: playback_id,
    })
    .eq('id', gym.id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  return NextResponse.json({ stream_key, playback_id, stream_id: id })
}
