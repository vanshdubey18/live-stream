import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// GET /api/chapters?session_id=X — for members on the replay page
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const supabase = createClient()
  const { data, error } = await supabase
    .from('replay_chapters')
    .select('id, timestamp_seconds, label')
    .eq('session_id', sessionId)
    .order('timestamp_seconds', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ chapters: data ?? [] })
}

// POST /api/chapters — gym owner creates a chapter
export async function POST(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { session_id, timestamp_seconds, label } = await req.json()
  if (!session_id || timestamp_seconds == null || !label?.trim()) {
    return NextResponse.json({ error: 'session_id, timestamp_seconds, and label required' }, { status: 400 })
  }

  const supabase = adminClient()

  // Verify the session belongs to this owner's gym
  const { data: session } = await supabase
    .from('sessions')
    .select('id, duration_seconds, gyms!inner(owner_id)')
    .eq('id', session_id)
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if ((session.gyms as any)?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }
  if (session.duration_seconds && timestamp_seconds > session.duration_seconds) {
    return NextResponse.json({ error: 'Timestamp exceeds session duration' }, { status: 422 })
  }

  // Max 50 chapters per session
  const { count } = await supabase
    .from('replay_chapters')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session_id)

  if ((count ?? 0) >= 50) {
    return NextResponse.json({ error: 'Maximum 50 chapters per session' }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('replay_chapters')
    .insert({ session_id, timestamp_seconds, label: label.trim(), created_by: user.id })
    .select('id, timestamp_seconds, label')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ chapter: data }, { status: 201 })
}
