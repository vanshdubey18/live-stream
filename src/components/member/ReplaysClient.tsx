'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { cfThumbnailUrl } from '@/lib/cf-thumbnail'
import { mockPhotoFor } from '@/lib/mock-replay-photo'

const DISCIPLINES = ['All', 'BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

interface Replay {
  id: string
  title: string
  discipline: string | null
  duration_minutes: number | null
  mux_playback_id: string | null
  cf_video_uid: string | null
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
    <div className="flex-1 min-h-screen bg-[#141410] lg:pl-64">
      <div className="pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Library</p>
            </div>
            <h1 className="font-mincho text-4xl text-[#f0eadc] tracking-[1px]">REPLAYS</h1>
            <p className="font-mincho text-sm text-[#7a7568] mt-1">
              {replays.length} class{replays.length !== 1 ? 'es' : ''} recorded
            </p>
          </div>

          {replays.length === 0 ? (
            /* Empty state */
            <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-20 text-center overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center font-mincho text-[120px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">
                REPLAYS
              </span>
              <p className="relative font-mincho text-[#7a7568] text-sm">
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
                      className={`shrink-0 font-mincho tracking-[2px] text-sm px-4 py-2 transition-colors duration-150 border-b-2 ${
                        discipline === d
                          ? 'text-[#f0eadc] border-[#b3402f]'
                          : 'text-[#7a7568] border-transparent hover:text-[#f0eadc]'
                      }`}
                    >
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Gym selector */}
                {showGymFilter && (
                  <div className="flex items-center gap-2">
                    <p className="font-mincho text-[11px] text-[#7a7568] uppercase tracking-[3px] shrink-0">Gym</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setGymFilter('All')}
                        className={`font-mincho text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                          gymFilter === 'All'
                            ? 'bg-[#1c1c16] border-[#7a7568] text-[#f0eadc]'
                            : 'border-[#322f26] text-[#7a7568] hover:text-[#f0eadc]'
                        }`}
                      >
                        All gyms
                      </button>
                      {gyms.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => setGymFilter(g.id)}
                          className={`font-mincho text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                            gymFilter === g.id
                              ? 'bg-[#1c1c16] border-[#7a7568] text-[#f0eadc]'
                              : 'border-[#322f26] text-[#7a7568] hover:text-[#f0eadc]'
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
                <p className="font-mincho text-[11px] text-[#7a7568] mb-4">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </p>
              )}

              {filtered.length === 0 ? (
                <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-16 text-center overflow-hidden">
                  <span className="absolute inset-0 flex items-center justify-center font-mincho text-[80px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">
                    NONE
                  </span>
                  <p className="relative font-mincho text-[#7a7568] text-sm">No replays match this filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#322f26]">
                  {filtered.map((s, i) => (
                    <ReplayLibraryCard key={s.id} s={s} i={i} showGymFilter={showGymFilter} />
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

function ReplayLibraryCard({ s, i, showGymFilter }: { s: Replay; i: number; showGymFilter: boolean }) {
  const cfThumb = cfThumbnailUrl(s.cf_video_uid)
  const [imgSrc, setImgSrc] = useState<string | null>(cfThumb ?? mockPhotoFor(s.id))

  return (
    <motion.a
      href={`/replay/${s.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.03 }}
      className="bg-[#1c1c16] block group hover:bg-[#242420] transition-colors duration-150"
    >
      {/* Thumbnail */}
      <div className="relative h-36 overflow-hidden bg-[#18180f]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            onError={() => setImgSrc(null)}
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-mincho text-[64px] text-[#f0eadc]/[0.04] leading-none select-none pointer-events-none">
            {s.discipline?.charAt(0) ?? 'M'}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c16] via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <span className="w-9 h-9 rounded-full bg-[#141410]/70 border border-[#f0eadc]/30 flex items-center justify-center backdrop-blur-sm">
            <Play size={14} className="text-[#f0eadc] ml-0.5" fill="currentColor" />
          </span>
        </div>
        <span className="absolute top-2.5 left-2.5 font-mincho text-[9px] text-[#f0eadc] uppercase tracking-[2px] border border-[#f0eadc]/20 bg-[#141410]/70 backdrop-blur-sm px-2 py-0.5 rounded-sm">
          {s.discipline ?? 'BJJ'}
        </span>
      </div>

      {/* Info */}
      <div className="p-5">
        {/* Title */}
        <p className="font-mincho text-lg text-[#f0eadc] leading-tight tracking-[1px] mb-1.5 group-hover:text-[#b3402f] transition-colors duration-150 line-clamp-2">
          {s.title}
        </p>

        {/* Meta */}
        <p className="font-mincho text-xs text-[#7a7568]">
          {s.coaches?.name ?? 'Coach'}
          {s.duration_minutes ? <>&nbsp;·&nbsp;{s.duration_minutes}m</> : null}
          {s.gyms?.name && showGymFilter ? <>&nbsp;·&nbsp;{s.gyms.name}</> : null}
        </p>

        {/* Date */}
        {s.scheduled_at && (
          <p className="font-mincho text-[11px] text-[#635f54] mt-1">
            {new Date(s.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </motion.a>
  )
}
