import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDbRole, adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // cf_whip_url is column-locked (migration 019) — ownership already
  // verified via owner_id, so service role is fine.
  const { data: gym } = await adminClient()
    .from('gyms')
    .select('cf_whip_url')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym?.cf_whip_url) {
    return NextResponse.json({ error: 'No WHIP URL provisioned — call /api/gym/create-stream first' }, { status: 400 })
  }

  // Read the raw SDP offer from the request body
  const sdpOffer = await req.text()
  if (!sdpOffer) {
    return NextResponse.json({ error: 'SDP body required' }, { status: 400 })
  }

  // Forward the SDP to Cloudflare's WHIP endpoint.
  // The WHIP URL already contains the live input UID in the path — that IS the
  // credential. Do NOT send CLOUDFLARE_API_TOKEN here; it's the management API
  // key, not a WHIP key, and sending it causes Cloudflare to not register the
  // publisher on its distribution layer (WHEP viewers get 409).
  const cfRes = await fetch(gym.cf_whip_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sdp' },
    body: sdpOffer,
  })

  if (!cfRes.ok) {
    const err = await cfRes.text()
    console.error('[cf-whip] Cloudflare WHIP error:', cfRes.status, err)
    return NextResponse.json({ error: `WHIP error: ${cfRes.status}` }, { status: 502 })
  }

  const sdpAnswer = await cfRes.text()
  // WHIP gives back a resource URL (Location header) that must be DELETEd to
  // properly end the session — closing the local RTCPeerConnection alone
  // just lets Cloudflare detect the drop, which is slower/less reliable and
  // (per Cloudflare's own community reports) can leave short streams stuck
  // without ever finishing the live-to-recording conversion.
  const location = cfRes.headers.get('Location')
  const resourceUrl = location ? new URL(location, gym.cf_whip_url).toString() : null

  return new NextResponse(sdpAnswer, {
    status: 201,
    headers: {
      'Content-Type': 'application/sdp',
      ...(resourceUrl ? { 'X-Whip-Resource-Url': resourceUrl } : {}),
    },
  })
}

// Properly ends the WHIP session — call this on stream end, alongside (not
// instead of) closing the local RTCPeerConnection.
export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { resourceUrl } = await req.json().catch(() => ({}))
  if (!resourceUrl) return NextResponse.json({ error: 'resourceUrl required' }, { status: 400 })

  try {
    await fetch(resourceUrl, { method: 'DELETE' })
  } catch (err) {
    console.error('[cf-whip] Failed to DELETE WHIP resource:', err)
  }
  return NextResponse.json({ ok: true })
}
