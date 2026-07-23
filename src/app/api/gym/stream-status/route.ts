import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { getLiveInputStatus } from '@/lib/cloudflare'

export async function GET(req: NextRequest) {
  const gymId = req.nextUrl.searchParams.get('gym_id')
  if (!gymId) return NextResponse.json({ error: 'gym_id required' }, { status: 400 })

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // This previously had no ownership check at all — any authenticated (or
  // even anon, pre-migration-019) caller could pass any gym_id and receive
  // that gym's Cloudflare live-input credentials. Scope strictly to the
  // caller's own gym.
  const { data: gym, error } = await adminClient()
    .from('gyms')
    .select('cf_live_input_uid, cf_hls_url')
    .eq('id', gymId)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (error || !gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  if (!gym.cf_live_input_uid) {
    return NextResponse.json({ status: 'idle', has_stream: false })
  }

  try {
    const cfStatus = await getLiveInputStatus(gym.cf_live_input_uid)
    const status = cfStatus === 'connected' ? 'active' : 'idle'
    return NextResponse.json({ has_stream: true, status, hls_url: gym.cf_hls_url })
  } catch {
    return NextResponse.json({ has_stream: true, status: 'idle' })
  }
}
