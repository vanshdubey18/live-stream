import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDbRole } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { data: gym } = await supabase
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
  return new NextResponse(sdpAnswer, {
    status: 201,
    headers: { 'Content-Type': 'application/sdp' },
  })
}
