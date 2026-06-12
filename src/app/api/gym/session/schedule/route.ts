import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { data: gym } = await supabase
    .from('gyms')
    .select('id, status')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ error: 'No gym found for this account' }, { status: 404 })

  if (gym.status !== 'active') {
    return NextResponse.json({ error: 'Your gym is pending approval' }, { status: 403 })
  }

  const { title, discipline, scheduledAt, durationMinutes, level, coachId } = await req.json()
  if (!title || !discipline || !scheduledAt || !level) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: session, error } = await admin
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
