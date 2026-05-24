import { NextRequest, NextResponse } from 'next/server'
import Mux from '@mux/mux-node'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

// Lazy init so env vars are read at request time
function getMux() {
  return new Mux({ webhookSecret: process.env.MUX_WEBHOOK_SECRET! })
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => { headers[k] = v })

  // Verify Mux webhook signature
  try {
    await getMux().webhooks.verifySignature(rawBody, headers)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)
  const { type, data } = event

  if (type === 'video.live_stream.active') {
    // Stream went live: set any session with this gym to 'live', save playback ID
    const streamId: string = data.id
    const playbackId: string | undefined = data.playback_ids?.[0]?.id

    const { data: gym } = await admin
      .from('gyms')
      .select('id')
      .eq('mux_live_stream_id', streamId)
      .maybeSingle()

    if (gym) {
      await admin
        .from('sessions')
        .update({ status: 'live', ...(playbackId ? { mux_playback_id: playbackId } : {}) })
        .eq('gym_id', gym.id)
        .eq('status', 'scheduled')
    }
  }

  if (type === 'video.live_stream.idle') {
    // Stream went idle (ended): mark live sessions as ended
    const streamId: string = data.id

    const { data: gym } = await admin
      .from('gyms')
      .select('id')
      .eq('mux_live_stream_id', streamId)
      .maybeSingle()

    if (gym) {
      await admin
        .from('sessions')
        .update({ status: 'ended' })
        .eq('gym_id', gym.id)
        .eq('status', 'live')
    }
  }

  if (type === 'video.asset.ready') {
    // Recording ready: save replay playback ID to the live session
    const assetPlaybackId: string | undefined = data.playback_ids?.[0]?.id
    const liveStreamId: string | undefined = data.live_stream_id

    if (assetPlaybackId && liveStreamId) {
      const { data: gym } = await admin
        .from('gyms')
        .select('id')
        .eq('mux_live_stream_id', liveStreamId)
        .maybeSingle()

      if (gym) {
        // Save replay playback ID to the most recently ended session for this gym
        const { data: session } = await admin
          .from('sessions')
          .select('id')
          .eq('gym_id', gym.id)
          .eq('status', 'ended')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (session) {
          await admin
            .from('sessions')
            .update({ mux_playback_id: assetPlaybackId })
            .eq('id', session.id)

          console.log(`[mux-webhook] Replay ready for session ${session.id}: ${assetPlaybackId}`)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
