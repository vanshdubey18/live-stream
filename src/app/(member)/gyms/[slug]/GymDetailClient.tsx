'use client'

import { useState } from 'react'
import { MapPin, Users, Calendar, ChevronLeft, CheckCircle, Radio } from 'lucide-react'
import JoinModal from './JoinModal'

const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Boxing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Muay Thai': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Wrestling: 'bg-green-500/10 text-green-400 border-green-500/20',
  MMA: 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/20',
  Kickboxing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Judo: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Sambo: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'text-green-400 bg-green-500/10',
  Intermediate: 'text-yellow-400 bg-yellow-500/10',
  Advanced: 'text-[#FF3B3B] bg-[#FF3B3B]/10',
}

function formatDateTime(iso: string) {
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

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Back nav */}
      <div className="sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 px-6 h-14 flex items-center gap-3">
        <a href="/gyms" className="flex items-center gap-1.5 text-[#999999] hover:text-white text-sm transition-colors">
          <ChevronLeft size={16} /> All Gyms
        </a>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Hero */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#FF3B3B]/15 flex items-center justify-center shrink-0">
              <span className="text-[#FF3B3B] font-black text-3xl">{gym.name[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-2xl font-black">{gym.name}</h1>
              {gym.city && (
                <p className="text-[#999999] text-sm flex items-center gap-1.5 mt-1">
                  <MapPin size={13} /> {gym.city}{gym.location ? `, ${gym.location}` : ''}
                </p>
              )}
              {gym.description && (
                <p className="text-[#999999] text-sm mt-3 leading-relaxed">{gym.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {(gym.disciplines ?? []).map((d: string) => (
                  <span key={d} className={`text-xs font-semibold px-3 py-1 rounded-full border ${DISCIPLINE_COLORS[d] ?? 'bg-white/5 text-white/60 border-white/10'}`}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-white font-black text-2xl">{memberCount}</p>
                <p className="text-[#999999] text-xs flex items-center gap-1 justify-end"><Users size={11} /> members</p>
              </div>
              {joined ? (
                <span className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold px-5 py-2.5 rounded-xl">
                  <CheckCircle size={15} /> Joined
                </span>
              ) : (
                <button
                  onClick={() => isLoggedIn ? setShowJoin(true) : window.location.href = `/signup?redirectTo=/gyms/${gym.slug}`}
                  className="bg-[#FF3B3B] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                  Join Gym
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live now banner */}
        {liveSessions.length > 0 && (
          <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B3B] animate-pulse" />
              <div>
                <p className="text-[#FF3B3B] text-xs font-bold uppercase tracking-wide">Live Now</p>
                <p className="text-white font-semibold text-sm">{liveSessions[0].title}</p>
              </div>
            </div>
            {joined ? (
              <a href={`/watch/${liveSessions[0].id}`}
                className="bg-[#FF3B3B] hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5">
                <Radio size={14} /> Watch
              </a>
            ) : (
              <span className="text-[#999999] text-xs">Join to watch</span>
            )}
          </div>
        )}

        {/* Coaches */}
        {coaches.length > 0 && (
          <section>
            <h2 className="text-white font-bold text-lg mb-4">Coaches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coaches.map((c: any) => (
                <div key={c.id} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-base">{c.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm">{c.name}</p>
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${DISCIPLINE_COLORS[c.discipline]?.split(' ').slice(0, 2).join(' ') ?? 'bg-white/5 text-white/60'}`}>
                      {c.discipline}
                    </span>
                    {c.belt_rank && <p className="text-[#555] text-xs mt-1">{c.belt_rank}</p>}
                    {c.bio && <p className="text-[#555] text-xs mt-1 line-clamp-2">{c.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming schedule */}
        <section>
          <h2 className="text-white font-bold text-lg mb-4">Upcoming Schedule</h2>
          {upcomingSessions.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-10 text-center">
              <p className="text-[#999999] text-sm">No upcoming classes scheduled yet.</p>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {upcomingSessions.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-4 px-5 py-4">
                    <div className={`flex items-center gap-1.5 shrink-0 w-5 ${s.status === 'live' ? 'text-[#FF3B3B]' : 'text-[#555]'}`}>
                      {s.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />}
                      <Calendar size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{s.title}</p>
                      <p className="text-[#555] text-xs mt-0.5">
                        {formatDateTime(s.scheduled_at)} · {s.duration_minutes}min · {s.coaches?.name ?? '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DISCIPLINE_COLORS[s.discipline]?.split(' ').slice(0, 2).join(' ') ?? 'bg-white/5 text-white/60'}`}>
                        {s.discipline}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[s.level] ?? 'text-[#888] bg-white/5'}`}>
                        {s.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* CTA if not joined */}
        {!joined && (
          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl px-8 py-10 text-center space-y-4">
            <h3 className="text-white font-black text-xl">Ready to train at {gym.name}?</h3>
            <p className="text-[#999999] text-sm">Join to watch live classes and replays from anywhere.</p>
            <button
              onClick={() => isLoggedIn ? setShowJoin(true) : window.location.href = `/signup?redirectTo=/gyms/${gym.slug}`}
              className="bg-[#FF3B3B] hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors">
              Join {gym.name}
            </button>
          </div>
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
