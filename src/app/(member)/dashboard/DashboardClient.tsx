'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import MemberSidebar from '@/components/layout/MemberSidebar'
import StatCard from '@/components/ui/StatCard'
import InsightCard from '@/components/ui/InsightCard'
import { ChevronRight, ArrowRight, BookOpen, Sparkles, Layers, MessageCircle, Lock } from 'lucide-react'

interface Props {
  user: { name: string; email: string }
  memberships: any[]
  upcoming: any[]
  replays: any[]
  liveSession: any | null
  completedCount: number
}

const DISCIPLINE_COLOR: Record<string, string> = {
  BJJ: '#ffffff',
  Boxing: '#999999',
  'Muay Thai': '#555555',
  Wrestling: '#333333',
  MMA: '#444444',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatRelDay(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = Math.floor((d.getTime() - now.getTime()) / 60000)
  if (diff < 60) return `in ${diff}m`
  if (diff < 1440) return `in ${Math.floor(diff / 60)}h`
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

// ─── Live Banner ──────────────────────────────────────────────────────────────
function LiveBanner({ session }: { session: any }) {
  return (
    <motion.a
      href={`/watch/${session.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="block border-b border-[#333333] bg-[#1A1A1A] hover:bg-[#222222] transition-colors duration-150"
    >
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3B3B] live-pulse" />
            <span className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Live Now</span>
          </div>
          <span className="font-bebas text-xl text-white tracking-[1px]">{session.title}</span>
          <span className="font-inter text-sm text-[#999999] hidden sm:inline">
            {session.gyms?.name ?? session.gym_name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#FF3B3B] shrink-0">
          <span className="font-inter text-xs">Watch now</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </motion.a>
  )
}

// ─── Hero Status Panel ────────────────────────────────────────────────────────
function HeroPanel({ upcoming, user, memberships }: { upcoming: any[]; user: { name: string }; memberships: any[] }) {
  const todayCount = upcoming.filter(s => {
    const d = new Date(s.scheduled_at)
    return d.toDateString() === new Date().toDateString()
  }).length

  const firstName = user.name?.split(' ')[0] ?? 'Fighter'

  return (
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="flex-1">
            <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px] mb-4">
              Today&apos;s Training
            </p>
            <div className="font-bebas text-[96px] text-white leading-none tracking-[1px]">
              {todayCount || upcoming.length || 0}
            </div>
            <p className="font-inter text-sm text-[#999999] mt-3">
              {(todayCount || upcoming.length) ? 'Classes available today' : 'No classes scheduled yet'}
            </p>
            <p className="font-inter text-xs text-[#555555] mt-1 uppercase tracking-[2px]">
              Good to see you, {firstName}
            </p>

            {memberships.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {memberships.map((m: any) => (
                  <span
                    key={m.id ?? m.gyms?.id}
                    className="inline-flex items-center gap-2 font-inter text-[11px] text-[#00D4AA] tracking-[3px] uppercase border border-[#00D4AA]/20 bg-[#00D4AA]/5 px-3 py-1.5 rounded-sm"
                  >
                    {m.gyms?.logo_url ? (
                      <img src={m.gyms.logo_url} alt="" className="w-4 h-4 rounded-sm object-cover shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA] shrink-0" />
                    )}
                    Member of {m.gyms?.name ?? 'your gym'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ memberships, completedCount }: { memberships: any[]; completedCount: number }) {
  const stats = [
    { number: String(memberships.length), label: 'Gyms Joined' },
    { number: String(completedCount), label: 'Replays Available' },
  ]

  return (
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 gap-px bg-[#333333]">
          {stats.map(({ number, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
            >
              <StatCard number={number} label={label} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── My Gyms ─────────────────────────────────────────────────────────────────
function MyGyms({ memberships }: { memberships: any[] }) {
  if (!memberships.length) return null

  return (
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px] mb-6">My Gyms</p>
        <div className="divide-y divide-[#333333]">
          {memberships.map((m: any) => {
            const gym = m.gyms ?? {}
            const disciplines: string[] = gym.disciplines ?? m.disciplines ?? []
            const isLive = m.nextSession?.status === 'live'
            const nextTime = m.nextSession?.scheduled_at ? formatRelDay(m.nextSession.scheduled_at) : null

            return (
              <a
                key={m.id ?? gym.id}
                href={`/gyms/${gym.slug ?? ''}`}
                className="flex items-center justify-between py-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    {isLive && (
                      <span className="flex items-center gap-1.5 font-inter text-[10px] text-[#FF3B3B] tracking-[2px] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] live-pulse" />
                        Live
                      </span>
                    )}
                    <span className="font-bebas text-xl text-white tracking-[1px] group-hover:text-[#FF3B3B] transition-colors duration-150">
                      {gym.name ?? 'Unknown Gym'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {disciplines.slice(0, 4).map((d: string, idx: number) => (
                      <span key={d} className="flex items-center gap-2">
                        {idx > 0 && <span className="text-[#333333] text-xs">·</span>}
                        <span className="font-inter text-xs text-[#555555] uppercase tracking-[2px]">{d}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  {nextTime && !isLive && (
                    <span className="font-inter text-sm text-[#999999]">Next {nextTime}</span>
                  )}
                  <ChevronRight size={16} className="text-[#555555] group-hover:text-white transition-colors duration-150" />
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Upcoming Classes ─────────────────────────────────────────────────────────
function UpcomingClasses({ sessions }: { sessions: any[] }) {
  const items = sessions.slice(0, 6)

  return (
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px]">Upcoming Classes</p>
          <a href="/dashboard/schedule" className="font-inter text-xs text-[#555555] hover:text-white transition-colors flex items-center gap-1">
            View all <ChevronRight size={12} />
          </a>
        </div>

        {items.length === 0 ? (
          <p className="font-inter text-sm text-[#555555]">No upcoming classes. Join a gym to get started.</p>
        ) : (
          <div className="divide-y divide-[#333333]">
            {items.map((s: any, i: number) => {
              const discipline = s.discipline ?? 'BJJ'
              const dotColor = DISCIPLINE_COLOR[discipline] ?? '#999999'
              return (
                <motion.a
                  key={s.id}
                  href={`/watch/${s.id}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
                  className="flex items-center gap-4 py-4 group"
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bebas text-lg text-white tracking-[1px] leading-none mb-1 group-hover:text-[#FF3B3B] transition-colors duration-150">
                      {s.title}
                    </p>
                    <p className="font-inter text-xs text-[#555555]">
                      {s.coaches?.name ?? 'Coach'}&nbsp;·&nbsp;{s.gyms?.name ?? ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-inter text-sm text-[#999999]">{formatTime(s.scheduled_at)}</p>
                    <p className="font-inter text-[11px] text-[#555555]">{formatRelDay(s.scheduled_at)}</p>
                  </div>
                  <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[2px] border border-[#333333] bg-[#222222] px-2 py-0.5 rounded-sm shrink-0">
                    {discipline}
                  </span>
                </motion.a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Recent Replays ───────────────────────────────────────────────────────────
function RecentReplays({ replays }: { replays: any[] }) {
  const items = replays.slice(0, 4)
  if (!items.length) return null

  return (
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px]">Replay Library</p>
          <a href="/dashboard/replays" className="font-inter text-xs text-[#555555] hover:text-white transition-colors flex items-center gap-1">
            View all <ChevronRight size={12} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333]">
          {items.map((s: any, i: number) => (
            <motion.a
              key={s.id}
              href={`/replay/${s.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
              className="bg-[#1A1A1A] p-5 block group hover:bg-[#222222] transition-colors duration-150"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[2px] border border-[#333333] bg-[#222222] px-2 py-0.5 rounded-sm">
                  {s.discipline ?? 'BJJ'}
                </span>
                {s.mux_playback_id && (
                  <span className="font-inter text-[10px] text-[#999999] uppercase tracking-[2px]">AI NOTES</span>
                )}
              </div>
              <p className="font-bebas text-lg text-white leading-tight tracking-[1px] mb-2 group-hover:text-[#FF3B3B] transition-colors duration-150">
                {s.title}
              </p>
              <p className="font-inter text-xs text-[#555555]">
                {s.coaches?.name ?? 'Coach'}&nbsp;·&nbsp;{s.duration_minutes ?? 60}m
              </p>
              <div className="mt-4 h-px bg-[#333333]">
                <div className="h-px bg-white" style={{ width: '40%' }} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── AI Coach Section ─────────────────────────────────────────────────────────
function AICoachSection() {
  const features = [
    { icon: <BookOpen size={14} />, label: 'Summary + timestamps', sub: 'Key moments from every class, jumpable', free: true },
    { icon: <Sparkles size={14} />, label: 'Quiz every class', sub: 'Test yourself after each session', free: false },
    { icon: <Layers size={14} />, label: 'Flashcards', sub: 'Technique cards with spaced repetition', free: false },
    { icon: <MessageCircle size={14} />, label: 'Ask your coach', sub: 'Chat grounded in your actual classes', free: false },
  ]

  return (
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px] mb-1">Powered by AI</p>
            <h2 className="font-bebas text-2xl text-white tracking-[1px]">AI COACH</h2>
          </div>
          <span className="font-inter text-[10px] text-[#FF3B3B] tracking-[3px] uppercase border border-[#FF3B3B]/20 bg-[#FF3B3B]/5 px-3 py-1.5 rounded-sm">
            Coming Soon
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333]">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className={`bg-[#1A1A1A] p-5 flex flex-col gap-3 ${!f.free ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className={f.free ? 'text-[#00D4AA]' : 'text-[#555555]'}>{f.icon}</span>
                {f.free
                  ? <span className="font-inter text-[10px] text-[#00D4AA] tracking-[2px] uppercase">Free</span>
                  : <Lock size={10} className="text-[#FF3B3B]" />}
              </div>
              <div>
                <p className="font-bebas text-lg text-white tracking-[1px] leading-tight">{f.label}</p>
                <p className="font-inter text-xs text-[#555555] mt-0.5">{f.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="font-inter text-[#555555] text-xs mt-4">
          After every class, AI Coach analyses the transcript and generates your personal study tools. Available on all replays.
        </p>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardClient({ user, memberships, upcoming, replays, liveSession, completedCount }: Props) {
  const [, setSearchOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black flex">
      <MemberSidebar active="Dashboard" onSearchOpen={() => setSearchOpen(true)} />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {liveSession && <LiveBanner session={liveSession} />}
        <HeroPanel upcoming={upcoming} user={user} memberships={memberships} />
        <StatsRow memberships={memberships} completedCount={completedCount} />
        <MyGyms memberships={memberships} />
        <UpcomingClasses sessions={upcoming} />
        <RecentReplays replays={replays} />
        <AICoachSection />

        {memberships.length === 0 && (
          <section className="border-b border-[#333333]">
            <div className="max-w-[1280px] mx-auto px-6 py-8">
              <InsightCard body="Welcome to Matpeak. Browse gyms and join one with your invite code to start training." />
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
