'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import MemberSidebar from '@/components/layout/MemberSidebar'
import EmptyState from '@/components/ui/EmptyState'
import { isSessionLive } from '@/lib/session-live'

const ALL_DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

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
    <div className="min-h-screen bg-[#141410] flex">
      <MemberSidebar active="Browse Gyms" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top nav bar */}
        <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#242420] px-6 h-14 flex items-center mt-14 lg:mt-0">
          <span className="font-mincho text-[11px] text-[#7a7568] tracking-[4px] uppercase">Member Portal</span>
        </div>

        <div className="px-6 py-8 max-w-5xl space-y-8">

          {/* Page header */}
          <div>
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-2">Discover</p>
            <h1 className="font-mincho text-4xl text-[#f0eadc] tracking-wide">FIND YOUR GYM</h1>
          </div>

          {/* Search input */}
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a7568]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gyms or cities…"
              className="w-full bg-[#1c1c16] border border-[#322f26] rounded-sm pl-10 pr-4 py-2.5 text-[#f0eadc] placeholder-[#7a7568] font-mincho text-sm focus:outline-none focus:border-[#635f54] transition-colors"
            />
          </div>

          {/* Discipline filter tabs */}
          <div className="flex overflow-x-auto gap-0 pb-1 scrollbar-none -mx-6 px-6 sm:mx-0 sm:px-0 sm:flex-wrap">
            {['All', ...ALL_DISCIPLINES].map(d => {
              const isActive = d === 'All' ? !activeDiscipline : activeDiscipline === d
              return (
                <button
                  key={d}
                  onClick={() => setActiveDiscipline(d === 'All' ? '' : (d === activeDiscipline ? '' : d))}
                  className={`shrink-0 mr-5 sm:mr-6 pb-2 font-mincho text-sm transition-colors border-b-2 ${
                    isActive
                      ? 'text-[#f0eadc] border-[#b3402f]'
                      : 'text-[#7a7568] border-transparent hover:text-[#7a7568]'
                  }`}
                >
                  {d}
                </button>
              )
            })}
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <EmptyState ghost="TRAIN" message="No gyms match your search." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(g => {
                const isJoined = joinedGymIds.includes(g.id)
                const disciplines: string[] = g.disciplines ?? []
                const isLive = (g.sessions ?? []).some((s: any) => isSessionLive(s))

                return (
                  <a
                    key={g.id}
                    href={`/gyms/${g.slug}`}
                    className={`bg-[#1c1c16] rounded-sm p-5 transition-all flex flex-col gap-4 group ${
                      isLive
                        ? 'border border-[#b3402f]/50 shadow-[0_0_0_1px_rgba(255,59,59,0.1),0_0_28px_rgba(255,59,59,0.08)] hover:border-[#b3402f]/70'
                        : 'border border-[#322f26] hover:bg-[#242420] hover:border-[#b3402f]/40'
                    }`}
                  >
                    {/* Top row: live badge + joined */}
                    <div className="flex items-center justify-between min-h-[20px]">
                      {isLive ? (
                        <span className="font-mincho text-xs text-[#b3402f] tracking-[1px]">
                          ● LIVE NOW
                        </span>
                      ) : (
                        <span />
                      )}
                      {isJoined && (
                        <span className="font-mincho text-xs text-[#00D4AA] tracking-[1px]">
                          ● ACTIVE MEMBER
                        </span>
                      )}
                    </div>

                    {/* Gym name */}
                    <div className="flex items-center gap-3">
                      {g.logo_url ? (
                        <img src={g.logo_url} alt={g.name} className="w-10 h-10 rounded-sm object-cover border border-[#322f26] shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-sm bg-[#141410] border border-[#322f26] flex items-center justify-center shrink-0">
                          <span className="font-mincho text-lg text-[#7a7568]">{g.name[0]}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-mincho text-2xl text-[#f0eadc] leading-tight">{g.name}</h3>
                        {g.city && (
                          <p className="font-mincho text-sm text-[#a29c8c] mt-0.5">
                            {g.city}{g.location ? `, ${g.location}` : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Disciplines as dot-separated text */}
                    {disciplines.length > 0 && (
                      <p className="font-mincho text-xs text-[#a29c8c] uppercase tracking-[2px]">
                        {disciplines.join(' · ')}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-end gap-6">
                      {g.member_count != null && (
                        <div>
                          <span className="font-mincho text-xl text-[#f0eadc]">{g.member_count}</span>
                          <p className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[2px]">Members</p>
                        </div>
                      )}
                      {g.classes_per_week != null && (
                        <div>
                          <span className="font-mincho text-xl text-[#f0eadc]">{g.classes_per_week}</span>
                          <p className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[2px]">Classes/wk</p>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto">
                      <span className="font-mincho text-sm text-[#a29c8c] group-hover:text-[#f0eadc] transition-colors">
                        VIEW GYM →
                      </span>
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
