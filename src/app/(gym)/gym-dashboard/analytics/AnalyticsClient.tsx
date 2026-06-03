'use client'

import GymSidebar from '@/components/layout/GymSidebar'
import { Users, Radio, Clock, TrendingUp } from 'lucide-react'

interface Props {
  gym: any
  totalSessions: number
  endedSessions: number
  totalHours: number
  activeMemberCount: number
  expiringSoon: number
  disciplineBreakdown: { name: string; count: number; pct: number }[]
  levelBreakdown: { name: string; count: number }[]
  coachLeaderboard: { name: string; count: number }[]
  busiestDow: { day: string; count: number }[]
  weeklyActivity: { week: string; count: number }[]
  memberGrowth: { month: string; count: number; cumulative: number }[]
  sourceBreakdown: { name: string; count: number }[]
}

const DISCIPLINE_COLOR: Record<string, string> = {
  BJJ: '#FF3B3B',
  Boxing: '#FFD60A',
  'Muay Thai': '#00D4AA',
  Wrestling: '#6B7FFF',
  MMA: '#FF6B6B',
  Kickboxing: '#FF9500',
}

function BarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-2.5">
      {data.map(({ label, value, color }) => (
        <div key={label} className="flex items-center gap-3">
          <span className="font-inter text-xs text-[#999999] w-20 shrink-0 truncate">{label}</span>
          <div className="flex-1 h-5 bg-[#111111] rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-500"
              style={{
                width: `${(value / max) * 100}%`,
                backgroundColor: color ?? '#FF3B3B',
                opacity: value === 0 ? 0.2 : 1,
              }}
            />
          </div>
          <span className="font-bebas text-lg text-white w-8 text-right tracking-[1px]">{value}</span>
        </div>
      ))}
    </div>
  )
}

function WeeklyChart({ data }: { data: { week: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex items-end gap-2 h-28">
      {data.map(({ week, count }) => (
        <div key={week} className="flex-1 flex flex-col items-center gap-1.5">
          {count > 0 && <span className="font-inter text-[10px] text-[#999999]">{count}</span>}
          <div className="w-full rounded-sm bg-[#1A1A1A] overflow-hidden" style={{ height: '72px' }}>
            <div
              className="w-full bg-[#FF3B3B] rounded-sm transition-all duration-500"
              style={{ height: `${(count / max) * 100}%`, marginTop: 'auto' }}
            />
          </div>
          <span className="font-inter text-[9px] text-[#555555] uppercase tracking-[1px] text-center leading-tight">{week}</span>
        </div>
      ))}
    </div>
  )
}

export default function AnalyticsClient({
  totalSessions, totalHours, activeMemberCount, expiringSoon,
  disciplineBreakdown, levelBreakdown, coachLeaderboard, busiestDow,
  weeklyActivity, memberGrowth, sourceBreakdown,
}: Props) {
  const retentionPct = activeMemberCount > 0
    ? Math.round(((activeMemberCount - expiringSoon) / activeMemberCount) * 100)
    : 100

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Analytics" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#222222] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-bebas text-xl text-white tracking-[1px] leading-tight">Analytics</h1>
          </div>
        </div>

        <div className="px-6 py-8 max-w-4xl space-y-8">

          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333] rounded-sm overflow-hidden">
            {[
              { icon: <Radio size={14} />, label: 'Total Classes', value: totalSessions, color: 'text-white' },
              { icon: <Clock size={14} />, label: 'Hours Streamed', value: `${totalHours}h`, color: 'text-white' },
              { icon: <Users size={14} />, label: 'Active Members', value: activeMemberCount, color: 'text-[#00D4AA]' },
              { icon: <TrendingUp size={14} />, label: 'Retention', value: `${retentionPct}%`, color: retentionPct >= 80 ? 'text-[#00D4AA]' : retentionPct >= 60 ? 'text-[#FFD60A]' : 'text-[#FF3B3B]' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="bg-[#1A1A1A] px-5 py-5">
                <div className={`flex items-center gap-1.5 mb-2 ${color}`}>
                  {icon}
                  <span className="font-inter text-[11px] tracking-[3px] uppercase">{label}</span>
                </div>
                <p className={`font-bebas text-3xl tracking-[1px] ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Weekly activity chart */}
          <section>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Classes — Last 8 Weeks</p>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-5">
              <WeeklyChart data={weeklyActivity} />
            </div>
          </section>

          {/* Two-col row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Discipline breakdown */}
            <section>
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Classes by Discipline</p>
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-5">
                {disciplineBreakdown.length === 0 ? (
                  <p className="font-inter text-[#555555] text-sm">No classes yet.</p>
                ) : (
                  <BarChart
                    data={disciplineBreakdown.map(d => ({
                      label: d.name,
                      value: d.count,
                      color: DISCIPLINE_COLOR[d.name] ?? '#FF3B3B',
                    }))}
                  />
                )}
              </div>
            </section>

            {/* Day of week */}
            <section>
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Busiest Days</p>
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-5">
                <BarChart
                  data={busiestDow.map(d => ({ label: d.day, value: d.count }))}
                />
              </div>
            </section>

            {/* Level breakdown */}
            <section>
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Classes by Level</p>
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-5">
                {levelBreakdown.length === 0 ? (
                  <p className="font-inter text-[#555555] text-sm">No class levels recorded.</p>
                ) : (
                  <BarChart
                    data={levelBreakdown.map(d => ({
                      label: d.name,
                      value: d.count,
                      color: d.name === 'Beginner' ? '#00D4AA' : d.name === 'Intermediate' ? '#FFD60A' : '#FF3B3B',
                    }))}
                  />
                )}
              </div>
            </section>

            {/* Coach leaderboard */}
            <section>
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Classes by Coach</p>
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-5">
                {coachLeaderboard.length === 0 ? (
                  <p className="font-inter text-[#555555] text-sm">No coaches assigned to classes yet.</p>
                ) : (
                  <BarChart data={coachLeaderboard.map(c => ({ label: c.name, value: c.count }))} />
                )}
              </div>
            </section>

          </div>

          {/* Member growth */}
          <section>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Member Growth — Last 6 Months</p>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-5">
              <div className="flex items-end gap-3 h-32">
                {memberGrowth.map(({ month, count, cumulative }) => {
                  const maxC = Math.max(...memberGrowth.map(m => m.cumulative), 1)
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                      <span className="font-inter text-[10px] text-[#999999]">{cumulative || ''}</span>
                      <div className="w-full rounded-sm bg-[#111111] overflow-hidden relative" style={{ height: '72px' }}>
                        {/* Cumulative (background) */}
                        <div
                          className="absolute bottom-0 w-full bg-[#FF3B3B]/15 rounded-sm"
                          style={{ height: `${(cumulative / maxC) * 100}%` }}
                        />
                        {/* New this month (foreground) */}
                        {count > 0 && (
                          <div
                            className="absolute bottom-0 w-full bg-[#FF3B3B] rounded-sm"
                            style={{ height: `${(count / maxC) * 100}%` }}
                          />
                        )}
                      </div>
                      <span className="font-inter text-[9px] text-[#555555] uppercase tracking-[1px]">{month}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5 font-inter text-[10px] text-[#555555]">
                  <span className="w-3 h-2 rounded-sm bg-[#FF3B3B] inline-block" /> New this month
                </span>
                <span className="flex items-center gap-1.5 font-inter text-[10px] text-[#555555]">
                  <span className="w-3 h-2 rounded-sm bg-[#FF3B3B]/20 inline-block" /> Cumulative total
                </span>
              </div>
            </div>
          </section>

          {/* Join source */}
          {sourceBreakdown.length > 0 && (
            <section>
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">How Members Joined</p>
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-5">
                <BarChart
                  data={sourceBreakdown.map(s => ({
                    label: s.name.charAt(0).toUpperCase() + s.name.slice(1),
                    value: s.count,
                    color: s.name === 'coupon' ? '#00D4AA' : '#FFD60A',
                  }))}
                />
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  )
}
