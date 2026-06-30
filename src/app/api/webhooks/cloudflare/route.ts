import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const runtime = 'nodejs'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function verifySignature(rawBody: string, sigHeader: string | null): Promise<boolean> {
  if (!sigHeader || !process.env.CF_STREAM_WEBHOOK_SECRET) return false
  // Header format: "time=1234567890,sig1=abcdef..."
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')))
  const timestamp = parts['time']
  const sig = parts['sig1']
  if (!timestamp || !sig) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.CF_STREAM_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const expected = Buffer.from(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`))
  ).toString('hex')

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
}

async function callClipApi(cfVideoUid: string): Promise<string | null> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/stream/clip`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
      },
      body: JSON.stringify({
        clippedFromVideoUID: cfVideoUid,
        startTimeSeconds: 0,
        endTimeSeconds: 60,
      }),
    }
  )
  if (!res.ok) {
    console.error('[cf-webhook] clip API error:', res.status, await res.text())
    return null
  }
  const json = await res.json()
  return json.result?.uid ?? null
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sigHeader = req.headers.get('webhook-signature')

  const valid = await verifySignature(rawBody, sigHeader)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  const event = JSON.parse(rawBody)
  const { type, data } = event

  // stream.video.ready fires for both recordings and clips
  if (type === 'stream.video.ready') {
    const videoUid: string = data.uid
    const liveInputUid: string | undefined = data.live_input

    if (liveInputUid) {
      // This is a recording from a live stream
      await handleRecordingReady(videoUid, liveInputUid, data)
    } else {
      // This is a clip encoding complete
      await handleClipReady(videoUid, data)
    }
  }

  return NextResponse.json({ received: true })
}

async function handleRecordingReady(videoUid: string, liveInputUid: string, data: any) {
  // Look up gym by cf_live_input_uid
  const { data: gym } = await admin
    .from('gyms')
    .select('id')
    .eq('cf_live_input_uid', liveInputUid)
    .maybeSingle()

  if (!gym) {
    console.warn(`[cf-webhook] No gym found for live_input_uid: ${liveInputUid}`)
    return
  }

  // Find the most recently ended session for this gym
  const { data: session } = await admin
    .from('sessions')
    .select('id, cf_video_uid, duration_seconds')
    .eq('gym_id', gym.id)
    .eq('status', 'ended')
    .is('cf_video_uid', null) // idempotency guard
    .order('scheduled_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!session) {
    console.warn(`[cf-webhook] No ended session without cf_video_uid for gym ${gym.id}`)
    return
  }

  const durationSeconds: number = data.duration ?? 0
  const hlsUrl = `https://customer-${process.env.NEXT_PUBLIC_CF_CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${videoUid}/manifest/video.m3u8`

  await admin.from('sessions').update({
    cf_video_uid: videoUid,
    duration_seconds: durationSeconds,
    replay_url: hlsUrl,
  }).eq('id', session.id)

  console.log(`[cf-webhook] Recording ready for session ${session.id}: ${videoUid}`)

  // Short stream guard — skip clipping if less than 70s
  if (durationSeconds < 70) {
    console.log(`[cf-webhook] Stream too short (${durationSeconds}s), skipping clip`)
    return
  }

  // Create preview clip (first 60s)
  const clipUid = await callClipApi(videoUid)
  if (clipUid) {
    await admin.from('sessions').update({
      clip_video_uid: clipUid,
      clip_status: 'pending',
    }).eq('id', session.id)
    console.log(`[cf-webhook] Clip created: ${clipUid} for session ${session.id}`)
  } else {
    await admin.from('sessions').update({ clip_status: 'failed' }).eq('id', session.id)
  }
}

async function handleClipReady(clipUid: string, data: any) {
  // Match by clip_video_uid stored when we called the clip API
  const { data: session } = await admin
    .from('sessions')
    .select('id')
    .eq('clip_video_uid', clipUid)
    .maybeSingle()

  if (!session) {
    // Not a MATPEAK clip — ignore
    return
  }

  const clipHlsUrl = `https://customer-${process.env.NEXT_PUBLIC_CF_CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${clipUid}/manifest/video.m3u8`

  await admin.from('sessions').update({
    clip_url: clipHlsUrl,
    clip_status: 'ready',
  }).eq('id', session.id)

  console.log(`[cf-webhook] Clip ready for session ${session.id}: ${clipUid}`)
}
