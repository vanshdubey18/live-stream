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

  const [upcoming, replays, liveSession] = await Promise.all([
    getUpcomingSessions(gymIds),
    getRecentReplays(gymIds),
    getLiveSession(gymIds),
  ])

  // Get next class for each gym
  const gymsWithNext = await Promise.all(
    memberships.map(async (m: any) => {
      const next = await getNextSessionForGym(m.gyms?.id)
      return { ...m, nextSession: next }
    })
  )

  return (
    <DashboardClient
      user={{ name: user.user_metadata?.full_name ?? user.email ?? 'Fighter', email: user.email ?? '' }}
      memberships={gymsWithNext}
      upcoming={upcoming}
      replays={replays}
      liveSession={liveSession}
    />
  )
}
