'use client'

import { useState } from 'react'
import { ExternalLink, Plus, CheckCircle, Clock } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import StatsCard from '@/components/gym-dashboard/StatsCard'
import StreamSetupCard from '@/components/gym-dashboard/StreamSetupCard'
import ScheduleClassModal, { type ScheduledClass } from '@/components/gym-dashboard/ScheduleClassModal'
import GoLiveModal from '@/components/gym-dashboard/GoLiveModal'
import Toast from '@/components/gym-dashboard/Toast'
import { Trash2 } from 'lucide-react'

interface Props {
  gym: any
  ownerName: string
  sessions: any[]
  coaches: any[]
  memberCount: number
  payouts: any[]
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

function StatusBadge({ status }: { status: string }) {
  if (status === 'live') {
    return (
      <span className="font-bebas tracking-[1px] text-[#FF3B3B] text-sm flex items-center gap-1.5">
        ● LIVE
      </span>
    )
  }
  if (status === 'ended') {
    return (
      <span className="font-bebas tracking-[1px] text-[#555555] text-sm">ENDED</span>
    )
  }
  return (
    <span className="font-bebas tracking-[1px] text-white text-sm">SCHEDULED</span>
  )
}

export default function GymDashboardClient({ gym, ownerName, sessions, coaches, memberCount, payouts }: Props) {
  const [localSessions, setLocalSessions] = useState<any[]>(sessions)
  const [showModal, setShowModal] = useState(false)
  const [goLiveSession, setGoLiveSession] = useState<{ id: string; title: string } | null>(null)
  const [toast, setToast] = useState('')

  const completedCount = sessions.filter(s => s.status === 'ended').length
  const scheduledCount = sessions.filter(s => s.status === 'scheduled').length
  const totalRevenue = memberCount * 1499

  function handleScheduled(cls: ScheduledClass) {
    setLocalSessions(p => [cls, ...p])
    setToast('Class scheduled ✓')
  }

  function handleDelete(id: string) {
    setLocalSessions(p => p.filter(c => c.id !== id))
    setToast('Class removed')
  }

  function handleGoLive(id: string) {
    const session = localSessions.find(s => s.id === id)
    if (session) setGoLiveSession({ id, title: session.title })
  }

  function handleWentLive(id: string) {
    setLocalSessions(p => p.map(s => s.id === id ? { ...s, status: 'live' } : s))
    setToast('You\'re live!')
  }

  function handleStreamEnded(id: string) {
    setLocalSessions(p => p.map(s => s.id === id ? { ...s, status: 'ended' } : s))
    setToast('Stream ended')
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Overview" />

      <main className="flex-1 lg:ml-64 min-w-0">

        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#222222] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Dashboard</p>
            <h1 className="font-bebas text-xl text-white tracking-[1px] leading-tight">
              {ownerName.split(' ')[0]} — {gym.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className={`hidden sm:flex items-center gap-1.5 font-inter text-[11px] tracking-[3px] uppercase
              ${gym.status === 'active' ? 'text-[#00D4AA]' : 'text-[#FFD60A]'}`}>
              <span className={`w-1.5 h-1.5 rounded-sm ${gym.status === 'active' ? 'bg-[#00D4AA]' : 'bg-[#FFD60A]'}`} />
              {gym.status === 'active' ? 'ACTIVE' : 'PENDING'}
            </span>
            <a
              href={`/gyms/${gym.slug}`}
              className="hidden sm:flex items-center gap-1.5 font-inter text-[11px] text-[#555555] hover:text-white tracking-[2px] uppercase transition-colors"
            >
              View Page <ExternalLink size={10} />
            </a>
          </div>
        </div>

        <div className="px-6 py-8 space-y-8 max-w-5xl">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Members"
              value={String(memberCount)}
              sub="Active memberships"
            />
            <StatsCard
              label="Revenue (₹)"
              value={`₹${totalRevenue.toLocaleString('en-IN')}`}
              sub="Your 70% share (est.)"
            />
            <StatsCard
              label="Sessions"
              value={String(localSessions.length)}
              sub={`${completedCount} ended · ${scheduledCount} scheduled`}
            />
            <StatsCard
              label="Coaches"
              value={String(coaches.length)}
              sub="On your roster"
            />
          </div>

          {/* Stream Setup */}
          <StreamSetupCard gymId={gym.id} streamKey={gym.stream_key} />

          {/* Sessions */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Sessions</p>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] text-sm px-5 py-2 rounded-sm transition-colors"
              >
                <Plus size={14} /> Schedule Class
              </button>
            </div>

            {localSessions.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-12 text-center">
                <p className="font-inter text-[#555555] text-sm mb-5">No sessions scheduled yet.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] text-sm px-6 py-2.5 rounded-sm transition-colors"
                >
                  Schedule First Class
                </button>
              </div>
            ) : (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#333333]">
                        {['Title', 'Discipline', 'Date / Time', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3 text-left font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {localSessions.map((s: any, i: number) => (
                        <tr
                          key={s.id}
                          className={`hover:bg-[#222222] transition-colors ${i < localSessions.length - 1 ? 'border-b border-[#222222]' : ''}`}
                        >
                          <td className="px-5 py-4 font-inter text-white text-sm font-medium">{s.title}</td>
                          <td className="px-5 py-4">
                            <span className="font-inter text-[11px] text-[#999999] tracking-[2px] uppercase">
                              {s.discipline}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-inter text-[#999999] text-sm whitespace-nowrap">
                            {s.scheduled_at ? formatDateShort(s.scheduled_at) : s.date}
                            {' · '}
                            {s.scheduled_at ? formatTime(s.scheduled_at) : s.time}
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={s.status ?? 'scheduled'} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              {s.status !== 'ended' && (
                                <button
                                  onClick={() => handleGoLive(s.id)}
                                  className="font-bebas tracking-[2px] text-sm bg-white text-black px-3 py-1 rounded-sm hover:bg-[#E5E5E5] transition-colors"
                                >
                                  {s.status === 'live' ? 'MANAGE' : 'GO LIVE'}
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="w-7 h-7 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:border-[#555555] rounded-sm transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile rows */}
                <div className="md:hidden divide-y divide-[#222222]">
                  {localSessions.map((s: any) => (
                    <div key={s.id} className="px-4 py-4 space-y-3 hover:bg-[#222222] transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-inter text-white text-sm font-medium">{s.title}</p>
                          <p className="font-inter text-[#999999] text-xs mt-0.5 tracking-[2px] uppercase">{s.discipline}</p>
                          <p className="font-inter text-[#555555] text-xs mt-0.5">
                            {s.scheduled_at ? formatDateShort(s.scheduled_at) : s.date}
                            {' · '}
                            {s.scheduled_at ? formatTime(s.scheduled_at) : s.time}
                          </p>
                        </div>
                        <StatusBadge status={s.status ?? 'scheduled'} />
                      </div>
                      <div className="flex gap-2">
                        {s.status !== 'ended' && (
                          <button
                            onClick={() => handleGoLive(s.id)}
                            className="font-bebas tracking-[2px] text-sm bg-white text-black px-4 py-1.5 rounded-sm hover:bg-[#E5E5E5] transition-colors"
                          >
                            {s.status === 'live' ? 'MANAGE' : 'GO LIVE'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="flex items-center gap-1.5 border border-[#333333] text-[#555555] hover:text-white font-inter text-xs px-3 py-1.5 rounded-sm transition-all"
                        >
                          <Trash2 size={11} /> Remove
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
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Recent Payouts</p>
            {payouts.length === 0 ? (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-8 text-center">
                <p className="font-inter text-[#555555] text-sm">No payouts yet.</p>
              </div>
            ) : (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333333]">
                      {['Period', 'Amount (70%)', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p: any, i: number) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#222222] transition-colors ${i < payouts.length - 1 ? 'border-b border-[#222222]' : ''}`}
                      >
                        <td className="px-5 py-4 font-inter text-white text-sm">
                          {new Date(p.period_start).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 font-bebas text-white text-xl tracking-[1px]">
                          {formatPaise(p.amount_paise)}
                        </td>
                        <td className="px-5 py-4">
                          {p.status === 'paid' ? (
                            <span className="flex items-center gap-1.5 font-inter text-[#00D4AA] text-xs">
                              <CheckCircle size={12} /> PAID
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 font-inter text-[#FFD60A] text-xs">
                              <Clock size={12} /> PENDING
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

      {showModal && (
        <ScheduleClassModal
          onClose={() => setShowModal(false)}
          onScheduled={handleScheduled}
        />
      )}
      {goLiveSession && (
        <GoLiveModal
          sessionId={goLiveSession.id}
          sessionTitle={goLiveSession.title}
          streamKey={gym.stream_key ?? null}
          onClose={() => setGoLiveSession(null)}
          onWentLive={handleWentLive}
          onEnded={handleStreamEnded}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
