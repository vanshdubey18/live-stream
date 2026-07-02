import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

async function verifyOwnership(sessionId: string, userId: string) {
  const { data } = await adminClient()
    .from('sessions')
    .select('id, gyms!inner(owner_id)')
    .eq('id', sessionId)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!data || (data.gyms as any)?.owner_id !== userId) return null
  return data
}

// GET /api/gym/session-techniques?session_id=X — AI-suggested techniques for a session,
// pending gym owner review.
export async function GET(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const session = await verifyOwnership(sessionId, user.id)
  if (!session) return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })

  const { data, error } = await adminClient()
    .from('session_techniques')
    .select('technique_id, timestamp_seconds, verified_at, techniques(name)')
    .eq('session_id', sessionId)
    .order('timestamp_seconds', { ascending: true, nullsFirst: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const techniques = (data ?? []).map(row => ({
    technique_id: row.technique_id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: (row.techniques as any)?.name ?? 'Unknown technique',
    timestamp_seconds: row.timestamp_seconds,
    verified: row.verified_at !== null,
  }))

  return NextResponse.json({ techniques })
}

// POST /api/gym/session-techniques — coach confirms or removes an AI-suggested
// technique. This is the correction signal that becomes the labeled dataset.
export async function POST(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { session_id, technique_id, action } = await req.json()
  if (!session_id || !technique_id || !['verify', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'session_id, technique_id, and action (verify|reject) required' }, { status: 400 })
  }

  const session = await verifyOwnership(session_id, user.id)
  if (!session) return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })

  const supabase = adminClient()

  if (action === 'verify') {
    const { error } = await supabase
      .from('session_techniques')
      .update({ verified_at: new Date().toISOString(), verified_by: user.id })
      .eq('session_id', session_id)
      .eq('technique_id', technique_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('session_techniques')
      .delete()
      .eq('session_id', session_id)
      .eq('technique_id', technique_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
