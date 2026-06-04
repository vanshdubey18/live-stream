'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import JoinModal from './JoinModal'

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
  const liveSessions = sessions.filter((s: any) => s.status === 'live')
  const disciplines: string[] = gym.disciplines ?? []

  return (
    <div className="min-h-screen bg-[#0D0D0D]">

      {/* Back nav */}
      <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#1F1F1F] px-6 h-14 flex items-center gap-3">
        <a
          href="/gyms"
          className="flex items-center gap-1.5 font-inter text-sm text-[#555555] hover:text-white transition-colors"
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
            <p className="font-inter text-xs text-[#00D4AA] tracking-[3px] uppercase mb-3">
              ● ACTIVE MEMBER
            </p>
          )}

          {/* Live badge */}
          {liveSessions.length > 0 && (
            <p className="font-inter text-xs text-[#FF3B3B] tracking-[3px] uppercase mb-3">
              ● LIVE NOW
            </p>
          )}

          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Gym Profile</p>
          <h1 className="font-bebas text-6xl lg:text-7xl text-white leading-none">{gym.name}</h1>

          {gym.city && (
            <p className="font-inter text-sm text-[#999999] mt-3">
              {gym.city}{gym.location ? `, ${gym.location}` : ''}
            </p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mt-6 pb-6 border-b border-[#1F1F1F]">
            <div>
              <p className="font-bebas text-3xl text-white">{memberCount}</p>
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Members</p>
            </div>
            {gym.classes_per_week != null && (
              <div>
                <p className="font-bebas text-3xl text-white">{gym.classes_per_week}</p>
                <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Classes / Week</p>
              </div>
            )}
            {disciplines.length > 0 && (
              <div>
                <p className="font-bebas text-3xl text-white">{disciplines.length}</p>
                <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Disciplines</p>
              </div>
            )}
          </div>

          {/* Disciplines dot-separated */}
          {disciplines.length > 0 && (
            <p className="font-inter text-xs text-[#555555] uppercase tracking-[2px] mt-4">
              {disciplines.join(' · ')}
            </p>
          )}

          {/* Description */}
          {gym.description && (
            <p className="font-inter text-sm text-[#999999] mt-4 leading-relaxed max-w-2xl">
              {gym.description}
            </p>
          )}

          {/* Join / Active CTA */}
          <div className="mt-6">
            {joined ? (
              <span className="font-inter text-xs text-[#00D4AA] tracking-[3px] uppercase px-4 py-2 border border-[#00D4AA]/30 rounded-sm inline-block">
                ● ACTIVE MEMBER
              </span>
            ) : (
              <button
                onClick={() =>
                  isLoggedIn
                    ? setShowJoin(true)
                    : (window.location.href = `/signup?redirectTo=/gyms/${gym.slug}`)
                }
                className="bg-white text-black font-bebas tracking-[3px] px-8 py-3 rounded-sm hover:bg-[#E5E5E5] transition-colors text-sm"
              >
                JOIN GYM
              </button>
            )}
          </div>
        </div>

        {/* Live session banner */}
        {liveSessions.length > 0 && (
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-inter text-xs text-[#FF3B3B] tracking-[3px] uppercase mb-1">● Live Now</p>
              <p className="font-bebas text-xl text-white">{liveSessions[0].title}</p>
            </div>
            {joined ? (
              <a
                href={`/watch/${liveSessions[0].id}`}
                className="bg-white text-black font-bebas tracking-[3px] px-6 py-2.5 rounded-sm hover:bg-[#E5E5E5] transition-colors text-sm shrink-0"
              >
                WATCH →
              </a>
            ) : (
              <span className="font-inter text-xs text-[#555555]">Join to watch</span>
            )}
          </div>
        )}

        {/* Coaches */}
        {coaches.length > 0 && (
          <section>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Coaches</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {coaches.map((c: any) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm hover:border-[#333333] transition-colors">
                  <div className="w-12 h-12 rounded-sm bg-[#2A2A2A] border border-[#333333] flex items-center justify-center shrink-0 overflow-hidden">
                    {c.avatar_url
                      ? <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                      : <span className="font-bebas text-white text-xl">{c.name[0]}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bebas text-lg text-white leading-tight">{c.name}</p>
                    <p className="font-inter text-xs text-[#999999]">
                      {c.discipline}{c.belt_rank ? ` · ${c.belt_rank}` : ''}
                    </p>
                    {c.bio && (
                      <p className="font-inter text-xs text-[#555555] mt-1 line-clamp-1">{c.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Schedule */}
        <section>
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Upcoming Schedule</p>
          {upcomingSessions.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-10 text-center">
              <p className="font-inter text-[#555555] text-sm">No upcoming classes scheduled yet.</p>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 border-b border-[#2A2A2A]">
                <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px]">Time</span>
                <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px]">Class</span>
                <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px]">Coach</span>
                <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px]">Level</span>
              </div>
              <div className="divide-y divide-[#2A2A2A]">
                {upcomingSessions.map((s: any) => (
                  <div key={s.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3.5 hover:bg-[#222222] transition-colors items-center">
                    <div>
                      {s.status === 'live' && (
                        <span className="font-inter text-[10px] text-[#FF3B3B] tracking-[2px] block mb-0.5">● LIVE</span>
                      )}
                      <p className="font-inter text-xs text-[#999999]">{formatTime(s.scheduled_at)}</p>
                    </div>
                    <div>
                      <p className="font-inter text-sm text-white">{s.title}</p>
                      {s.discipline && (
                        <p className="font-inter text-xs text-[#555555] uppercase tracking-[1px] mt-0.5">{s.discipline}</p>
                      )}
                    </div>
                    <p className="font-inter text-sm text-[#999999]">{s.coaches?.name ?? '—'}</p>
                    <p className="font-inter text-xs text-[#555555]">{s.level ?? '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Pricing / Join CTA if not joined */}
        {!joined && (
          <section>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Membership</p>
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-8">
              <h3 className="font-bebas text-4xl text-white mb-2">JOIN {gym.name.toUpperCase()}</h3>
              <p className="font-inter text-sm text-[#999999] mb-6">
                Access all live classes and replays from anywhere.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-bebas text-6xl text-white">
                  ₹{((gym.monthly_price_paise ?? 99900) / 100).toLocaleString('en-IN')}
                </span>
                <span className="font-inter text-sm text-[#555555]">/mo</span>
              </div>
              <button
                onClick={() =>
                  isLoggedIn
                    ? setShowJoin(true)
                    : (window.location.href = `/signup?redirectTo=/gyms/${gym.slug}`)
                }
                className="bg-white text-black font-bebas tracking-[3px] px-10 py-3 rounded-sm hover:bg-[#E5E5E5] transition-colors text-sm"
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
