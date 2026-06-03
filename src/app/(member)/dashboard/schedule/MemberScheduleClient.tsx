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
  BJJ: '#FF3B3B',
  Boxing: '#FFD60A',
  'Muay Thai': '#00D4AA',
  Wrestling: '#6B7FFF',
  MMA: '#FF6B6B',
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
    <div className="min-h-screen bg-black flex">
      <MemberSidebar active="Schedule" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {/* Header */}
        <div className="border-b border-[#333333] px-6 py-8">
          <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px] mb-2">Your Gyms</p>
          <h1 className="font-bebas text-4xl text-white tracking-[1px]">Class Schedule</h1>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">

          {!hasGyms ? (
            <div className="border border-[#333333] rounded-sm px-6 py-14 text-center">
              <p className="font-inter text-[#555555] text-sm mb-4">You haven't joined a gym yet.</p>
              <a href="/gyms" className="inline-flex items-center gap-2 font-bebas tracking-[3px] text-sm bg-white text-black px-6 py-2.5 rounded-sm hover:bg-[#E5E5E5] transition-colors">
                Browse Gyms <ArrowRight size={13} />
              </a>
            </div>
          ) : sessions.length === 0 ? (
            <div className="border border-[#333333] rounded-sm px-6 py-14 text-center">
              <p className="font-inter text-[#555555] text-sm">No upcoming classes scheduled at your gyms yet.</p>
              <p className="font-inter text-[#444444] text-xs mt-2">Check back soon — your coaches will post new classes here.</p>
            </div>
          ) : (
            days.map(day => (
              <div key={day}>
                {/* Day header */}
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-bebas text-xl text-white tracking-[1px]">
                    {formatDay(grouped.get(day)![0].scheduled_at)}
                  </p>
                  <div className="flex-1 h-px bg-[#222222]" />
                  <span className="font-inter text-[11px] text-[#555555]">
                    {grouped.get(day)!.length} class{grouped.get(day)!.length > 1 ? 'es' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {grouped.get(day)!.map(s => {
                    const isLive = s.status === 'live'
                    const dot = DISCIPLINE_COLOR[s.discipline] ?? '#FF3B3B'
                    return (
                      <a
                        key={s.id}
                        href={`/watch/${s.id}`}
                        className={`group flex items-center gap-4 px-5 py-4 border rounded-sm transition-colors ${
                          isLive
                            ? 'border-[#FF3B3B]/40 bg-[#FF3B3B]/5 hover:bg-[#FF3B3B]/10'
                            : 'border-[#222222] bg-[#0D0D0D] hover:border-[#444444] hover:bg-[#111111]'
                        }`}
                      >
                        {/* Time */}
                        <div className="w-16 shrink-0 text-right">
                          <p className={`font-inter text-sm ${isLive ? 'text-[#FF3B3B]' : 'text-[#999999]'}`}>
                            {formatTime(s.scheduled_at)}
                          </p>
                        </div>

                        {/* Dot */}
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'live-pulse' : ''}`}
                          style={{ backgroundColor: isLive ? '#FF3B3B' : dot }}
                        />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            {isLive && (
                              <span className="flex items-center gap-1 font-inter text-[10px] text-[#FF3B3B] tracking-[3px] uppercase">
                                <Radio size={9} /> Live
                              </span>
                            )}
                            <p className={`font-bebas text-lg tracking-[1px] truncate group-hover:text-[#FF3B3B] transition-colors ${isLive ? 'text-[#FF3B3B]' : 'text-white'}`}>
                              {s.title}
                            </p>
                          </div>
                          <p className="font-inter text-xs text-[#555555] truncate">
                            {s.gyms?.name ?? ''}
                            {s.coaches?.name ? ` · ${s.coaches.name}` : ''}
                            {` · ${s.duration_minutes ?? 60}m`}
                            {s.level ? ` · ${s.level}` : ''}
                          </p>
                        </div>

                        {/* Discipline tag */}
                        <span className="shrink-0 font-inter text-[10px] uppercase tracking-[2px] border border-[#333333] bg-[#1A1A1A] px-2 py-1 rounded-sm text-[#555555]">
                          {s.discipline}
                        </span>

                        <ArrowRight size={14} className="shrink-0 text-[#333333] group-hover:text-white transition-colors" />
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
