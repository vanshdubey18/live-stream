'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import MemberSidebar from '@/components/layout/MemberSidebar'
import EmptyState from '@/components/ui/EmptyState'

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
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <MemberSidebar active="Browse Gyms" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top nav bar */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#1F1F1F] px-6 h-14 flex items-center mt-14 lg:mt-0">
          <span className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase">Member Portal</span>
        </div>

        <div className="px-6 py-8 max-w-5xl space-y-8">

          {/* Page header */}
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Discover</p>
            <h1 className="font-bebas text-4xl text-white tracking-wide">FIND YOUR GYM</h1>
          </div>

          {/* Search input */}
          <div className="relative max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555555]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gyms or cities…"
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-sm pl-10 pr-4 py-2.5 text-white placeholder-[#555555] font-inter text-sm focus:outline-none focus:border-[#444444] transition-colors"
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
                  className={`shrink-0 mr-5 sm:mr-6 pb-2 font-inter text-sm transition-colors border-b-2 ${
                    isActive
                      ? 'text-white border-[#FF3B3B]'
                      : 'text-[#555555] border-transparent hover:text-[#888888]'
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
                const isLive = (g.sessions ?? []).some((s: any) => s.status === 'live')

                return (
                  <a
                    key={g.id}
                    href={`/gyms/${g.slug}`}
                    className={`bg-[#1A1A1A] rounded-sm p-5 transition-all flex flex-col gap-4 group ${
                      isLive
                        ? 'border border-[#FF3B3B]/50 shadow-[0_0_0_1px_rgba(255,59,59,0.1),0_0_28px_rgba(255,59,59,0.08)] hover:border-[#FF3B3B]/70'
                        : 'border border-[#333333] hover:bg-[#222222] hover:border-[#FF3B3B]/40'
                    }`}
                  >
                    {/* Top row: live badge + joined */}
                    <div className="flex items-center justify-between min-h-[20px]">
                      {isLive ? (
                        <span className="font-inter text-xs text-[#FF3B3B] tracking-[1px]">
                          ● LIVE NOW
                        </span>
                      ) : (
                        <span />
                      )}
                      {isJoined && (
                        <span className="font-inter text-xs text-[#00D4AA] tracking-[1px]">
                          ● ACTIVE MEMBER
                        </span>
                      )}
                    </div>

                    {/* Gym name */}
                    <div>
                      <h3 className="font-bebas text-2xl text-white leading-tight">{g.name}</h3>
                      {g.city && (
                        <p className="font-inter text-sm text-[#999999] mt-1">
                          {g.city}{g.location ? `, ${g.location}` : ''}
                        </p>
                      )}
                    </div>

                    {/* Disciplines as dot-separated text */}
                    {disciplines.length > 0 && (
                      <p className="font-inter text-xs text-[#555555] uppercase tracking-[2px]">
                        {disciplines.join(' · ')}
                      </p>
                    )}

                    {/* Stats row */}
                    <div className="flex items-end gap-6">
                      {g.member_count != null && (
                        <div>
                          <span className="font-bebas text-xl text-white">{g.member_count}</span>
                          <p className="font-inter text-[10px] text-[#555555] uppercase tracking-[2px]">Members</p>
                        </div>
                      )}
                      {g.classes_per_week != null && (
                        <div>
                          <span className="font-bebas text-xl text-white">{g.classes_per_week}</span>
                          <p className="font-inter text-[10px] text-[#555555] uppercase tracking-[2px]">Classes/wk</p>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="mt-auto">
                      <span className="font-inter text-sm text-[#999999] group-hover:text-white transition-colors">
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
