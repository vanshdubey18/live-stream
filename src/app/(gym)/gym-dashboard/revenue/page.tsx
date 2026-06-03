import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getGymByOwnerId, getGymMemberCount, getGymMembershipStats } from '@/lib/supabase/queries'
import RevenueClient from './RevenueClient'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function RevenuePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const gym = await getGymByOwnerId(user.id)
  if (!gym) redirect('/gym-dashboard')

  const [memberCount, memberStats, { data: payouts }, { data: memberships }] = await Promise.all([
    getGymMemberCount(gym.id),
    getGymMembershipStats(gym.id),
    adminClient()
      .from('payouts')
      .select('id, amount_paise, status, period_start, period_end')
      .eq('gym_id', gym.id)
      .order('period_start', { ascending: false }),
    adminClient()
      .from('memberships')
      .select('created_at, source')
      .eq('gym_id', gym.id)
      .eq('status', 'active'),
  ])

  // Monthly member join counts for the last 6 months
  const now = new Date()
  const monthlyJoins: { month: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    const count = (memberships ?? []).filter(m => {
      const t = new Date(m.created_at)
      return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth()
    }).length
    monthlyJoins.push({ month: label, count })
  }

  const pricePerMember = (gym.monthly_price_paise ?? 99900) / 100
  const gymShare = 0.7
  const estMonthlyGross = memberCount * pricePerMember
  const estMonthlyNet = Math.round(estMonthlyGross * gymShare)
  const totalPaidOut = (payouts ?? []).filter(p => p.status === 'paid').reduce((s, p) => s + p.amount_paise, 0)
  const pendingPayout = (payouts ?? []).filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount_paise, 0)

  return (
    <RevenueClient
      gym={gym}
      memberCount={memberCount}
      memberStats={memberStats}
      payouts={payouts ?? []}
      monthlyJoins={monthlyJoins}
      estMonthlyGross={estMonthlyGross}
      estMonthlyNet={estMonthlyNet}
      totalPaidOut={totalPaidOut / 100}
      pendingPayout={pendingPayout / 100}
      pricePerMember={pricePerMember}
    />
  )
}
