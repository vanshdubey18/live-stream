'use client'

import MemberSidebar from '@/components/layout/MemberSidebar'
import { ArrowRight, Radio } from 'lucide-react'

interface Session {
  id: string
  title: string
  discipline: string
  scheduled_at: string
  duration_minutes: number | null
  level: string | null
  status: string
  coaches: { name: string } | null
  gyms: { name: string } | null
}

interface Props {
  sessions: Session[]
  hasGyms: boolean
}

const DISCIPLINE_COLOR: Record<string, string> = {
  BJJ: '#b3402f',
  Boxing: '#FFD60A',
  'Muay Thai': '#00D4AA',
  Wrestling: '#6B7FFF',
  MMA: '#c25040',
  Kickboxing: '#FF9500',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDay(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

function groupByDay(sessions: Session[]) {
  const map = new Map<string, Session[]>()
  for (const s of sessions) {
    const key = new Date(s.scheduled_at).toDateString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return map
}

export default function MemberScheduleClient({ sessions, hasGyms }: Props) {
  const grouped = groupByDay(sessions)
  const days = Array.from(grouped.keys())

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <MemberSidebar active="Schedule" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {/* Header */}
        <div className="border-b border-[#322f26] px-6 py-8">
          <p className="font-mincho text-[11px] text-[#a29c8c] uppercase tracking-[4px] mb-2">Your Gyms</p>
          <h1 className="font-mincho text-4xl text-[#f0eadc] tracking-[1px]">Class Schedule</h1>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">

          {!hasGyms ? (
            <div className="border border-[#322f26] rounded-sm px-6 py-14 text-center">
              <p className="font-mincho text-[#7a7568] text-sm mb-4">You haven't joined a gym yet.</p>
              <a href="/gyms" className="inline-flex items-center gap-2 font-mincho tracking-[3px] text-sm bg-[#f0eadc] text-[#141410] px-6 py-2.5 rounded-sm hover:bg-[#e4dcc8] transition-colors">
                Browse Gyms <ArrowRight size={13} />
              </a>
            </div>
          ) : sessions.length === 0 ? (
            <div className="border border-[#322f26] rounded-sm px-6 py-14 text-center">
              <p className="font-mincho text-[#7a7568] text-sm">No upcoming classes scheduled at your gyms yet.</p>
              <p className="font-mincho text-[#635f54] text-xs mt-2">Check back soon — your coaches will post new classes here.</p>
            </div>
          ) : (
            days.map(day => (
              <div key={day}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-mincho text-xl text-[#f0eadc] tracking-[1px]">
                    {formatDay(grouped.get(day)![0].scheduled_at)}
                  </p>
                  <div className="flex-1 h-px bg-[#242420]" />
                  <span className="font-mincho text-[11px] text-[#7a7568]">
                    {grouped.get(day)!.length} class{grouped.get(day)!.length > 1 ? 'es' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {grouped.get(day)!.map(s => {
                    const isLive = s.status === 'live'
                    const dot = DISCIPLINE_COLOR[s.discipline] ?? '#b3402f'
                    return (
                      <a
                        key={s.id}
                        href={`/watch/${s.id}`}
                        className={`group flex items-center gap-4 px-5 py-4 border rounded-sm transition-colors ${
                          isLive
                            ? 'border-[#b3402f]/40 bg-[#b3402f]/5 hover:bg-[#b3402f]/10'
                            : 'border-[#242420] bg-[#141410] hover:border-[#635f54] hover:bg-[#18180f]'
                        }`}
                      >
                        {/* Time */}
                        <div className="w-16 shrink-0 text-right">
                          <p className={`font-mincho text-sm ${isLive ? 'text-[#b3402f]' : 'text-[#a29c8c]'}`}>
                            {formatTime(s.scheduled_at)}
                          </p>
                        </div>

                        {/* Dot */}
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'live-pulse' : ''}`}
                          style={{ backgroundColor: isLive ? '#b3402f' : dot }}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {isLive && (
                              <span className="flex items-center gap-1 font-mincho text-[10px] text-[#b3402f] tracking-[3px] uppercase">
                                <Radio size={9} /> Live
                              </span>
                            )}
                            <p className={`font-mincho text-lg tracking-[1px] truncate group-hover:text-[#b3402f] transition-colors ${isLive ? 'text-[#b3402f]' : 'text-[#f0eadc]'}`}>
                              {s.title}
                            </p>
                          </div>
                          <p className="font-mincho text-xs text-[#7a7568] truncate">
                            {s.gyms?.name ?? ''}
                            {s.coaches?.name ? ` · ${s.coaches.name}` : ''}
                            {` · ${s.duration_minutes ?? 60}m`}
                            {s.level ? ` · ${s.level}` : ''}
                          </p>
                        </div>

                        {/* Discipline tag */}
                        <span className="shrink-0 font-mincho text-[10px] uppercase tracking-[2px] border border-[#322f26] bg-[#1c1c16] px-2 py-1 rounded-sm text-[#7a7568]">
                          {s.discipline}
                        </span>

                        <ArrowRight size={14} className="shrink-0 text-[#322f26] group-hover:text-[#f0eadc] transition-colors" />
                      </a>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
