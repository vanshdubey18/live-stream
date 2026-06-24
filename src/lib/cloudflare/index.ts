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
        recording: { mode: 'off' },
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

export async function getLiveInputStatus(uid: string): Promise<'connected' | 'disconnected'> {
  const res = await fetch(
    `${BASE}/accounts/${accountId()}/stream/live_inputs/${uid}`,
    { headers: authHeaders() }
  )
  if (!res.ok) return 'disconnected'
  const { result } = await res.json()
  return result.status === 'connected' ? 'connected' : 'disconnected'
}
