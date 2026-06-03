'use client'

import GymSidebar from '@/components/layout/GymSidebar'
import { CheckCircle, Clock, TrendingUp, Users, IndianRupee } from 'lucide-react'

interface Props {
  gym: any
  memberCount: number
  memberStats: { active: number; expiringSoon: number; newThisWeek: number }
  payouts: any[]
  monthlyJoins: { month: string; count: number }[]
  estMonthlyGross: number
  estMonthlyNet: number
  totalPaidOut: number
  pendingPayout: number
  pricePerMember: number
}

function fmt(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function RevenueClient({
  memberCount, memberStats, payouts, monthlyJoins,
  estMonthlyGross, estMonthlyNet, totalPaidOut, pendingPayout, pricePerMember,
}: Props) {
  const maxJoins = Math.max(...monthlyJoins.map(m => m.count), 1)

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Revenue" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#222222] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-bebas text-xl text-white tracking-[1px] leading-tight">Revenue & Payouts</h1>
          </div>
          <span className="font-inter text-[10px] text-[#FFD60A] tracking-[2px] uppercase border border-[#FFD60A]/20 bg-[#FFD60A]/5 px-2 py-1 rounded-sm">
            Estimates
          </span>
        </div>

        <div className="px-6 py-8 max-w-4xl space-y-8">

          {/* KPI strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333] rounded-sm overflow-hidden">
            {[
              { icon: <IndianRupee size={14} />, label: 'Est. This Month', value: fmt(estMonthlyNet), sub: '70% of gross', color: 'text-white' },
              { icon: <IndianRupee size={14} />, label: 'Gross This Month', value: fmt(estMonthlyGross), sub: 'Before platform fee', color: 'text-[#999999]' },
              { icon: <CheckCircle size={14} />, label: 'Total Paid Out', value: fmt(totalPaidOut), sub: 'All time', color: 'text-[#00D4AA]' },
              { icon: <Clock size={14} />, label: 'Pending', value: fmt(pendingPayout), sub: 'Awaiting payout', color: 'text-[#FFD60A]' },
            ].map(({ icon, label, value, sub, color }) => (
              <div key={label} className="bg-[#1A1A1A] px-5 py-5">
                <div className={`flex items-center gap-1.5 mb-2 ${color}`}>{icon}<span className="font-inter text-[11px] tracking-[3px] uppercase">{label}</span></div>
                <p className={`font-bebas text-3xl tracking-[1px] ${color}`}>{value}</p>
                <p className="font-inter text-[11px] text-[#555555] mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Earnings breakdown */}
          <section>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Monthly Breakdown</p>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm divide-y divide-[#222222]">
              {[
                { label: 'Active members', value: String(memberCount), unit: 'members' },
                { label: 'Price per member', value: fmt(pricePerMember), unit: '/month' },
                { label: 'Gross revenue', value: fmt(estMonthlyGross), unit: '' },
                { label: 'Platform fee (30%)', value: `−${fmt(estMonthlyGross * 0.3)}`, unit: '', dim: true },
                { label: 'Your share (70%)', value: fmt(estMonthlyNet), unit: '', highlight: true },
              ].map(({ label, value, unit, dim, highlight }) => (
                <div key={label} className={`flex items-center justify-between px-5 py-3.5 ${highlight ? 'bg-[#222222]' : ''}`}>
                  <span className={`font-inter text-sm ${dim ? 'text-[#555555]' : highlight ? 'text-white font-medium' : 'text-[#999999]'}`}>{label}</span>
                  <span className={`font-bebas text-xl tracking-[1px] ${dim ? 'text-[#555555]' : highlight ? 'text-[#00D4AA]' : 'text-white'}`}>
                    {value}<span className="font-inter text-xs ml-1">{unit}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="font-inter text-[11px] text-[#444444] mt-3">
              Estimates based on current active members × monthly price. Actual payouts processed monthly.
            </p>
          </section>

          {/* Member growth bar chart */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">New Members — Last 6 Months</p>
              <div className="flex items-center gap-1.5 font-inter text-[11px] text-[#00D4AA]">
                <TrendingUp size={12} />
                {memberStats.newThisWeek > 0 ? `+${memberStats.newThisWeek} this week` : 'Track growth'}
              </div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-5 py-6">
              <div className="flex items-end gap-3 h-32">
                {monthlyJoins.map(({ month, count }) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="font-inter text-[11px] text-[#999999]">{count || ''}</span>
                    <div className="w-full rounded-sm bg-[#FF3B3B]/20 overflow-hidden" style={{ height: '80px' }}>
                      <div
                        className="w-full bg-[#FF3B3B] rounded-sm transition-all duration-500"
                        style={{ height: `${(count / maxJoins) * 100}%`, marginTop: 'auto' }}
                      />
                    </div>
                    <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[1px]">{month}</span>
                  </div>
                ))}
              </div>
              {monthlyJoins.every(m => m.count === 0) && (
                <p className="font-inter text-[#555555] text-xs text-center mt-2">No members joined in the last 6 months yet.</p>
              )}
            </div>
          </section>

          {/* Member stats */}
          <section>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Membership Health</p>
            <div className="grid grid-cols-3 gap-px bg-[#333333] rounded-sm overflow-hidden">
              {[
                { icon: <Users size={14} />, label: 'Active', value: memberStats.active, color: 'text-[#00D4AA]' },
                { icon: <Clock size={14} />, label: 'Expiring Soon', value: memberStats.expiringSoon, color: 'text-[#FFD60A]' },
                { icon: <TrendingUp size={14} />, label: 'New This Week', value: memberStats.newThisWeek, color: 'text-white' },
              ].map(({ icon, label, value, color }) => (
                <div key={label} className="bg-[#1A1A1A] px-5 py-4">
                  <div className={`flex items-center gap-1.5 mb-2 ${color}`}>{icon}<span className="font-inter text-[10px] tracking-[3px] uppercase">{label}</span></div>
                  <p className={`font-bebas text-3xl tracking-[1px] ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Payout history */}
          <section>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Payout History</p>
            {payouts.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-10 text-center">
                <p className="font-inter text-[#555555] text-sm">No payouts processed yet. Payouts are issued monthly.</p>
              </div>
            ) : (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333333]">
                      {['Period', 'Amount', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p, i) => (
                      <tr key={p.id} className={`hover:bg-[#222222] transition-colors ${i < payouts.length - 1 ? 'border-b border-[#222222]' : ''}`}>
                        <td className="px-5 py-4 font-inter text-sm text-[#999999]">
                          {formatDate(p.period_start)}
                          {p.period_end ? ` — ${formatDate(p.period_end)}` : ''}
                        </td>
                        <td className="px-5 py-4 font-bebas text-xl text-white tracking-[1px]">
                          {fmt(p.amount_paise / 100)}
                        </td>
                        <td className="px-5 py-4">
                          {p.status === 'paid' ? (
                            <span className="flex items-center gap-1.5 font-inter text-xs text-[#00D4AA]">
                              <CheckCircle size={11} /> Paid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 font-inter text-xs text-[#FFD60A]">
                              <Clock size={11} /> Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}
