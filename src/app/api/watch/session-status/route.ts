import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { isSessionLive } from '@/lib/session-live'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const supabase = createClient()

  // Require authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  // cf_hls_url is column-locked (migration 019) — the membership check below
  // is what actually gates access to it.
  const { data: session } = await adminClient()
    .from('sessions')
    .select('status, cf_hls_url, gym_id, scheduled_at')
    .eq('id', sessionId)
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // A session stuck 'live' from a crashed/abandoned stream is treated as ended —
  // this member's client shouldn't sit on a phantom live page forever.
  if (session.status === 'live' && !isSessionLive(session)) {
    session.status = 'ended'
  }

  // Require active membership in the session's gym
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('gym_id', session.gym_id)
    .eq('status', 'active')
    .maybeSingle()
  if (!membership) return NextResponse.json({ error: 'No active membership' }, { status: 403 })

  let cfHlsUrl: string | null = session.cf_hls_url ?? null
  if (session.status === 'live' && !cfHlsUrl) {
    const { data: gym } = await adminClient()
      .from('gyms')
      .select('cf_hls_url')
      .eq('id', session.gym_id)
      .maybeSingle()
    cfHlsUrl = gym?.cf_hls_url ?? null
  }

  return NextResponse.json({
    status: session.status,
    cf_hls_url: session.status === 'live' ? cfHlsUrl : null,
  })
}
