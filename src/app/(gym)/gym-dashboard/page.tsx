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

  if (gym.status !== 'active') {
    const rejected = gym.status === 'rejected'
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
        <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm p-10 max-w-lg w-full text-center overflow-hidden">
          <span className="absolute inset-0 flex items-center justify-center font-bebas text-[120px] text-white/[0.03] leading-none select-none pointer-events-none">
            {rejected ? 'CLOSED' : 'PENDING'}
          </span>
          <div className="relative space-y-5">
            <div>
              <p className="font-inter text-[11px] text-[#FFD60A] tracking-[4px] uppercase mb-3">
                {rejected ? 'Application Closed' : 'Under Review'}
              </p>
              <h1 className="font-bebas text-4xl text-white tracking-[1px]">
                {rejected ? 'APPLICATION NOT APPROVED' : 'PENDING REVIEW'}
              </h1>
            </div>
            <p className="font-inter text-[#999999] text-sm leading-relaxed max-w-sm mx-auto">
              {rejected
                ? `${gym.name}'s application was not approved this time. Reach out to support if you believe this was a mistake.`
                : `${gym.name} is being reviewed by our team. You'll get access to streaming, scheduling, and member tools as soon as it's approved — usually within 1–2 business days.`}
            </p>
            {!rejected && (
              <div className="text-left max-w-xs mx-auto space-y-3 pt-2">
                {[
                  { label: 'Application submitted', done: true },
                  { label: 'Team review', done: false },
                  { label: 'Gym goes live', done: false },
                ].map((step) => (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${step.done ? 'bg-[#00D4AA]' : 'bg-[#333333]'}`} />
                    <p className={`font-inter text-sm ${step.done ? 'text-white' : 'text-[#555555]'}`}>{step.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
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
