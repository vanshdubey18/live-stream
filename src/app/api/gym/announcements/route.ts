import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function GET() {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { data: gym } = await adminClient()
    .from('gyms').select('id').eq('owner_id', user.id).maybeSingle()
  if (!gym) return NextResponse.json({ announcements: [] })

  const { data, error } = await adminClient()
    .from('announcements')
    .select('id, body, created_at')
    .eq('gym_id', gym.id)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ announcements: data ?? [] })
}

export async function POST(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { body } = await req.json()
  if (!body || !body.trim()) return NextResponse.json({ error: 'Announcement body is required' }, { status: 400 })
  if (body.length > 500) return NextResponse.json({ error: 'Keep it under 500 characters' }, { status: 400 })

  const { data: gym } = await adminClient()
    .from('gyms').select('id').eq('owner_id', user.id).maybeSingle()
  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const { data: announcement, error } = await adminClient()
    .from('announcements')
    .insert({ gym_id: gym.id, body: body.trim(), created_by: user.id })
    .select('id, body, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ announcement })
}
