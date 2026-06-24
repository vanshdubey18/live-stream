import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'
import { createLiveInput } from '@/lib/cloudflare'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(_req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { data: gym, error: gymErr } = await supabase
    .from('gyms')
    .select('id, status, name, cf_live_input_uid, cf_whip_url, cf_hls_url')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (gymErr || !gym) {
    return NextResponse.json({ error: 'No gym found for this account' }, { status: 404 })
  }

  if (gym.status !== 'active') {
    return NextResponse.json({ error: 'Your gym is pending approval' }, { status: 403 })
  }

  // Already provisioned — return existing credentials
  if (gym.cf_live_input_uid && gym.cf_whip_url && gym.cf_hls_url) {
    return NextResponse.json({
      uid: gym.cf_live_input_uid,
      hls_url: gym.cf_hls_url,
    })
  }

  // Provision a new Cloudflare live input
  let liveInput: { uid: string; whipUrl: string; hlsUrl: string }
  try {
    liveInput = await createLiveInput(gym.name ?? gym.id)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Cloudflare API error'
    console.error('[create-stream] Cloudflare error:', msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  const { error: updateErr } = await getAdmin()
    .from('gyms')
    .update({
      cf_live_input_uid: liveInput.uid,
      cf_whip_url: liveInput.whipUrl,
      cf_hls_url: liveInput.hlsUrl,
    })
    .eq('id', gym.id)

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  return NextResponse.json({ uid: liveInput.uid, hls_url: liveInput.hlsUrl })
}
