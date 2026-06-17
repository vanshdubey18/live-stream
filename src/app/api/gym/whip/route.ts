import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { sdp } = await req.json().catch(() => ({}))
  if (!sdp || typeof sdp !== 'string') {
    return NextResponse.json({ error: 'Missing SDP offer' }, { status: 400 })
  }

  // Read stream_key server-side — never expose it to the browser
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data: gym } = await admin
    .from('gyms')
    .select('stream_key, mux_live_stream_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym?.stream_key) {
    return NextResponse.json({ error: 'Stream not provisioned — go to Stream Setup and wait for the key to load' }, { status: 400 })
  }

  // Proxy the WHIP POST to Mux — solves CORS and keeps stream_key server-side
  let muxRes: Response
  try {
    muxRes = await fetch('https://global-relay.mux.com/whip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': `Bearer ${gym.stream_key}`,
      },
      body: sdp,
    })
  } catch (err) {
    console.error('[whip] fetch to Mux failed:', err)
    return NextResponse.json({ error: 'Could not reach Mux WHIP endpoint' }, { status: 502 })
  }

  const body = await muxRes.text()
  console.log(`[whip] Mux responded ${muxRes.status}`, body.slice(0, 200))

  if (muxRes.status !== 201) {
    return NextResponse.json(
      { error: `Mux WHIP error (${muxRes.status}): ${body}`, muxStatus: muxRes.status },
      { status: 502 },
    )
  }

  return NextResponse.json({ answer: body })
}
