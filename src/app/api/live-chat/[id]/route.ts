import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

async function assertOwnerOfMessage(userId: string, messageId: string) {
  const { data: msg } = await adminClient()
    .from('live_chat_messages')
    .select('id, session_id')
    .eq('id', messageId)
    .maybeSingle()
  if (!msg) return null

  const { data: session } = await adminClient()
    .from('sessions').select('gym_id').eq('id', msg.session_id).maybeSingle()
  if (!session) return null

  const { data: gym } = await adminClient()
    .from('gyms').select('owner_id').eq('id', session.gym_id).maybeSingle()
  if (gym?.owner_id !== userId) return null

  return msg
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const msg = await assertOwnerOfMessage(user.id, params.id)
  if (!msg) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { error } = await adminClient().from('live_chat_messages').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// Toggle pin — pinning a message unpins whatever else was pinned in the same
// session first, so there's only ever one pinned message at a time.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const msg = await assertOwnerOfMessage(user.id, params.id)
  if (!msg) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { pinned } = await req.json().catch(() => ({ pinned: true }))

  if (pinned) {
    await adminClient().from('live_chat_messages').update({ is_pinned: false }).eq('session_id', msg.session_id).eq('is_pinned', true)
  }
  const { error } = await adminClient().from('live_chat_messages').update({ is_pinned: !!pinned }).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
