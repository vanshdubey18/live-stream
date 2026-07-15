const BASE = 'https://api.cloudflare.com/client/v4'

function accountId() {
  return process.env.CLOUDFLARE_ACCOUNT_ID!
}

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN!}`,
    'Content-Type': 'application/json',
  }
}

export interface CloudflareLiveInput {
  uid: string
  whipUrl: string
  hlsUrl: string
}

export async function createLiveInput(name: string): Promise<CloudflareLiveInput> {
  const res = await fetch(
    `${BASE}/accounts/${accountId()}/stream/live_inputs`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        meta: { name },
        // 'automatic' records every broadcast on this input so replays/clips/
        // chapters/AI processing all have video to work with.
        recording: { mode: 'automatic' },
      }),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudflare ${res.status}: ${text}`)
  }
  const { result } = await res.json()

  const whipUrl: string = result.webRTC?.url ?? ''
  // Derive HLS URL: same host as webRTCPlayback but /manifest/video.m3u8
  const playbackBase: string = (result.webRTCPlayback?.url ?? '').replace('/webRTC/play', '')
  const hlsUrl = playbackBase ? `${playbackBase}/manifest/video.m3u8` : ''

  return { uid: result.uid as string, whipUrl, hlsUrl }
}

export interface CloudflareDirectUpload {
  uploadUrl: string
  uid: string
}

// For pre-recorded instructional uploads (not live). Cloudflare returns the
// video uid synchronously, before the browser has uploaded any bytes — so
// the caller can store cf_video_uid immediately and use it, rather than a
// heuristic, to match this upload up in the "ready to stream" webhook later.
export async function createDirectUpload(maxDurationSeconds = 3600): Promise<CloudflareDirectUpload> {
  const res = await fetch(
    `${BASE}/accounts/${accountId()}/stream/direct_upload`,
    {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ maxDurationSeconds }),
    }
  )
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Cloudflare ${res.status}: ${text}`)
  }
  const { result } = await res.json()
  return { uploadUrl: result.uploadURL as string, uid: result.uid as string }
}

export async function getLiveInputStatus(uid: string): Promise<'connected' | 'disconnected'> {
  const res = await fetch(
    `${BASE}/accounts/${accountId()}/stream/live_inputs/${uid}`,
    { headers: authHeaders() }
  )
  if (!res.ok) return 'disconnected'
  const { result } = await res.json()
  return result.status === 'connected' ? 'connected' : 'disconnected'
}

// Self-heals live inputs provisioned before recording was turned on by
// default. Cheap to call on every create-stream request — only patches
// when recording is actually off.
export async function enableRecordingIfNeeded(uid: string): Promise<void> {
  try {
    const res = await fetch(
      `${BASE}/accounts/${accountId()}/stream/live_inputs/${uid}`,
      { headers: authHeaders() }
    )
    if (!res.ok) return
    const { result } = await res.json()
    if (result?.recording?.mode === 'automatic') return

    await fetch(
      `${BASE}/accounts/${accountId()}/stream/live_inputs/${uid}`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ recording: { mode: 'automatic' } }),
      }
    )
  } catch (err) {
    console.error('[cloudflare] enableRecordingIfNeeded failed:', err)
  }
}
