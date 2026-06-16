'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

const DISCIPLINES = ['All', 'BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

interface Replay {
  id: string
  title: string
  discipline: string | null
  duration_minutes: number | null
  mux_playback_id: string | null
  scheduled_at: string | null
  gym_id: string
  level: string | null
  coaches: { name: string } | null
  gyms: { id: string; name: string } | null
}

interface Gym {
  id: string
  name: string
}

interface ReplaysClientProps {
  replays: Replay[]
  gyms: Gym[]
}

export default function ReplaysClient({ replays, gyms }: ReplaysClientProps) {
  const [discipline, setDiscipline] = useState('All')
  const [gymFilter, setGymFilter] = useState('All')

  const filtered = replays.filter((r) => {
    if (discipline !== 'All' && r.discipline !== discipline) return false
    if (gymFilter !== 'All' && r.gym_id !== gymFilter) return false
    return true
  })

  // Only show gym selector when member belongs to multiple gyms
  const showGymFilter = gyms.length > 1

  return (
    <div className="flex-1 min-h-screen bg-[#0D0D0D] lg:pl-64">
      <div className="pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px bg-[#FF3B3B]" />
              <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Library</p>
            </div>
            <h1 className="font-bebas text-4xl text-white tracking-[1px]">REPLAYS</h1>
            <p className="font-inter text-sm text-[#555555] mt-1">
              {replays.length} class{replays.length !== 1 ? 'es' : ''} recorded
            </p>
          </div>

          {replays.length === 0 ? (
            /* Empty state */
            <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-20 text-center overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center font-bebas text-[120px] text-white/[0.03] leading-none select-none pointer-events-none">
                REPLAYS
              </span>
              <p className="relative font-inter text-[#555555] text-sm">
                No recorded classes yet. Check back after a live session ends.
              </p>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="mb-6 space-y-3">
                {/* Discipline tabs */}
                <div className="flex items-center gap-0 overflow-x-auto pb-1 -mx-1 px-1">
                  {DISCIPLINES.filter(d => d === 'All' || replays.some(r => r.discipline === d)).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiscipline(d)}
                      className={`shrink-0 font-bebas tracking-[2px] text-sm px-4 py-2 transition-colors duration-150 border-b-2 ${
                        discipline === d
                          ? 'text-white border-[#FF3B3B]'
                          : 'text-[#555555] border-transparent hover:text-white'
                      }`}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Gym selector */}
                {showGymFilter && (
                  <div className="flex items-center gap-2">
                    <p className="font-inter text-[11px] text-[#555555] uppercase tracking-[3px] shrink-0">Gym</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setGymFilter('All')}
                        className={`font-inter text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                          gymFilter === 'All'
                            ? 'bg-[#1A1A1A] border-[#555555] text-white'
                            : 'border-[#333333] text-[#555555] hover:text-white'
                        }`}
                      >
                        All gyms
                      </button>
                      {gyms.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setGymFilter(g.id)}
                          className={`font-inter text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                            gymFilter === g.id
                              ? 'bg-[#1A1A1A] border-[#555555] text-white'
                              : 'border-[#333333] text-[#555555] hover:text-white'
                          }`}
                        >
                          {g.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Results count */}
              {(discipline !== 'All' || gymFilter !== 'All') && (
                <p className="font-inter text-[11px] text-[#555555] mb-4">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </p>
              )}

              {filtered.length === 0 ? (
                <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center overflow-hidden">
                  <span className="absolute inset-0 flex items-center justify-center font-bebas text-[80px] text-white/[0.03] leading-none select-none pointer-events-none">
                    NONE
                  </span>
                  <p className="relative font-inter text-[#555555] text-sm">No replays match this filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#333333]">
                  {filtered.map((s, i) => (
                    <motion.a
                      key={s.id}
                      href={`/replay/${s.id}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.03 }}
                      className="bg-[#1A1A1A] p-5 block group hover:bg-[#222222] transition-colors duration-150"
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[2px] border border-[#333333] bg-[#222222] group-hover:bg-[#2A2A2A] px-2 py-0.5 rounded-sm transition-colors">
                          {s.discipline ?? 'BJJ'}
                        </span>
                        <div className="w-7 h-7 rounded-sm bg-[#222222] group-hover:bg-[#FF3B3B]/10 border border-[#333333] group-hover:border-[#FF3B3B]/20 flex items-center justify-center transition-colors duration-150">
                          <Play size={11} className="text-[#555555] group-hover:text-[#FF3B3B] transition-colors duration-150 translate-x-px" />
                        </div>
                      </div>

                      {/* Title */}
                      <p className="font-bebas text-lg text-white leading-tight tracking-[1px] mb-1.5 group-hover:text-[#FF3B3B] transition-colors duration-150 line-clamp-2">
                        {s.title}
                      </p>

                      {/* Meta */}
                      <p className="font-inter text-xs text-[#555555]">
                        {s.coaches?.name ?? 'Coach'}
                        {s.duration_minutes ? <>&nbsp;·&nbsp;{s.duration_minutes}m</> : null}
                        {s.gyms?.name && showGymFilter ? <>&nbsp;·&nbsp;{s.gyms.name}</> : null}
                      </p>

                      {/* Date */}
                      {s.scheduled_at && (
                        <p className="font-inter text-[11px] text-[#444444] mt-1">
                          {new Date(s.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </motion.a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
