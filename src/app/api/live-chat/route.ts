import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

const MAX_LEN = 300

async function canAccessSession(userId: string, sessionId: string) {
  const { data: session } = await adminClient()
    .from('sessions')
    .select('gym_id')
    .eq('id', sessionId)
    .maybeSingle()
  if (!session) return false

  const { data: gym } = await adminClient()
    .from('gyms').select('owner_id').eq('id', session.gym_id).maybeSingle()
  if (gym?.owner_id === userId) return true

  const { data: membership } = await adminClient()
    .from('memberships')
    .select('id')
    .eq('gym_id', session.gym_id)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()
  return !!membership
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  if (!(await canAccessSession(user.id, sessionId))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { data, error } = await adminClient()
    .from('live_chat_messages')
    .select('id, user_id, user_name, body, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: data ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { session_id, body } = await req.json().catch(() => ({}))
  if (!session_id || !body?.trim()) return NextResponse.json({ error: 'session_id and body are required' }, { status: 400 })
  if (body.length > MAX_LEN) return NextResponse.json({ error: `Keep it under ${MAX_LEN} characters` }, { status: 400 })

  if (!(await canAccessSession(user.id, session_id))) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { data: profile } = await adminClient()
    .from('users').select('name').eq('id', user.id).maybeSingle()

  const { data: message, error } = await adminClient()
    .from('live_chat_messages')
    .insert({
      session_id,
      user_id: user.id,
      user_name: profile?.name?.trim() || 'Member',
      body: body.trim(),
    })
    .select('id, user_id, user_name, body, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message })
}
