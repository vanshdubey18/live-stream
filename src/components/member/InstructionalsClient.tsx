'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, GraduationCap, Clock } from 'lucide-react'
import { cfThumbnailUrl } from '@/lib/cf-thumbnail'
import { mockPhotoFor } from '@/lib/mock-replay-photo'

const DISCIPLINES = ['All', 'BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

interface Module {
  id: string
  title: string
  description: string | null
  discipline: string | null
  level: string | null
  price_paise: number
  thumbnail_uid: string | null
  duration_seconds: number | null
  gym_id: string
}

interface Gym { id: string; name: string }

interface Props {
  modules: Module[]
  gyms: Gym[]
  ownedIds: string[]
}

export default function InstructionalsClient({ modules, gyms, ownedIds }: Props) {
  const [discipline, setDiscipline] = useState('All')
  const [gymFilter, setGymFilter] = useState('All')
  const owned = new Set(ownedIds)

  const filtered = modules.filter((m) => {
    if (discipline !== 'All' && m.discipline !== discipline) return false
    if (gymFilter !== 'All' && m.gym_id !== gymFilter) return false
    return true
  })

  const showGymFilter = gyms.length > 1

  return (
    <div className="flex-1 min-h-screen bg-[#141410] lg:pl-64">
      <div className="pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-6 py-8">

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Library</p>
            </div>
            <h1 className="font-mincho text-4xl text-[#f0eadc] tracking-[1px]">INSTRUCTIONALS</h1>
            <p className="font-mincho text-sm text-[#7a7568] mt-1">
              {modules.length} technique breakdown{modules.length !== 1 ? 's' : ''} to own
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-20 text-center overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center font-mincho text-[110px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">
                MODULE
              </span>
              <p className="relative font-mincho text-[#7a7568] text-sm">
                No instructionals available yet. Check back once your gym uploads one.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-0 overflow-x-auto pb-1 -mx-1 px-1">
                  {DISCIPLINES.filter(d => d === 'All' || modules.some(m => m.discipline === d)).map((d) => (
                    <button key={d} onClick={() => setDiscipline(d)}
                      className={`shrink-0 font-mincho tracking-[2px] text-sm px-4 py-2 transition-colors duration-150 border-b-2 ${
                        discipline === d ? 'text-[#f0eadc] border-[#b3402f]' : 'text-[#7a7568] border-transparent hover:text-[#f0eadc]'
                      }`}>
                      {d.toUpperCase()}
                    </button>
                  ))}
                </div>

                {showGymFilter && (
                  <div className="flex items-center gap-2">
                    <p className="font-mincho text-[11px] text-[#7a7568] uppercase tracking-[3px] shrink-0">Gym</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => setGymFilter('All')}
                        className={`font-mincho text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                          gymFilter === 'All' ? 'bg-[#1c1c16] border-[#7a7568] text-[#f0eadc]' : 'border-[#322f26] text-[#7a7568] hover:text-[#f0eadc]'
                        }`}>All gyms</button>
                      {gyms.map((g) => (
                        <button key={g.id} onClick={() => setGymFilter(g.id)}
                          className={`font-mincho text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                            gymFilter === g.id ? 'bg-[#1c1c16] border-[#7a7568] text-[#f0eadc]' : 'border-[#322f26] text-[#7a7568] hover:text-[#f0eadc]'
                          }`}>{g.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-16 text-center overflow-hidden">
                  <p className="relative font-mincho text-[#7a7568] text-sm">No instructionals match this filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#322f26]">
                  {filtered.map((m, i) => (
                    <ModuleCard key={m.id} m={m} i={i} owned={owned.has(m.id)} />
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

function ModuleCard({ m, i, owned }: { m: Module; i: number; owned: boolean }) {
  const cfThumb = cfThumbnailUrl(m.thumbnail_uid)
  const [imgSrc, setImgSrc] = useState<string | null>(cfThumb ?? mockPhotoFor(m.id))

  return (
    <motion.a
      href={`/instructional/${m.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.03 }}
      className="bg-[#1c1c16] block group hover:bg-[#242420] transition-colors duration-150"
    >
      <div className="relative h-36 overflow-hidden bg-[#18180f]">
        {imgSrc ? (
          <img src={imgSrc} alt="" onError={() => setImgSrc(null)}
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <GraduationCap size={28} className="text-[#f0eadc]/10" />
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c16] via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <span className="w-9 h-9 rounded-full bg-[#141410]/70 border border-[#f0eadc]/30 flex items-center justify-center backdrop-blur-sm">
            <Play size={14} className="text-[#f0eadc] ml-0.5" fill="currentColor" />
          </span>
        </div>
        <span className="absolute top-2.5 left-2.5 font-mincho text-[9px] text-[#f0eadc] uppercase tracking-[2px] border border-[#f0eadc]/20 bg-[#141410]/70 backdrop-blur-sm px-2 py-0.5 rounded-sm">
          {m.discipline ?? 'BJJ'}
        </span>
        {owned && (
          <span className="absolute top-2.5 right-2.5 font-mincho text-[9px] text-[#00D4AA] uppercase tracking-[2px] border border-[#00D4AA]/30 bg-[#141410]/70 backdrop-blur-sm px-2 py-0.5 rounded-sm">
            Owned
          </span>
        )}
      </div>

      <div className="p-5">
        <p className="font-mincho text-lg text-[#f0eadc] leading-tight tracking-[1px] mb-1.5 group-hover:text-[#b3402f] transition-colors duration-150 line-clamp-2">
          {m.title}
        </p>
        <p className="font-mincho text-xs text-[#7a7568]">
          {m.level ?? 'All levels'}
          {m.duration_seconds ? <>&nbsp;·&nbsp;{Math.round(m.duration_seconds / 60)}m</> : null}
        </p>
        <div className="flex items-center justify-between mt-3">
          {owned ? (
            <span className="font-mincho text-xs text-[#00D4AA] tracking-[2px] uppercase">▸ Watch</span>
          ) : (
            <span className="font-mincho text-sm text-[#f0eadc]">₹{(m.price_paise / 100).toLocaleString('en-IN')}</span>
          )}
          {!owned && (
            <span className="flex items-center gap-1 font-mincho text-[10px] text-[#635f54]">
              <Clock size={10} /> Buy once, watch forever
            </span>
          )}
        </div>
      </div>
    </motion.a>
  )
}
