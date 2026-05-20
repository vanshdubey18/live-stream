'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown, User, CreditCard, LogOut,
  Radio, Building2, Calendar, Play, Clock,
} from 'lucide-react'
import MemberSidebar from '@/components/layout/MemberSidebar'
import { formatDate } from '@/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  user: { name: string; email: string }
  memberships: any[]
  upcoming: any[]
  replays: any[]
  liveSession: any | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function groupByDay(sessions: any[]) {
  const groups: { label: string; sessions: any[] }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  sessions.forEach(s => {
    const d = new Date(s.scheduled_at)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : formatDate(s.scheduled_at)
    const existing = groups.find(g => g.label === label)
    if (existing) existing.sessions.push(s)
    else groups.push({ label, sessions: [s] })
  })
  return groups
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function daysAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

const PLAN_LABELS: Record<string, string> = { single: 'Single', dual: 'Dual', full_mma: 'Full MMA' }
const PLAN_COLORS: Record<string, string> = {
  single: 'bg-white/5 text-white/60 border-white/10',
  dual: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  full_mma: 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
}
const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
}
const REPLAY_GRADIENTS: Record<string, string> = {
  BJJ: 'from-blue-900/40 to-blue-800/20',
  Boxing: 'from-yellow-900/40 to-yellow-800/20',
  'Muay Thai': 'from-orange-900/40 to-orange-800/20',
  Wrestling: 'from-green-900/40 to-green-800/20',
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#111111] border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all">
        <div className="w-7 h-7 rounded-full bg-[#DC2626]/20 flex items-center justify-center">
          <span className="text-[#DC2626] text-xs font-bold">{name[0]?.toUpperCase()}</span>
        </div>
        <span className="text-white text-sm font-medium hidden sm:block">{name}</span>
        <ChevronDown size={14} className={`text-[#888888] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-20 w-48 bg-[#111111] border border-white/10 rounded-xl shadow-xl overflow-hidden">
            {[
              { icon: <User size={14} />, label: 'Account', href: '/dashboard/account' },
              { icon: <CreditCard size={14} />, label: 'Billing', href: '/dashboard/billing' },
            ].map(item => (
              <a key={item.label} href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-[#888888] hover:text-white hover:bg-white/5 text-sm transition-colors">
                {item.icon} {item.label}
              </a>
            ))}
            <div className="border-t border-white/5" />
            <button onClick={() => router.push('/login')}
              className="flex items-center gap-3 px-4 py-3 text-[#888888] hover:text-red-400 hover:bg-white/5 text-sm transition-colors w-full">
              <LogOut size={14} /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function Empty({ icon, message, cta, href }: { icon: React.ReactNode; message: string; cta: string; href: string }) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl px-6 py-12 flex flex-col items-center gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#555]">{icon}</div>
      <p className="text-[#888888] text-sm">{message}</p>
      <a href={href} className="bg-[#DC2626] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">{cta}</a>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardClient({ user, memberships, upcoming, replays, liveSession }: Props) {
  const grouped = groupByDay(upcoming)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <MemberSidebar active="Dashboard" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-[#888888] text-xs">Ready to train?</p>
          </div>
          <ProfileDropdown name={user.name} />
        </div>

        <div className="px-6 py-6 space-y-8 max-w-5xl">

          {/* Live Now Banner */}
          {liveSession && (
            <div className="bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 flex items-center justify-center shrink-0">
                  <Radio size={18} className="text-[#DC2626]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                    <span className="text-[#DC2626] text-xs font-bold tracking-wide uppercase">Live Now</span>
                  </div>
                  <p className="text-white font-bold text-sm">{liveSession.title}</p>
                  <p className="text-[#888888] text-xs">
                    {liveSession.gyms?.name} · {liveSession.coaches?.name}
                  </p>
                </div>
              </div>
              <a href={`/watch/${liveSession.id}`}
                className="shrink-0 bg-[#DC2626] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                Watch Now
              </a>
            </div>
          )}

          {/* My Gyms */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">My Gyms</h2>
              <a href="/gyms" className="text-[#888888] hover:text-white text-sm transition-colors flex items-center gap-1">
                <Building2 size={14} /> Browse more
              </a>
            </div>

            {memberships.length === 0 ? (
              <Empty
                icon={<Building2 size={22} />}
                message="You haven't joined any gyms yet."
                cta="Browse Gyms"
                href="/gyms"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {memberships.map((m: any) => {
                  const gym = m.gyms
                  const next = m.nextSession
                  return (
                    <div key={m.id} className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 flex items-center justify-center mb-3">
                            <span className="text-[#DC2626] font-black text-sm">{gym?.name?.[0]}</span>
                          </div>
                          <h3 className="text-white font-bold text-base">{gym?.name}</h3>
                          <p className="text-[#888888] text-xs mt-0.5">{gym?.city}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PLAN_COLORS[m.plan_type] ?? 'bg-white/5 text-white/60 border-white/10'}`}>
                          {PLAN_LABELS[m.plan_type] ?? m.plan_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(m.disciplines ?? gym?.disciplines ?? []).map((d: string) => (
                          <span key={d} className="text-xs text-[#888888] bg-white/5 px-2.5 py-1 rounded-full">{d}</span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-xl px-4 py-3">
                        <Calendar size={14} className="text-[#DC2626] shrink-0" />
                        {next ? (
                          <div className="min-w-0">
                            <p className="text-white text-xs font-medium truncate">{next.title}</p>
                            <p className="text-[#888888] text-xs">{formatTime(next.scheduled_at)}</p>
                          </div>
                        ) : (
                          <p className="text-[#555] text-xs">No upcoming classes</p>
                        )}
                      </div>

                      <a href={`/gyms/${gym?.slug}`}
                        className="flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">
                        View Schedule
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Upcoming Classes */}
          <section>
            <h2 className="text-white font-bold text-lg mb-4">Upcoming Classes</h2>

            {grouped.length === 0 ? (
              <Empty
                icon={<Calendar size={22} />}
                message="No upcoming classes from your gyms."
                cta="Browse Gyms"
                href="/gyms"
              />
            ) : (
              <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                {grouped.map((group, gi) => (
                  <div key={group.label}>
                    {gi > 0 && <div className="border-t border-white/5" />}
                    <div className="px-4 py-2.5 bg-white/[0.02]">
                      <span className="text-[#888888] text-xs font-bold uppercase tracking-widest">{group.label}</span>
                    </div>
                    {group.sessions.map((s: any) => (
                      <div key={s.id}
                        className={`flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.03] transition-colors
                          ${s.status === 'live' ? 'bg-[#DC2626]/5 border-l-2 border-[#DC2626]' : ''}`}>
                        <div className="w-16 shrink-0 text-center">
                          {s.status === 'live' ? (
                            <span className="flex items-center gap-1 justify-center text-[#DC2626] text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" /> LIVE
                            </span>
                          ) : (
                            <span className="text-[#888888] text-sm font-medium">{formatTime(s.scheduled_at)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-semibold truncate">{s.title}</p>
                          <p className="text-[#888888] text-xs mt-0.5">
                            {s.coaches?.name} · {s.gyms?.name}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${DISCIPLINE_COLORS[s.discipline] ?? 'bg-white/5 text-white/60'}`}>
                            {s.discipline}
                          </span>
                          <span className="text-xs text-[#555]">{s.level}</span>
                        </div>
                        {s.status === 'live' && (
                          <a href={`/watch/${s.id}`}
                            className="shrink-0 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                            Watch
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Replays */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Recent Replays</h2>
              <a href="/dashboard/replays" className="text-[#888888] hover:text-white text-sm transition-colors">View all</a>
            </div>

            {replays.length === 0 ? (
              <Empty
                icon={<Play size={22} />}
                message="No replays yet. Join a gym to start watching."
                cta="Browse Gyms"
                href="/gyms"
              />
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {replays.map((r: any) => (
                  <div key={r.id} className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group flex-shrink-0 w-64">
                    <div className={`relative h-36 bg-gradient-to-br ${REPLAY_GRADIENTS[r.discipline] ?? 'from-gray-900/40 to-gray-800/20'} flex items-center justify-center`}>
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#DC2626]/80 transition-all">
                        <Play size={20} className="text-white fill-white ml-0.5" />
                      </div>
                      <span className="absolute top-3 left-3 text-xs font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
                        {r.discipline}
                      </span>
                      <span className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
                        <Clock size={10} /> {r.duration_minutes} min
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="text-white text-sm font-bold line-clamp-2 mb-1">{r.title}</h4>
                      <p className="text-[#888888] text-xs">{r.coaches?.name} · {r.gyms?.name}</p>
                      <p className="text-[#555] text-xs mt-1">
                        {daysAgo(r.scheduled_at) === 0 ? 'Today' : daysAgo(r.scheduled_at) === 1 ? 'Yesterday' : `${daysAgo(r.scheduled_at)} days ago`}
                      </p>
                      <a href={`/watch/${r.id}`}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 border border-white/10 hover:border-[#DC2626]/40 hover:bg-[#DC2626]/5 text-white text-xs font-semibold py-2 rounded-xl transition-all">
                        <Play size={12} className="fill-white" /> Watch Replay
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}
