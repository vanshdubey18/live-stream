import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getMemberGyms,
  getUpcomingSessions,
  getRecentReplays,
  getLiveSession,
  getNextSessionForGym,
} from '@/lib/supabase/queries'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all data in parallel
  const memberships = await getMemberGyms(user.id)
  const gymIds = memberships.map((m: any) => m.gyms?.id).filter(Boolean)

  const [upcoming, replays, liveSession, allSessions] = await Promise.all([
    getUpcomingSessions(gymIds),
    getRecentReplays(gymIds),
    getLiveSession(gymIds),
    gymIds.length > 0
      ? createClient().from('sessions').select('id, status, duration_minutes, scheduled_at').in('gym_id', gymIds).eq('status', 'ended')
      : Promise.resolve({ data: [] }),
  ])

  const completedSessions = (allSessions as any)?.data ?? []
  const completedCount = completedSessions.length
  const totalHours = Math.round(completedSessions.reduce((acc: number, s: any) => acc + (s.duration_minutes ?? 60), 0) / 60)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthCount = completedSessions.filter((s: any) => new Date(s.scheduled_at) >= monthStart).length

  // Get next class for each gym
  const gymsWithNext = await Promise.all(
    memberships.map(async (m: any) => {
      const next = await getNextSessionForGym(m.gyms?.id)
      return { ...m, nextSession: next }
    })
  )

  const gymNames: Record<string, string> = {}
  memberships.forEach((m: any) => { if (m.gyms?.id) gymNames[m.gyms.id] = m.gyms.name ?? '' })

  return (
    <DashboardClient
      user={{ name: user.user_metadata?.full_name ?? user.email ?? 'Fighter', email: user.email ?? '' }}
      memberships={gymsWithNext}
      upcoming={upcoming}
      replays={replays}
      liveSession={liveSession}
      completedCount={completedCount}
      totalHours={totalHours}
      monthCount={monthCount}
      gymIds={gymIds}
      gymNames={gymNames}
    />
  )
}
