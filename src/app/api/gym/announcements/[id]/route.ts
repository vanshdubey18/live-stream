import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { data: gym } = await adminClient()
    .from('gyms').select('id').eq('owner_id', user.id).maybeSingle()
  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const { error } = await adminClient()
    .from('announcements')
    .delete()
    .eq('id', params.id)
    .eq('gym_id', gym.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
