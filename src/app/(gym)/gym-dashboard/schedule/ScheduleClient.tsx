'use client'

import { useState } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import ScheduleClassModal, { type ScheduledClass } from '@/components/gym-dashboard/ScheduleClassModal'
import Toast from '@/components/gym-dashboard/Toast'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import { Plus, Radio, Trash2, Clock, CheckCircle, BookMarked } from 'lucide-react'
import { isSessionLive } from '@/lib/session-live'

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
  live: 'text-[#b3402f]',
  scheduled: 'text-[#f0eadc]',
  ended: 'text-[#7a7568]',
}

const DISCIPLINE_DOT: Record<string, string> = {
  BJJ: 'bg-[#f0eadc]',
  Boxing: 'bg-[#a29c8c]',
  'Muay Thai': 'bg-[#FFD60A]',
  Wrestling: 'bg-[#00D4AA]',
  MMA: 'bg-[#b3402f]',
  Kickboxing: 'bg-[#c25040]',
}

export default function ScheduleClient({ gym, sessions, coaches }: Props) {
  const [localSessions, setLocalSessions] = useState<any[]>(
    [...sessions].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  )
  const [showModal, setShowModal] = useState(false)
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

  const liveCount = localSessions.filter(s => isSessionLive(s)).length
  const scheduledCount = localSessions.filter(s => s.status === 'scheduled').length
  const endedCount = localSessions.filter(s => s.status === 'ended').length

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <GymSidebar active="Schedule Classes" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#242420] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-mincho text-xl text-[#f0eadc] tracking-[1px] leading-tight">Schedule</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[3px] text-sm px-5 py-2 rounded-sm transition-colors"
          >
            <Plus size={14} /> Schedule Class
          </button>
        </div>

        <div className="px-6 py-8 max-w-4xl space-y-8">

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-px bg-[#322f26] rounded-sm overflow-hidden">
            {/* First stat — Scheduled — gets the red left-bar accent */}
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#b3402f] z-10" />
              <div className="bg-[#1c1c16] px-5 py-4">
                <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[3px] uppercase mb-1">Scheduled</p>
                <p className="font-mincho text-3xl tracking-[1px] text-[#f0eadc]">{scheduledCount}</p>
              </div>
            </div>
            <div className="bg-[#1c1c16] px-5 py-4">
              <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[3px] uppercase mb-1">Live Now</p>
              <p className="font-mincho text-3xl tracking-[1px] text-[#b3402f]">{liveCount}</p>
            </div>
            <div className="bg-[#1c1c16] px-5 py-4">
              <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[3px] uppercase mb-1">Completed</p>
              <p className="font-mincho text-3xl tracking-[1px] text-[#a29c8c]">{endedCount}</p>
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-1">
            {(['upcoming', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-mincho text-xs rounded-sm capitalize transition-colors ${
                  filter === f ? 'bg-[#f0eadc] text-[#141410]' : 'bg-[#1c1c16] border border-[#322f26] text-[#7a7568] hover:text-[#f0eadc]'
                }`}
              >
                {f === 'upcoming' ? 'Upcoming' : 'All Classes'}
              </button>
            ))}
          </div>

          {/* Calendar list */}
          {days.length === 0 ? (
            <EmptyState ghost="SCHEDULE" message={filter === 'upcoming' ? 'No upcoming classes scheduled.' : 'No classes yet.'}>
              <button
                onClick={() => setShowModal(true)}
                className="bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[3px] text-sm px-6 py-2.5 rounded-sm transition-colors"
              >
                Schedule First Class
              </button>
            </EmptyState>
          ) : (
            <div className="space-y-8">
              {days.map(day => (
                <div key={day}>
                  {/* Day header */}
                  <div className="flex items-center gap-3 mb-3">
                    <p className="font-mincho text-lg text-[#f0eadc] tracking-[1px]">
                      {formatDay(grouped.get(day)![0].scheduled_at)}
                    </p>
                    <div className="flex-1 h-px bg-[#242420]" />
                    <span className="font-mincho text-[11px] text-[#7a7568]">
                      {grouped.get(day)!.length} class{grouped.get(day)!.length > 1 ? 'es' : ''}
                    </span>
                  </div>

                  {/* Classes for this day */}
                  <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden divide-y divide-[#242420]">
                    {grouped.get(day)!.map((s: any) => {
                      const dot = DISCIPLINE_DOT[s.discipline] ?? 'bg-[#7a7568]'
                      const isLive = isSessionLive(s)
                      const isEnded = s.status === 'ended'
                      return (
                        <div key={s.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-[#242420] transition-colors ${isLive ? 'bg-[#b3402f]/5' : ''}`}>
                          {/* Time */}
                          <div className="w-16 shrink-0 text-right">
                            <p className={`font-mincho text-sm ${STATUS_COLOR[s.status] ?? 'text-[#f0eadc]'}`}>
                              {formatTime(s.scheduled_at)}
                            </p>
                          </div>

                          {/* Dot */}
                          <div className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-[#b3402f] live-pulse' : isEnded ? 'bg-[#322f26]' : dot}`} />

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {isLive && (
                                <span className="font-mincho text-[10px] text-[#b3402f] tracking-[3px] uppercase">LIVE</span>
                              )}
                              <p className={`font-mincho text-lg tracking-[1px] truncate ${isEnded ? 'text-[#7a7568]' : 'text-[#f0eadc]'}`}>
                                {s.title}
                              </p>
                            </div>
                            <p className="font-mincho text-xs text-[#7a7568] truncate">
                              {s.discipline}
                              {s.coaches?.name ? ` · ${s.coaches.name}` : ''}
                              {` · ${s.duration_minutes ?? 60}m`}
                              {s.level ? ` · ${s.level}` : ''}
                            </p>
                          </div>

                          {/* Status badge */}
                          <div className="shrink-0">
                            {isEnded && (
                              <span className="flex items-center gap-1 font-mincho text-[11px] text-[#7a7568]">
                                <CheckCircle size={11} /> Done
                              </span>
                            )}
                            {!isEnded && !isLive && (
                              <span className="flex items-center gap-1 font-mincho text-[11px] text-[#a29c8c]">
                                <Clock size={11} /> Scheduled
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {!isEnded && (
                              <a
                                href={`/gym-dashboard/stream?session_id=${s.id}`}
                                className={`flex items-center gap-1.5 font-mincho tracking-[2px] text-sm px-3 py-1.5 rounded-sm transition-colors ${
                                  isLive
                                    ? 'bg-[#b3402f] text-[#f0eadc] hover:bg-[#942f22]'
                                    : 'bg-[#f0eadc] text-[#141410] hover:bg-[#e4dcc8]'
                                }`}
                              >
                                <Radio size={12} />
                                {isLive ? 'MANAGE' : 'GO LIVE'}
                              </a>
                            )}
                            {isEnded && (
                              <Link
                                href={`/gym-dashboard/replay/${s.id}`}
                                className="w-7 h-7 flex items-center justify-center border border-[#322f26] text-[#7a7568] hover:text-[#b3402f] hover:border-[#b3402f] rounded-sm transition-all"
                                title="Edit chapters"
                              >
                                <BookMarked size={12} />
                              </Link>
                            )}
                            {!isLive && (
                              <button
                                onClick={() => handleDelete(s.id)}
                                className="w-7 h-7 flex items-center justify-center border border-[#322f26] text-[#7a7568] hover:text-[#f0eadc] hover:border-[#7a7568] rounded-sm transition-all"
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
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
