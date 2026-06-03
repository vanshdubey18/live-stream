import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getGymByOwnerId } from '@/lib/supabase/queries'
import AnalyticsClient from './AnalyticsClient'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const gym = await getGymByOwnerId(user.id)
  if (!gym) redirect('/gym-dashboard')

  const [{ data: sessions }, { data: memberships }] = await Promise.all([
    adminClient()
      .from('sessions')
      .select('id, discipline, level, status, scheduled_at, duration_minutes, coach_id, coaches(name)')
      .eq('gym_id', gym.id)
      .order('scheduled_at', { ascending: false }),
    adminClient()
      .from('memberships')
      .select('id, created_at, status, free_until, current_period_end, source')
      .eq('gym_id', gym.id),
  ])

  const allSessions = sessions ?? []
  const allMemberships = memberships ?? []

  // ── Session stats ──────────────────────────────────────────────
  const ended = allSessions.filter(s => s.status === 'ended')
  const totalHours = Math.round(ended.reduce((a, s) => a + (s.duration_minutes ?? 60), 0) / 60)

  // Discipline breakdown
  const disciplineMap: Record<string, number> = {}
  for (const s of allSessions) {
    disciplineMap[s.discipline] = (disciplineMap[s.discipline] ?? 0) + 1
  }
  const disciplineBreakdown = Object.entries(disciplineMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: Math.round((count / allSessions.length) * 100) || 0 }))

  // Level breakdown
  const levelMap: Record<string, number> = {}
  for (const s of allSessions) {
    if (s.level) levelMap[s.level] = (levelMap[s.level] ?? 0) + 1
  }
  const levelBreakdown = Object.entries(levelMap).sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))

  // Coach leaderboard
  const coachMap: Record<string, { name: string; count: number }> = {}
  for (const s of allSessions) {
    if (s.coach_id && (s.coaches as any)?.name) {
      const n = (s.coaches as any).name
      coachMap[s.coach_id] = { name: n, count: (coachMap[s.coach_id]?.count ?? 0) + 1 }
    }
  }
  const coachLeaderboard = Object.values(coachMap).sort((a, b) => b.count - a.count)

  // Sessions per day of week
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dowCount = Array(7).fill(0)
  for (const s of allSessions) {
    dowCount[new Date(s.scheduled_at).getDay()]++
  }
  const busiestDow = dowCount.map((count, i) => ({ day: DOW[i], count }))

  // Sessions last 8 weeks
  const now = Date.now()
  const weeklyActivity: { week: string; count: number }[] = []
  for (let i = 7; i >= 0; i--) {
    const wStart = new Date(now - i * 7 * 86400000)
    const wEnd = new Date(now - (i - 1) * 7 * 86400000)
    const label = wStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    const count = allSessions.filter(s => {
      const t = new Date(s.scheduled_at).getTime()
      return t >= wStart.getTime() && t < wEnd.getTime()
    }).length
    weeklyActivity.push({ week: label, count })
  }

  // ── Membership stats ───────────────────────────────────────────
  const active = allMemberships.filter(m => m.status === 'active')
  const nowMs = Date.now()
  const weekMs = 7 * 86400000

  const expiringSoon = active.filter(m => {
    const end = m.current_period_end ?? m.free_until
    if (!end) return false
    const t = new Date(end).getTime()
    return t >= nowMs && t <= nowMs + weekMs
  }).length

  // Member growth last 6 months
  const memberGrowth: { month: string; count: number; cumulative: number }[] = []
  let cumulative = 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now)
    d.setMonth(d.getMonth() - i)
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    const count = allMemberships.filter(m => {
      const t = new Date(m.created_at)
      return t.getFullYear() === d.getFullYear() && t.getMonth() === d.getMonth()
    }).length
    cumulative += count
    memberGrowth.push({ month: label, count, cumulative })
  }

  // Source breakdown (coupon vs paid)
  const sourceMap: Record<string, number> = {}
  for (const m of allMemberships) {
    const src = m.source ?? 'unknown'
    sourceMap[src] = (sourceMap[src] ?? 0) + 1
  }

  return (
    <AnalyticsClient
      gym={gym}
      totalSessions={allSessions.length}
      endedSessions={ended.length}
      totalHours={totalHours}
      activeMemberCount={active.length}
      expiringSoon={expiringSoon}
      disciplineBreakdown={disciplineBreakdown}
      levelBreakdown={levelBreakdown}
      coachLeaderboard={coachLeaderboard}
      busiestDow={busiestDow}
      weeklyActivity={weeklyActivity}
      memberGrowth={memberGrowth}
      sourceBreakdown={Object.entries(sourceMap).map(([name, count]) => ({ name, count }))}
    />
  )
}
