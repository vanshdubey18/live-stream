import { NextRequest, NextResponse } from 'next/server'
import Mux from '@mux/mux-node'
import { createClient } from '@supabase/supabase-js'
import { processSession } from '@/lib/ai/process-session'

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
      // Only activate the single next scheduled session (closest to now)
      const { data: nextSession } = await admin
        .from('sessions')
        .select('id')
        .eq('gym_id', gym.id)
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (nextSession) {
        await admin
          .from('sessions')
          .update({ status: 'live', ...(playbackId ? { mux_playback_id: playbackId } : {}) })
          .eq('id', nextSession.id)
      }
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

  if (type === 'video.asset.created') {
    // Recording asset created while the session is still live (or just ended):
    // stamp the asset ID on the session NOW so asset.ready can match
    // deterministically instead of guessing by newest-ended.
    const assetId: string = data.id
    const liveStreamId: string | undefined = data.live_stream_id

    if (assetId && liveStreamId) {
      const { data: gym } = await admin
        .from('gyms')
        .select('id')
        .eq('mux_live_stream_id', liveStreamId)
        .maybeSingle()

      if (gym) {
        const { data: session } = await admin
          .from('sessions')
          .select('id')
          .eq('gym_id', gym.id)
          .in('status', ['live', 'ended'])
          .is('mux_asset_id', null)
          .order('scheduled_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (session) {
          await admin
            .from('sessions')
            .update({ mux_asset_id: assetId })
            .eq('id', session.id)
        }
      }
    }
  }

  if (type === 'video.asset.ready') {
    // Recording ready: save replay playback ID to the matching session
    const assetId: string = data.id
    const assetPlaybackId: string | undefined = data.playback_ids?.[0]?.id
    const liveStreamId: string | undefined = data.live_stream_id

    if (assetPlaybackId && liveStreamId) {
      // Preferred path: match by the asset ID stamped on asset.created
      const { data: byAsset } = await admin
        .from('sessions')
        .select('id')
        .eq('mux_asset_id', assetId)
        .maybeSingle()

      let sessionId = byAsset?.id ?? null

      if (!sessionId) {
        // Fallback heuristic: newest ended session for this gym. Log so we
        // know the deterministic path missed (e.g. asset.created not received).
        console.warn(`[mux-webhook] asset.ready fallback matching for asset ${assetId}`)

        const { data: gym } = await admin
          .from('gyms')
          .select('id')
          .eq('mux_live_stream_id', liveStreamId)
          .maybeSingle()

        if (gym) {
          const { data: session } = await admin
            .from('sessions')
            .select('id')
            .eq('gym_id', gym.id)
            .eq('status', 'ended')
            .order('scheduled_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          sessionId = session?.id ?? null
        }
      }

      if (sessionId) {
        await admin
          .from('sessions')
          .update({ mux_playback_id: assetPlaybackId, mux_asset_id: assetId })
          .eq('id', sessionId)

        console.log(`[mux-webhook] Replay ready for session ${sessionId}: ${assetPlaybackId}`)

        // Fire-and-forget AI processing — transcribe + extract techniques
        processSession(sessionId).catch(err =>
          console.error('[mux-webhook] processSession error:', err)
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
