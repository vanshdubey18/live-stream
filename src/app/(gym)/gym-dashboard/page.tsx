import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getGymByOwnerId,
  getGymSessions,
  getGymCoaches,
  getGymMemberCount,
} from '@/lib/supabase/queries'
import GymDashboardClient from './GymDashboardClient'

export default async function GymDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const gym = await getGymByOwnerId(user.id)
  if (!gym) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-3">No gym found</h1>
          <p className="text-[#999999] text-sm mb-6">You don't have a gym linked to your account yet.</p>
          <a href="/gym-signup" className="bg-[#FF3B3B] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
            Apply to list your gym
          </a>
        </div>
      </div>
    )
  }

  const [sessions, coaches, memberCount] = await Promise.all([
    getGymSessions(gym.id),
    getGymCoaches(gym.id),
    getGymMemberCount(gym.id),
  ])

  // Fetch payouts for this gym
  const supabaseClient = createClient()
  const { data: payouts } = await supabaseClient
    .from('payouts')
    .select('*')
    .eq('gym_id', gym.id)
    .order('period_start', { ascending: false })
    .limit(5)

  return (
    <GymDashboardClient
      gym={gym}
      ownerName={user.user_metadata?.full_name ?? 'Owner'}
      sessions={sessions ?? []}
      coaches={coaches ?? []}
      memberCount={memberCount}
      payouts={payouts ?? []}
    />
  )
}
