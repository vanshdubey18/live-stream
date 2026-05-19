'use client'

import { useState } from 'react'
import { TrendingUp, Users, Building2, Radio, DollarSign, Clock, Bell, AlertTriangle } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminStatsCard from '@/components/admin/AdminStatsCard'
import ActivityFeed from '@/components/admin/ActivityFeed'
import RevenueChart from '@/components/admin/RevenueChart'
import TopGymsTable from '@/components/admin/TopGymsTable'

const RANGES = ['Today', 'Week', 'Month']

export default function AdminOverviewPage() {
  const [range, setRange] = useState('Month')

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar active="Overview" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            {/* Range selector */}
            <div className="flex bg-[#111111] border border-white/5 rounded-xl p-1 gap-1">
              {RANGES.map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === r ? 'bg-white/10 text-white' : 'text-[#888888] hover:text-white'}`}>
                  {r}
                </button>
              ))}
            </div>
            {/* Notification bell */}
            <button className="relative w-9 h-9 flex items-center justify-center bg-[#111111] border border-white/5 rounded-xl text-[#888888] hover:text-white transition-colors">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#DC2626] text-white text-[9px] font-black rounded-full flex items-center justify-center">3</span>
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6 max-w-6xl">

          {/* Pending alert */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-yellow-400 shrink-0" />
              <p className="text-white text-sm font-medium">
                <span className="text-yellow-400 font-bold">2 gym applications</span> awaiting review
              </p>
            </div>
            <a href="/admin/applications"
              className="shrink-0 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-xl transition-all">
              Review Applications
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <AdminStatsCard label="Total MRR" value="₹1,42,500" sub="↑ +18% from last month" icon={<TrendingUp size={16} className="text-green-400" />} trend="up" />
            <AdminStatsCard label="Total Members" value="187" sub="+34 this month" icon={<Users size={16} className="text-blue-400" />} trend="up" />
            <AdminStatsCard label="Active Gyms" value="8" sub="2 pending approval" icon={<Building2 size={16} className="text-[#888888]" />} />
            <AdminStatsCard label="Live Right Now" value="2" sub="Classes streaming" icon={<Radio size={16} className="text-[#DC2626]" />} trend="live" highlight />
            <AdminStatsCard label="Platform Cut (30%)" value="₹42,750" sub="This month" icon={<DollarSign size={16} className="text-[#DC2626]" />} highlight />
            <AdminStatsCard label="Hours Streamed" value="234h" sub="This month" icon={<Clock size={16} className="text-[#888888]" />} />
          </div>

          {/* Chart */}
          <RevenueChart />

          {/* Bottom grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopGymsTable />
            <ActivityFeed />
          </div>

        </div>
      </main>
    </div>
  )
}
