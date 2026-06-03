import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGymByOwnerId, getGymSessions, getGymCoaches } from '@/lib/supabase/queries'
import ScheduleClient from './ScheduleClient'

export default async function SchedulePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const gym = await getGymByOwnerId(user.id)
  if (!gym) redirect('/gym-dashboard')

  const [sessions, coaches] = await Promise.all([
    getGymSessions(gym.id),
    getGymCoaches(gym.id),
  ])

  // Also fetch ended sessions so the full history is visible
  const supabaseClient = createClient()
  const { data: ended } = await supabaseClient
    .from('sessions')
    .select('id, title, discipline, scheduled_at, duration_minutes, level, status, coach_id, coaches(name)')
    .eq('gym_id', gym.id)
    .eq('status', 'ended')
    .order('scheduled_at', { ascending: false })
    .limit(20)

  const allSessions = [
    ...(sessions ?? []),
    ...(ended ?? []).filter(e => !(sessions ?? []).find((s: any) => s.id === e.id)),
  ]

  return (
    <ScheduleClient
      gym={gym}
      sessions={allSessions}
      coaches={(coaches ?? []).map((c: any) => ({ id: c.id, name: c.name }))}
    />
  )
}
