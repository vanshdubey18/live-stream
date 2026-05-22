'use client'

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import AdminSidebar from '@/components/layout/AdminSidebar'

const MRR_DATA = [
  { month: 'Oct', mrr: 8000 }, { month: 'Nov', mrr: 15000 }, { month: 'Dec', mrr: 28000 },
  { month: 'Jan', mrr: 45000 }, { month: 'Feb', mrr: 68000 }, { month: 'Mar', mrr: 89000 },
  { month: 'Apr', mrr: 112000 }, { month: 'May', mrr: 142500 },
]

const MEMBER_DATA = [
  { month: 'Oct', new: 8, churned: 0 }, { month: 'Nov', new: 22, churned: 2 },
  { month: 'Dec', new: 31, churned: 4 }, { month: 'Jan', new: 38, churned: 6 },
  { month: 'Feb', new: 42, churned: 5 }, { month: 'Mar', new: 28, churned: 8 },
  { month: 'Apr', new: 24, churned: 6 }, { month: 'May', new: 34, churned: 4 },
]

const DISCIPLINES = [
  { name: 'BJJ', value: 42 }, { name: 'Boxing', value: 28 },
  { name: 'Muay Thai', value: 18 }, { name: 'Wrestling', value: 12 },
]

const DISCIPLINE_COLORS = ['#DC2626', '#60A5FA', '#F59E0B', '#34D399']

const GYM_REVENUE = [
  { gym: 'Xtreme MMA', rev: 47 }, { gym: 'Champion MMA', rev: 38 },
  { gym: 'Gracie Barra', rev: 32 }, { gym: '10th Planet', rev: 28 },
  { gym: 'Combat Club', rev: 22 }, { gym: 'Fight Factory', rev: 18 },
]

const VIEWERSHIP = [
  { day: 'Mon', viewers: 42 }, { day: 'Tue', viewers: 67 }, { day: 'Wed', viewers: 55 },
  { day: 'Thu', viewers: 88 }, { day: 'Fri', viewers: 71 }, { day: 'Sat', viewers: 103 }, { day: 'Sun', viewers: 95 },
]

const tooltipStyle = { backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }
const labelStyle = { color: '#fff', fontWeight: 700 }
const tickStyle = { fill: '#555', fontSize: 11 }
const axisProps = { axisLine: false, tickLine: false }

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-5 text-sm">{title}</h3>
      {children}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar active="Analytics" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Analytics</h1>
        </div>

        <div className="px-6 py-6 max-w-6xl space-y-6">

          {/* MRR Growth */}
          <ChartCard title="MRR Growth — Last 8 Months">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MRR_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={tickStyle} {...axisProps} />
                <YAxis tickFormatter={v => `₹${v / 1000}K`} tick={tickStyle} {...axisProps} width={55} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} formatter={(v) => [`₹${(v as number).toLocaleString('en-IN')}`, 'MRR']} />
                <Line type="monotone" dataKey="mrr" stroke="#DC2626" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Member Growth */}
          <ChartCard title="Member Growth vs Churn">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MEMBER_DATA} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={tickStyle} {...axisProps} />
                <YAxis tick={tickStyle} {...axisProps} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#888' }} />
                <Bar dataKey="new" fill="#DC2626" radius={[4, 4, 0, 0]} name="New Members" />
                <Bar dataKey="churned" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} name="Churned" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Disciplines */}
            <ChartCard title="Members by Discipline">
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={DISCIPLINES} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {DISCIPLINES.map((_, i) => <Cell key={i} fill={DISCIPLINE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {DISCIPLINES.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DISCIPLINE_COLORS[i] }} />
                      <span className="text-[#888888] text-xs">{d.name}</span>
                      <span className="text-white text-xs font-bold ml-auto">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>

            {/* Live viewership */}
            <ChartCard title="Daily Live Viewership (This Week)">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={VIEWERSHIP}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={tickStyle} {...axisProps} />
                  <YAxis tick={tickStyle} {...axisProps} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} />
                  <Line type="monotone" dataKey="viewers" stroke="#60A5FA" strokeWidth={2.5} dot={false} name="Viewers" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Revenue per gym */}
          <ChartCard title="Revenue per Gym This Month (₹ Thousands)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={GYM_REVENUE} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `₹${v}K`} tick={tickStyle} {...axisProps} />
                <YAxis type="category" dataKey="gym" tick={tickStyle} {...axisProps} width={100} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={labelStyle} formatter={(v) => [`₹${v},000`, 'Revenue']} />
                <Bar dataKey="rev" fill="#DC2626" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </main>
    </div>
  )
}
