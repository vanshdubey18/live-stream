import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: msg } = await adminClient()
    .from('live_chat_messages')
    .select('id, session_id')
    .eq('id', params.id)
    .maybeSingle()
  if (!msg) return NextResponse.json({ error: 'Message not found' }, { status: 404 })

  const { data: session } = await adminClient()
    .from('sessions').select('gym_id').eq('id', msg.session_id).maybeSingle()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const { data: gym } = await adminClient()
    .from('gyms').select('owner_id').eq('id', session.gym_id).maybeSingle()
  if (gym?.owner_id !== user.id) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { error } = await adminClient().from('live_chat_messages').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
