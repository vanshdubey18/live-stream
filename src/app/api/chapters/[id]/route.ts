import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

async function verifyOwnership(chapterId: string, userId: string) {
  const { data } = await adminClient()
    .from('replay_chapters')
    .select('id, session_id, sessions!inner(gyms!inner(owner_id))')
    .eq('id', chapterId)
    .maybeSingle()

  if (!data) return null
  const ownerIdPath = (data.sessions as any)?.gyms?.owner_id
  if (ownerIdPath !== userId) return null
  return data
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const chapter = await verifyOwnership(params.id, user.id)
  if (!chapter) return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })

  const { timestamp_seconds, label } = await req.json()
  const updates: Record<string, any> = {}
  if (timestamp_seconds != null) updates.timestamp_seconds = timestamp_seconds
  if (label?.trim()) updates.label = label.trim()

  const { data, error } = await adminClient()
    .from('replay_chapters')
    .update(updates)
    .eq('id', params.id)
    .select('id, timestamp_seconds, label')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ chapter: data })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const chapter = await verifyOwnership(params.id, user.id)
  if (!chapter) return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })

  const { error } = await adminClient()
    .from('replay_chapters')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
