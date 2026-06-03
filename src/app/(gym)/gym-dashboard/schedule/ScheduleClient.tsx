'use client'

import { useState } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import ScheduleClassModal, { type ScheduledClass } from '@/components/gym-dashboard/ScheduleClassModal'
import GoLiveModal from '@/components/gym-dashboard/GoLiveModal'
import Toast from '@/components/gym-dashboard/Toast'
import { Plus, Radio, Trash2, Clock, CheckCircle } from 'lucide-react'

interface Coach { id: string; name: string }
interface Props {
  gym: any
  sessions: any[]
  coaches: Coach[]
}

function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function groupByDay(sessions: any[]) {
  const map = new Map<string, any[]>()
  for (const s of sessions) {
    const key = new Date(s.scheduled_at).toDateString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return map
}

const STATUS_COLOR: Record<string, string> = {
  live: 'text-[#FF3B3B]',
  scheduled: 'text-white',
  ended: 'text-[#555555]',
}

const DISCIPLINE_DOT: Record<string, string> = {
  BJJ: 'bg-white',
  Boxing: 'bg-[#999999]',
  'Muay Thai': 'bg-[#FFD60A]',
  Wrestling: 'bg-[#00D4AA]',
  MMA: 'bg-[#FF3B3B]',
  Kickboxing: 'bg-[#FF6B6B]',
}

export default function ScheduleClient({ gym, sessions, coaches }: Props) {
  const [localSessions, setLocalSessions] = useState<any[]>(
    [...sessions].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  )
  const [showModal, setShowModal] = useState(false)
  const [goLiveSession, setGoLiveSession] = useState<{ id: string; title: string } | null>(null)
  const [toast, setToast] = useState('')
  const [filter, setFilter] = useState<'upcoming' | 'all'>('upcoming')

  const displayed = filter === 'upcoming'
    ? localSessions.filter(s => s.status !== 'ended')
    : localSessions

  const grouped = groupByDay(displayed)
  const days = Array.from(grouped.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  function handleScheduled(cls: ScheduledClass) {
    setLocalSessions(p => [...p, cls].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()))
    setToast('Class scheduled ✓')
  }

  async function handleDelete(id: string) {
    await fetch('/api/gym/session', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLocalSessions(p => p.filter(s => s.id !== id))
    setToast('Class removed')
  }

  function handleGoLive(id: string) {
    const s = localSessions.find(s => s.id === id)
    if (s) setGoLiveSession({ id, title: s.title })
  }

  function handleWentLive(id: string) {
    setLocalSessions(p => p.map(s => s.id === id ? { ...s, status: 'live' } : s))
    setToast("You're live!")
  }

  function handleStreamEnded(id: string) {
    setLocalSessions(p => p.map(s => s.id === id ? { ...s, status: 'ended' } : s))
    setToast('Stream ended')
  }

  const liveCount = localSessions.filter(s => s.status === 'live').length
  const scheduledCount = localSessions.filter(s => s.status === 'scheduled').length
  const endedCount = localSessions.filter(s => s.status === 'ended').length

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Schedule Classes" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#222222] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-bebas text-xl text-white tracking-[1px] leading-tight">Schedule</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] text-sm px-5 py-2 rounded-sm transition-colors"
          >
            <Plus size={14} /> Schedule Class
          </button>
        </div>

        <div className="px-6 py-8 max-w-4xl space-y-8">

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-px bg-[#333333] rounded-sm overflow-hidden">
            {[
              { label: 'Scheduled', value: scheduledCount, color: 'text-white' },
              { label: 'Live Now', value: liveCount, color: 'text-[#FF3B3B]' },
              { label: 'Completed', value: endedCount, color: 'text-[#555555]' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#1A1A1A] px-5 py-4">
                <p className="font-inter text-[11px] text-[#999999] tracking-[3px] uppercase mb-1">{label}</p>
                <p className={`font-bebas text-3xl tracking-[1px] ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-1">
            {(['upcoming', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-inter text-xs rounded-sm capitalize transition-colors ${
                  filter === f ? 'bg-white text-black' : 'bg-[#1A1A1A] border border-[#333333] text-[#555555] hover:text-white'
                }`}
              >
                {f === 'upcoming' ? 'Upcoming' : 'All Classes'}
              </button>
            ))}
          </div>

          {/* Calendar list */}
          {days.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-14 text-center">
              <p className="font-inter text-[#555555] text-sm mb-5">
                {filter === 'upcoming' ? 'No upcoming classes scheduled.' : 'No classes yet.'}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] text-sm px-6 py-2.5 rounded-sm transition-colors"
              >
                Schedule First Class
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {days.map(day => (
                <div key={day}>
                  {/* Day header */}
                  <div className="flex items-center gap-3 mb-3">
                    <p className="font-bebas text-lg text-white tracking-[1px]">
                      {formatDay(grouped.get(day)![0].scheduled_at)}
                    </p>
                    <div className="flex-1 h-px bg-[#222222]" />
                    <span className="font-inter text-[11px] text-[#555555]">
                      {grouped.get(day)!.length} class{grouped.get(day)!.length > 1 ? 'es' : ''}
                    </span>
                  </div>

                  {/* Classes for this day */}
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden divide-y divide-[#222222]">
                    {grouped.get(day)!.map((s: any) => {
                      const dot = DISCIPLINE_DOT[s.discipline] ?? 'bg-[#555555]'
                      const isLive = s.status === 'live'
                      const isEnded = s.status === 'ended'
                      return (
                        <div key={s.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-[#222222] transition-colors ${isLive ? 'bg-[#FF3B3B]/5' : ''}`}>
                          {/* Time */}
                          <div className="w-16 shrink-0 text-right">
                            <p className={`font-inter text-sm ${STATUS_COLOR[s.status] ?? 'text-white'}`}>
                              {formatTime(s.scheduled_at)}
                            </p>
                          </div>

                          {/* Dot */}
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-[#FF3B3B] live-pulse' : isEnded ? 'bg-[#333333]' : dot}`} />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {isLive && (
                                <span className="font-inter text-[10px] text-[#FF3B3B] tracking-[3px] uppercase">LIVE</span>
                              )}
                              <p className={`font-bebas text-lg tracking-[1px] truncate ${isEnded ? 'text-[#555555]' : 'text-white'}`}>
                                {s.title}
                              </p>
                            </div>
                            <p className="font-inter text-xs text-[#555555] truncate">
                              {s.discipline}
                              {s.coaches?.name ? ` · ${s.coaches.name}` : ''}
                              {` · ${s.duration_minutes ?? 60}m`}
                              {s.level ? ` · ${s.level}` : ''}
                            </p>
                          </div>

                          {/* Status badge */}
                          <div className="shrink-0">
                            {isEnded && (
                              <span className="flex items-center gap-1 font-inter text-[11px] text-[#555555]">
                                <CheckCircle size={11} /> Done
                              </span>
                            )}
                            {!isEnded && !isLive && (
                              <span className="flex items-center gap-1 font-inter text-[11px] text-[#999999]">
                                <Clock size={11} /> Scheduled
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!isEnded && (
                              <button
                                onClick={() => handleGoLive(s.id)}
                                className={`flex items-center gap-1.5 font-bebas tracking-[2px] text-sm px-3 py-1.5 rounded-sm transition-colors ${
                                  isLive
                                    ? 'bg-[#FF3B3B] text-white hover:bg-[#cc2f2f]'
                                    : 'bg-white text-black hover:bg-[#E5E5E5]'
                                }`}
                              >
                                <Radio size={12} />
                                {isLive ? 'MANAGE' : 'GO LIVE'}
                              </button>
                            )}
                            {!isLive && (
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="w-7 h-7 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:border-[#555555] rounded-sm transition-all"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <ScheduleClassModal
          coaches={coaches}
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
