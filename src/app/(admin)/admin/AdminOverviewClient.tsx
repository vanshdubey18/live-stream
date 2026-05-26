'use client'

import { useState } from 'react'
import { Users, Building2, Radio, AlertTriangle, TrendingUp, ExternalLink } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminStatsCard from '@/components/admin/AdminStatsCard'
import RevenueChart from '@/components/admin/RevenueChart'
import ActivityFeed from '@/components/admin/ActivityFeed'

interface Stats {
  memberCount: number
  gymCount: number
  pendingCount: number
  liveCount: number
}

interface Props {
  stats: Stats
  gyms: any[]
  members: any[]
  coupons: any[]
  payouts: any[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminOverviewClient({ stats, gyms, members, payouts }: Props) {
  const [activeTab, setActiveTab] = useState<'gyms' | 'members'>('gyms')

  const recentGyms = gyms.slice(0, 5)
  const recentMembers = members.slice(0, 5)

  const totalRevenuePaise = payouts.reduce((acc: number, p: any) => acc + (p.amount_paise ?? 0), 0)
  const platformCutPaise = Math.round(totalRevenuePaise * 0.3)

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Overview" pendingCount={stats.pendingCount} />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D]  border-b border-[#333333] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Admin</p>
            <h1 className="font-bebas text-2xl text-white tracking-[1px] leading-tight">OVERVIEW</h1>
          </div>
          <a href="/admin/applications"
            className="flex items-center gap-1.5 bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px] text-sm px-4 py-2 rounded-sm transition-colors">
            REVIEW APPLICATIONS
            {stats.pendingCount > 0 && (
              <span className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded-sm ml-0.5">
                {stats.pendingCount}
              </span>
            )}
          </a>
        </div>

        <div className="px-6 py-6 space-y-8 max-w-6xl">

          {/* Pending alert */}
          {stats.pendingCount > 0 && (
            <div className="flex items-center gap-3 bg-[#FFD60A]/5 border border-[#FFD60A]/20 rounded-sm px-5 py-4">
              <AlertTriangle size={18} className="text-[#FFD60A] shrink-0" />
              <div className="flex-1">
                <p className="text-[#FFD60A] font-semibold text-sm">
                  {stats.pendingCount} gym application{stats.pendingCount > 1 ? 's' : ''} awaiting review
                </p>
                <p className="text-[#FFD60A]/60 text-xs mt-0.5">Review and approve or reject pending applications</p>
              </div>
              <a href="/admin/applications"
                className="flex items-center gap-1.5 text-[#FFD60A] text-xs font-semibold hover:text-white transition-colors">
                Review <ExternalLink size={12} />
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AdminStatsCard
              label="Total Members"
              value={String(stats.memberCount)}
              sub="Active memberships"
              icon={<Users size={16} className="text-[#00D4AA]" />}
              trend="up"
            />
            <AdminStatsCard
              label="Active Gyms"
              value={String(stats.gymCount)}
              sub={`${stats.pendingCount} pending approval`}
              icon={<Building2 size={16} className="text-[#999999]" />}
              trend={stats.pendingCount > 0 ? 'neutral' : 'up'}
            />
            <AdminStatsCard
              label="Platform Revenue"
              value={`₹${(platformCutPaise / 100).toLocaleString('en-IN')}`}
              sub="30% cut (all time)"
              icon={<TrendingUp size={16} className="text-[#FF3B3B]" />}
              trend="up"
              highlight
            />
            <AdminStatsCard
              label="Live Now"
              value={String(stats.liveCount)}
              sub="Active streams"
              icon={<Radio size={16} className="text-[#FF3B3B]" />}
              trend={stats.liveCount > 0 ? 'live' : 'neutral'}
            />
          </div>

          {/* Revenue chart */}
          <RevenueChart />

          {/* Gyms + Members tabs */}
          <section>
            <div className="flex items-center gap-1 mb-4 bg-[#1A1A1A] rounded-sm p-1 w-fit">
              {(['gyms', 'members'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-sm font-inter text-sm transition-all capitalize
                    ${activeTab === tab ? 'bg-[#222222] text-white' : 'text-[#555555] hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'gyms' ? (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
                  <h3 className="text-white font-bold text-sm">Recent Gyms</h3>
                  <a href="/admin/gyms" className="text-[#999999] hover:text-white text-xs transition-colors flex items-center gap-1">
                    View all <ExternalLink size={11} />
                  </a>
                </div>
                {recentGyms.length === 0 ? (
                  <div className="px-5 py-10 text-center text-[#999999] text-sm">No gyms yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#333333]">
                        {['Name', 'City', 'Status', 'Joined'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#999999] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F]">
                      {recentGyms.map((g: any) => (
                        <tr key={g.id} className="hover:bg-[#1F1F1F] transition-colors">
                          <td className="px-4 py-3.5 text-white font-semibold">{g.name}</td>
                          <td className="px-4 py-3.5 text-[#999999]">{g.city}</td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-sm
                              ${g.status === 'active' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' :
                                g.status === 'pending' ? 'bg-[#FFD60A]/10 text-[#FFD60A]' :
                                'bg-red-500/10 text-red-400'}`}>
                              {g.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[#999999] text-xs">{formatDate(g.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
                  <h3 className="text-white font-bold text-sm">Recent Members</h3>
                  <a href="/admin/members" className="text-[#999999] hover:text-white text-xs transition-colors flex items-center gap-1">
                    View all <ExternalLink size={11} />
                  </a>
                </div>
                {recentMembers.length === 0 ? (
                  <div className="px-5 py-10 text-center text-[#999999] text-sm">No members yet.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#333333]">
                        {['Name', 'Email', 'Role', 'Joined'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#999999] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F]">
                      {recentMembers.map((m: any) => (
                        <tr key={m.id} className="hover:bg-[#1F1F1F] transition-colors">
                          <td className="px-4 py-3.5 text-white font-semibold">{m.name ?? '—'}</td>
                          <td className="px-4 py-3.5 text-[#999999]">{m.email}</td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-sm
                              ${m.role === 'admin' ? 'bg-[#FF3B3B]/10 text-[#FF3B3B]' :
                                m.role === 'gym_owner' ? 'bg-[#1A1A1A] text-[#999999]' :
                                'bg-[#1A1A1A] text-[#999999]'}`}>
                              {m.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[#999999] text-xs">{formatDate(m.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </section>

          {/* Bottom: Activity feed + Payouts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ActivityFeed />

            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#333333]">
                <h3 className="text-white font-bold text-sm">Recent Payouts</h3>
                <a href="/admin/payouts" className="text-[#999999] hover:text-white text-xs transition-colors flex items-center gap-1">
                  View all <ExternalLink size={11} />
                </a>
              </div>
              {payouts.length === 0 ? (
                <div className="px-5 py-10 text-center text-[#999999] text-sm">No payouts yet.</div>
              ) : (
                <div className="divide-y divide-[#1F1F1F]">
                  {payouts.slice(0, 6).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                      <div>
                        <p className="text-white text-sm font-semibold">{p.gyms?.name ?? 'Unknown Gym'}</p>
                        <p className="text-[#555] text-xs mt-0.5">
                          {new Date(p.period_start).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">₹{(p.amount_paise / 100).toLocaleString('en-IN')}</p>
                        <p className={`text-xs font-semibold mt-0.5 ${p.status === 'paid' ? 'text-[#00D4AA]' : 'text-[#FFD60A]'}`}>
                          {p.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
