import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getGymByOwnerId,
  getGymSessions,
  getGymCoaches,
  getGymMemberCount,
  getGymMembershipStats,
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
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-10 max-w-md w-full text-center">
          <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase mb-3">Gym Dashboard</p>
          <h1 className="font-bebas text-3xl text-white tracking-[1px] mb-2">NO GYM FOUND</h1>
          <p className="font-inter text-[#999999] text-sm mb-6">You don't have a gym linked to your account yet.</p>
          <a href="/gym-signup" className="bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] px-6 py-3 rounded-sm text-sm transition-colors">
            APPLY TO LIST YOUR GYM
          </a>
        </div>
      </div>
    )
  }

  const [sessions, coaches, memberCount, memberStats] = await Promise.all([
    getGymSessions(gym.id),
    getGymCoaches(gym.id),
    getGymMemberCount(gym.id),
    getGymMembershipStats(gym.id),
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
      memberStats={memberStats}
      payouts={payouts ?? []}
    />
  )
}
