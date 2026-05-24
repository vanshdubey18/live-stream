'use client'

import { useState } from 'react'
import { Users, TrendingUp, CalendarDays, Radio, ExternalLink, Plus, CheckCircle, Clock } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import StatsCard from '@/components/gym-dashboard/StatsCard'
import StreamSetupCard from '@/components/gym-dashboard/StreamSetupCard'
import ScheduleClassModal, { type ScheduledClass } from '@/components/gym-dashboard/ScheduleClassModal'
import Toast from '@/components/gym-dashboard/Toast'
import { Radio as RadioIcon, Trash2 } from 'lucide-react'

interface Props {
  gym: any
  ownerName: string
  sessions: any[]
  coaches: any[]
  memberCount: number
  payouts: any[]
}

const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatPaise(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

export default function GymDashboardClient({ gym, ownerName, sessions, coaches, memberCount, payouts }: Props) {
  const [localSessions, setLocalSessions] = useState<any[]>(sessions)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  const completedCount = sessions.filter(s => s.status === 'ended').length
  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length

  function handleScheduled(cls: ScheduledClass) {
    setLocalSessions(p => [cls, ...p])
    setToast('Class scheduled ✓')
  }

  function handleDelete(id: string) {
    setLocalSessions(p => p.filter(c => c.id !== id))
    setToast('Class removed')
  }

  function handleGoLive(_id: string) {
    setToast('Going live… (Mux integration coming soon)')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <GymSidebar active="Overview" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Welcome, {ownerName.split(' ')[0]}
            </h1>
            <p className="text-[#888888] text-xs">{gym.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border
              ${gym.status === 'active'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${gym.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              {gym.status === 'active' ? 'Active' : 'Pending'}
            </span>
            <a href={`/gyms/${gym.slug}`}
              className="hidden sm:flex items-center gap-1.5 text-[#888888] hover:text-white text-xs transition-colors">
              View gym page <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8 max-w-5xl">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Total Members" value={String(memberCount)}
              sub="Active memberships"
              icon={<Users size={18} className="text-green-400" />} />
            <StatsCard label="This Month Revenue"
              value={`₹${(memberCount * 1499).toLocaleString('en-IN')}`}
              sub="Your 70% share (est.)"
              icon={<TrendingUp size={18} className="text-[#DC2626]" />}
              accent />
            <StatsCard label="Sessions This Week"
              value={String(localSessions.length)}
              sub={`${completedCount} completed, ${scheduledCount} scheduled`}
              icon={<CalendarDays size={18} className="text-[#888888]" />} />
            <StatsCard label="Coaches"
              value={String(coaches.length)}
              sub="On your roster"
              icon={<Radio size={18} className="text-[#888888]" />} />
          </div>

          {/* Stream Setup */}
          <StreamSetupCard gymId={gym.id} streamKey={gym.stream_key} />

          {/* Upcoming Classes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Sessions</h2>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 bg-[#DC2626] hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                <Plus size={15} /> Schedule New Class
              </button>
            </div>

            {localSessions.length === 0 ? (
              <div className="bg-[#111111] border border-white/5 rounded-2xl px-6 py-12 text-center">
                <p className="text-[#888888] text-sm mb-4">No sessions yet.</p>
                <button onClick={() => setShowModal(true)}
                  className="bg-[#DC2626] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                  Schedule your first class
                </button>
              </div>
            ) : (
              <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Date', 'Time', 'Title', 'Discipline', 'Coach', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#888888] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {localSessions.map((s: any) => (
                        <tr key={s.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3.5 text-white font-medium whitespace-nowrap">
                            {s.scheduled_at ? formatDateShort(s.scheduled_at) : s.date}
                          </td>
                          <td className="px-4 py-3.5 text-[#888888] whitespace-nowrap">
                            {s.scheduled_at ? formatTime(s.scheduled_at) : s.time}
                          </td>
                          <td className="px-4 py-3.5 text-white font-medium">{s.title}</td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DISCIPLINE_COLORS[s.discipline] ?? 'bg-white/5 text-white/60'}`}>
                              {s.discipline}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[#888888]">
                            {s.coaches?.name ?? s.coach ?? '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            {s.status === 'live' ? (
                              <span className="flex items-center gap-1.5 text-[#DC2626] text-xs font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" /> Live
                              </span>
                            ) : s.status === 'ended' ? (
                              <span className="text-[#555] text-xs">Ended</span>
                            ) : (
                              <span className="text-[#888888] text-xs bg-white/5 px-2 py-0.5 rounded-full">Scheduled</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {s.status !== 'ended' && (
                                <button onClick={() => handleGoLive(s.id)}
                                  className="flex items-center gap-1.5 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                                  <RadioIcon size={12} /> Go Live
                                </button>
                              )}
                              <button onClick={() => handleDelete(s.id)}
                                className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-white/5">
                  {localSessions.map((s: any) => (
                    <div key={s.id} className="px-4 py-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-white font-semibold text-sm">{s.title}</p>
                          <p className="text-[#888888] text-xs mt-0.5">
                            {s.coaches?.name ?? s.coach} · {s.scheduled_at ? formatDateShort(s.scheduled_at) : s.date} {s.scheduled_at ? formatTime(s.scheduled_at) : s.time}
                          </p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${DISCIPLINE_COLORS[s.discipline] ?? 'bg-white/5 text-white/60'}`}>
                          {s.discipline}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleGoLive(s.id)}
                          className="flex items-center gap-1.5 bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold px-3 py-1.5 rounded-lg">
                          <RadioIcon size={11} /> Go Live
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          className="flex items-center gap-1.5 text-[#555] hover:text-red-400 text-xs px-2 py-1.5 rounded-lg">
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Payouts */}
          <section>
            <h2 className="text-white font-bold text-lg mb-4">Recent Payouts</h2>
            {payouts.length === 0 ? (
              <div className="bg-[#111111] border border-white/5 rounded-2xl px-6 py-8 text-center">
                <p className="text-[#888888] text-sm">No payouts yet.</p>
              </div>
            ) : (
              <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Period', 'Amount (70%)', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#888888] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payouts.map((p: any) => (
                      <tr key={p.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3.5 text-white font-medium">
                          {new Date(p.period_start).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5 text-white font-bold">{formatPaise(p.amount_paise)}</td>
                        <td className="px-4 py-3.5">
                          {p.status === 'paid'
                            ? <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold"><CheckCircle size={13} /> Paid</span>
                            : <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-semibold"><Clock size={13} /> Pending</span>}
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

      {showModal && (
        <ScheduleClassModal
          onClose={() => setShowModal(false)}
          onScheduled={handleScheduled}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
