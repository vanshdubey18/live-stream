'use client'

import { useState } from 'react'
import { Search, MapPin, CheckCircle, ChevronRight } from 'lucide-react'
import MemberSidebar from '@/components/layout/MemberSidebar'

const ALL_DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
  MMA: 'bg-[#DC2626]/10 text-[#DC2626]',
  Kickboxing: 'bg-purple-500/10 text-purple-400',
  Judo: 'bg-pink-500/10 text-pink-400',
  Sambo: 'bg-teal-500/10 text-teal-400',
}

interface Props {
  gyms: any[]
  joinedGymIds: string[]
  isLoggedIn: boolean
}

export default function BrowseGymsClient({ gyms, joinedGymIds }: Props) {
  const [search, setSearch] = useState('')
  const [activeDiscipline, setActiveDiscipline] = useState('')

  const filtered = gyms.filter(g => {
    const matchesSearch =
      !search ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.city?.toLowerCase().includes(search.toLowerCase())
    const matchesDiscipline =
      !activeDiscipline || (g.disciplines ?? []).includes(activeDiscipline)
    return matchesSearch && matchesDiscipline
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <MemberSidebar active="Browse Gyms" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Browse Gyms</h1>
        </div>

        <div className="px-6 py-6 max-w-5xl space-y-6">

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search gyms or cities…"
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/40 transition-colors"
              />
            </div>
          </div>

          {/* Discipline pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveDiscipline('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${!activeDiscipline ? 'bg-white/10 border-white/20 text-white' : 'border-white/10 text-[#555] hover:text-[#888]'}`}>
              All
            </button>
            {ALL_DISCIPLINES.map(d => (
              <button
                key={d}
                onClick={() => setActiveDiscipline(d === activeDiscipline ? '' : d)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${activeDiscipline === d
                    ? (DISCIPLINE_COLORS[d] ?? 'bg-white/10 text-white') + ' border-current'
                    : 'border-white/10 text-[#555] hover:text-[#888]'}`}>
                {d}
              </button>
            ))}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="bg-[#111111] border border-white/5 rounded-2xl px-6 py-16 text-center">
              <p className="text-[#888888] text-sm">No gyms match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(g => {
                const isJoined = joinedGymIds.includes(g.id)
                return (
                  <a
                    key={g.id}
                    href={`/gyms/${g.slug}`}
                    className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-white/15 transition-all flex flex-col gap-4 group">
                    {/* Logo / initial */}
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#DC2626]/15 flex items-center justify-center">
                        <span className="text-[#DC2626] font-black text-lg">{g.name[0]}</span>
                      </div>
                      {isJoined && (
                        <span className="flex items-center gap-1 text-green-400 text-xs font-semibold bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                          <CheckCircle size={11} /> Joined
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-white font-bold text-base group-hover:text-[#DC2626] transition-colors">{g.name}</h3>
                      {g.city && (
                        <p className="text-[#888888] text-xs flex items-center gap-1 mt-1">
                          <MapPin size={11} /> {g.city}{g.location ? `, ${g.location}` : ''}
                        </p>
                      )}
                      {g.description && (
                        <p className="text-[#555] text-xs mt-2 line-clamp-2">{g.description}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {(g.disciplines ?? []).slice(0, 4).map((d: string) => (
                        <span key={d} className={`text-xs font-medium px-2 py-0.5 rounded-full ${DISCIPLINE_COLORS[d] ?? 'bg-white/5 text-white/60'}`}>
                          {d}
                        </span>
                      ))}
                      {(g.disciplines?.length ?? 0) > 4 && (
                        <span className="text-xs text-[#555] px-2 py-0.5">+{g.disciplines.length - 4}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[#DC2626] text-xs font-semibold">
                      View gym <ChevronRight size={13} />
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
