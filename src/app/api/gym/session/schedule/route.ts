import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const supabase = createClient()
  const { data: gym } = await supabase
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ error: 'No gym found for this account' }, { status: 404 })

  const { title, discipline, scheduledAt, durationMinutes, level, coachId } = await req.json()
  if (!title || !discipline || !scheduledAt || !level) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data: session, error } = await adminClient()
    .from('sessions')
    .insert({
      gym_id: gym.id,
      title,
      discipline,
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes ?? 60,
      level,
      coach_id: coachId ?? null,
      status: 'scheduled',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session })
}
