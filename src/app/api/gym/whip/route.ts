import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'
import { createLiveStream, getLiveStreamKey } from '@/lib/mux'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function resolveStreamKey(gymId: string, muxStreamId: string | null, existingKey: string | null): Promise<string | null> {
  // Already have a key
  if (existingKey) return existingKey

  // Have stream ID but no key — fetch from Mux
  if (muxStreamId) {
    try {
      const { stream_key, playback_id } = await getLiveStreamKey(muxStreamId)
      if (stream_key) {
        await getAdmin().from('gyms').update({ stream_key, ...(playback_id ? { mux_playback_id: playback_id } : {}) }).eq('id', gymId)
        return stream_key
      }
    } catch (err) {
      console.error('[whip] getLiveStreamKey failed, will create fresh stream:', err)
    }
  }

  // No key anywhere — create a fresh Mux stream
  try {
    const { id, stream_key, playback_id } = await createLiveStream()
    if (stream_key) {
      await getAdmin().from('gyms').update({ mux_live_stream_id: id, stream_key, mux_playback_id: playback_id }).eq('id', gymId)
      return stream_key
    }
  } catch (err) {
    console.error('[whip] createLiveStream failed:', err)
  }

  return null
}

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

  // Read gym — service role to bypass RLS
  const { data: gym } = await getAdmin()
    .from('gyms')
    .select('id, status, stream_key, mux_live_stream_id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
  if (gym.status !== 'active') return NextResponse.json({ error: 'Gym not active' }, { status: 403 })

  // Auto-provision stream key if missing
  const streamKey = await resolveStreamKey(gym.id, gym.mux_live_stream_id, gym.stream_key)
  if (!streamKey) {
    return NextResponse.json({ error: 'Could not provision stream key — check Mux credentials in Vercel env vars (MUX_TOKEN_ID, MUX_TOKEN_SECRET)' }, { status: 502 })
  }

  // Proxy the WHIP POST to Mux — solves CORS and keeps stream_key server-side
  let muxRes: Response
  try {
    muxRes = await fetch('https://global-relay.mux.com/whip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sdp',
        'Authorization': `Bearer ${streamKey}`,
      },
      body: sdp,
    })
  } catch (err) {
    console.error('[whip] fetch to Mux failed:', err)
    return NextResponse.json({ error: 'Could not reach Mux WHIP endpoint' }, { status: 502 })
  }

  const body = await muxRes.text()
  console.log(`[whip] Mux responded ${muxRes.status}`, body.slice(0, 300))

  if (muxRes.status !== 201) {
    return NextResponse.json(
      { error: `Mux WHIP error (${muxRes.status}): ${body}`, muxStatus: muxRes.status },
      { status: 502 },
    )
  }

  return NextResponse.json({ answer: body })
}
