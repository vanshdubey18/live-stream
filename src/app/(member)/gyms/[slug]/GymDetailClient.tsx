'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import JoinModal from './JoinModal'
import EmptyState from '@/components/ui/EmptyState'
import { isSessionLive } from '@/lib/session-live'

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

interface Props {
  gym: any
  coaches: any[]
  sessions: any[]
  memberCount: number
  membership: any | null
  isLoggedIn: boolean
}

export default function GymDetailClient({ gym, coaches, sessions, memberCount, membership, isLoggedIn }: Props) {
  const [showJoin, setShowJoin] = useState(false)
  const [joined, setJoined] = useState(!!membership)

  const upcomingSessions = sessions.filter((s: any) => s.status !== 'ended')
  const liveSessions = sessions.filter((s: any) => isSessionLive(s))
  const disciplines: string[] = gym.disciplines ?? []

  return (
    <div className="min-h-screen bg-[#141410]">

      {/* Back nav */}
      <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#242420] px-6 h-14 flex items-center gap-3">
        <a
          href="/gyms"
          className="flex items-center gap-1.5 font-mincho text-sm text-[#7a7568] hover:text-[#f0eadc] transition-colors"
        >
          <ChevronLeft size={15} />
          ALL GYMS
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Hero block */}
        <div>
          {/* Active member badge */}
          {joined && (
            <p className="font-mincho text-xs text-[#00D4AA] tracking-[3px] uppercase mb-3">
              ● ACTIVE MEMBER
            </p>
          )}

          {/* Live badge */}
          {liveSessions.length > 0 && (
            <p className="font-mincho text-xs text-[#b3402f] tracking-[3px] uppercase mb-3">
              ● LIVE NOW
            </p>
          )}

          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-px bg-[#b3402f]" />
            <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Gym Profile</p>
          </div>
          <div className="flex items-center gap-4 mt-2">
            {gym.logo_url && (
              <img src={gym.logo_url} alt={gym.name} className="w-16 h-16 rounded-sm object-cover border border-[#322f26] shrink-0" />
            )}
            <h1 className="font-mincho text-6xl lg:text-7xl text-[#f0eadc] leading-none">{gym.name}</h1>
          </div>

          {gym.city && (
            <p className="font-mincho text-sm text-[#a29c8c] mt-3">
              {gym.city}{gym.location ? `, ${gym.location}` : ''}
            </p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mt-6 pb-6 border-b border-[#242420]">
            <div>
              <p className="font-mincho text-3xl text-[#f0eadc]">{memberCount}</p>
              <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Members</p>
            </div>
            {gym.classes_per_week != null && (
              <div>
                <p className="font-mincho text-3xl text-[#f0eadc]">{gym.classes_per_week}</p>
                <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Classes / Week</p>
              </div>
            )}
            {disciplines.length > 0 && (
              <div>
                <p className="font-mincho text-3xl text-[#f0eadc]">{disciplines.length}</p>
                <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Disciplines</p>
              </div>
            )}
          </div>

          {/* Disciplines dot-separated */}
          {disciplines.length > 0 && (
            <p className="font-mincho text-xs text-[#7a7568] uppercase tracking-[2px] mt-4">
              {disciplines.join(' · ')}
            </p>
          )}

          {/* Description */}
          {gym.description && (
            <p className="font-mincho text-sm text-[#a29c8c] mt-4 leading-relaxed max-w-2xl">
              {gym.description}
            </p>
          )}

          {/* Join / Active CTA */}
          <div className="mt-6">
            {joined ? (
              <span className="font-mincho text-xs text-[#00D4AA] tracking-[3px] uppercase px-4 py-2 border border-[#00D4AA]/30 rounded-sm inline-block">
                ● ACTIVE MEMBER
              </span>
            ) : (
              <button
                onClick={() =>
                  isLoggedIn
                    ? setShowJoin(true)
                    : (window.location.href = `/signup?redirectTo=/gyms/${gym.slug}`)
                }
                className="bg-[#f0eadc] text-[#141410] font-mincho tracking-[3px] px-8 py-3 rounded-sm hover:bg-[#e4dcc8] transition-colors text-sm"
              >
                JOIN GYM
              </button>
            )}
          </div>
        </div>

        {/* Live session banner */}
        {liveSessions.length > 0 && (
          <div className="bg-[#1c1c16] border border-[#b3402f]/40 rounded-sm px-6 py-4 flex items-center justify-between gap-4 shadow-[0_0_0_1px_rgba(255,59,59,0.1),0_0_20px_rgba(255,59,59,0.06)]">
            <div>
              <p className="font-mincho text-xs text-[#b3402f] tracking-[3px] uppercase mb-1">● Live Now</p>
              <p className="font-mincho text-xl text-[#f0eadc]">{liveSessions[0].title}</p>
            </div>
            {joined ? (
              <a
                href={`/watch/${liveSessions[0].id}`}
                className="bg-[#f0eadc] text-[#141410] font-mincho tracking-[3px] px-6 py-2.5 rounded-sm hover:bg-[#e4dcc8] transition-colors text-sm shrink-0"
              >
                WATCH →
              </a>
            ) : (
              <span className="font-mincho text-xs text-[#7a7568]">Join to watch</span>
            )}
          </div>
        )}

        {/* Coaches */}
        {coaches.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Coaches</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coaches.map((c: any) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 bg-[#1c1c16] border border-[#2a2a20] rounded-sm hover:border-[#322f26] transition-colors">
                  <div className="w-12 h-12 rounded-sm bg-[#2a2a20] border border-[#322f26] flex items-center justify-center shrink-0 overflow-hidden">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                      : <span className="font-mincho text-[#f0eadc] text-xl">{c.name[0]}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mincho text-lg text-[#f0eadc] leading-tight">{c.name}</p>
                    <p className="font-mincho text-xs text-[#a29c8c]">
                      {c.discipline}{c.belt_rank ? ` · ${c.belt_rank}` : ''}
                    </p>
                    {c.bio && (
                      <p className="font-mincho text-xs text-[#7a7568] mt-1 line-clamp-1">{c.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Schedule */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-px bg-[#b3402f]" />
            <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Upcoming Schedule</p>
          </div>
          {upcomingSessions.length === 0 ? (
            <EmptyState ghost="SCHEDULE" message="No upcoming classes scheduled yet." />
          ) : (
            <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden">
              {/* Desktop table header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-[#2a2a20]">
                <span className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[3px]">Time</span>
                <span className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[3px]">Class</span>
                <span className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[3px]">Coach</span>
                <span className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[3px]">Level</span>
              </div>
              <div className="divide-y divide-[#2a2a20]">
                {upcomingSessions.map((s: any) => (
                  <div key={s.id} className="px-5 py-3.5 hover:bg-[#242420] transition-colors">
                    {/* Mobile layout */}
                    <div className="sm:hidden flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {isSessionLive(s) && (
                          <span className="font-mincho text-[10px] text-[#b3402f] tracking-[2px] block mb-1">● LIVE</span>
                        )}
                        <p className="font-mincho text-sm text-[#f0eadc] font-medium truncate">{s.title}</p>
                        {s.discipline && (
                          <p className="font-mincho text-xs text-[#7a7568] uppercase tracking-[1px] mt-0.5">{s.discipline}</p>
                        )}
                        <p className="font-mincho text-xs text-[#a29c8c] mt-1">{s.coaches?.name ?? '—'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mincho text-xs text-[#a29c8c]">{formatTime(s.scheduled_at)}</p>
                        <p className="font-mincho text-xs text-[#7a7568] mt-1">{s.level ?? '—'}</p>
                      </div>
                    </div>
                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-center">
                      <div>
                        {isSessionLive(s) && (
                          <span className="font-mincho text-[10px] text-[#b3402f] tracking-[2px] block mb-0.5">● LIVE</span>
                        )}
                        <p className="font-mincho text-xs text-[#a29c8c]">{formatTime(s.scheduled_at)}</p>
                      </div>
                      <div>
                        <p className="font-mincho text-sm text-[#f0eadc]">{s.title}</p>
                        {s.discipline && (
                          <p className="font-mincho text-xs text-[#7a7568] uppercase tracking-[1px] mt-0.5">{s.discipline}</p>
                        )}
                      </div>
                      <p className="font-mincho text-sm text-[#a29c8c]">{s.coaches?.name ?? '—'}</p>
                      <p className="font-mincho text-xs text-[#7a7568]">{s.level ?? '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Pricing / Join CTA if not joined */}
        {!joined && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Membership</p>
            </div>
            <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-8">
              <h3 className="font-mincho text-4xl text-[#f0eadc] mb-2">JOIN {gym.name.toUpperCase()}</h3>
              <p className="font-mincho text-sm text-[#a29c8c] mb-6">
                Access all live classes and replays from anywhere.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-mincho text-6xl text-[#f0eadc]">
                  ₹{((gym.monthly_price_paise ?? 99900) / 100).toLocaleString('en-IN')}
                </span>
                <span className="font-mincho text-sm text-[#7a7568]">/mo</span>
              </div>
              <button
                onClick={() =>
                  isLoggedIn
                    ? setShowJoin(true)
                    : (window.location.href = `/signup?redirectTo=/gyms/${gym.slug}`)
                }
                className="bg-[#f0eadc] text-[#141410] font-mincho tracking-[3px] px-10 py-3 rounded-sm hover:bg-[#e4dcc8] transition-colors text-sm"
              >
                JOIN NOW →
              </button>
            </div>
          </section>
        )}

      </div>

      {showJoin && (
        <JoinModal
          gym={gym}
          onClose={() => setShowJoin(false)}
          onJoined={() => { setJoined(true); setShowJoin(false) }}
        />
      )}
    </div>
  )
}
