'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronDown, User, CreditCard, LogOut,
  Radio, Calendar, Play, Clock, Flame,
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

interface MatpeakPrefs {
  disciplines: string[]
  level: string
  goal: string
}

// ─── Static data ──────────────────────────────────────────────────────────────
const RECOMMENDED = [
  {
    id: 'r1',
    title: 'Advanced BJJ — Guard Passing',
    discipline: 'BJJ',
    level: 'Advanced',
    gym: 'Xtreme MMA Mumbai',
    datetime: 'Mon, 26 May · 7:00 AM',
    label: 'Matches your goal',
  },
  {
    id: 'r2',
    title: 'Boxing Fundamentals',
    discipline: 'Boxing',
    level: 'Beginner',
    gym: 'Strike Lab Boxing',
    datetime: 'Tue, 27 May · 6:30 PM',
    label: 'Perfect for beginners',
  },
  {
    id: 'r3',
    title: 'Muay Thai Clinch Work',
    discipline: 'Muay Thai',
    level: 'Intermediate',
    gym: 'Xtreme MMA Mumbai',
    datetime: 'Wed, 28 May · 8:00 AM',
    label: 'Popular this week',
  },
  {
    id: 'r4',
    title: 'No-Gi Submission Wrestling',
    discipline: 'Wrestling',
    level: 'Intermediate',
    gym: 'Xtreme MMA Mumbai',
    datetime: 'Thu, 29 May · 7:30 AM',
    label: 'Matches your disciplines',
  },
]

const TRENDING = [
  {
    id: 't1',
    title: 'BJJ Open Mat — No Rules',
    discipline: 'BJJ',
    gym: 'Xtreme MMA Mumbai',
    watching: 34,
  },
  {
    id: 't2',
    title: 'Heavy Bag Boxing Blast',
    discipline: 'Boxing',
    gym: 'Strike Lab Boxing',
    watching: 21,
  },
  {
    id: 't3',
    title: 'Muay Thai Sparring Session',
    discipline: 'Muay Thai',
    gym: 'Xtreme MMA Mumbai',
    watching: 19,
  },
  {
    id: 't4',
    title: 'MMA Ground & Pound',
    discipline: 'MMA',
    gym: 'Xtreme MMA Mumbai',
    watching: 15,
  },
]

const CONTINUE_WATCHING = [
  { id: 'cw1', title: 'Back Takes & RNC Finish', discipline: 'BJJ', progress: 65, duration: 42 },
  { id: 'cw2', title: 'Teep & Push Kick Defence', discipline: 'Muay Thai', progress: 30, duration: 38 },
]

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

function goalSubtitle(goal: string): string {
  switch (goal) {
    case 'fit': return 'Ready to sweat today?'
    case 'self_defense': return 'Ready to protect yourself?'
    case 'athlete': return 'Ready to grind?'
    case 'compete': return 'Time to sharpen your edge.'
    case 'complete': return 'Ready to evolve?'
    default: return 'Ready to train?'
  }
}

const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
  MMA: 'bg-purple-500/10 text-purple-400',
  Kickboxing: 'bg-pink-500/10 text-pink-400',
}

const DISCIPLINE_LABEL: Record<string, string> = {
  BJJ: 'BJJ',
  Boxing: 'Boxing',
  'Muay Thai': 'Muay Thai',
  Wrestling: 'Wrestling',
  MMA: 'MMA',
  Kickboxing: 'Kickboxing',
}

// ─── Fade-in section wrapper ──────────────────────────────────────────────────
function FadeSection({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="text-white font-black text-lg mb-4">{children}</h2>
}

// ─── Discipline Pill ──────────────────────────────────────────────────────────
function DisciplinePill({ discipline }: { discipline: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${DISCIPLINE_COLORS[discipline] ?? 'bg-white/5 text-white/60'}`}>
      {DISCIPLINE_LABEL[discipline] ?? discipline}
    </span>
  )
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ name }: { name: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#111111] border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all"
      >
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
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-[#888888] hover:text-white hover:bg-white/5 text-sm transition-colors"
              >
                {item.icon} {item.label}
              </a>
            ))}
            <div className="border-t border-white/5" />
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-3 px-4 py-3 text-[#888888] hover:text-red-400 hover:bg-white/5 text-sm transition-colors w-full"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Recommended Card ─────────────────────────────────────────────────────────
function RecommendedCard({ item }: { item: typeof RECOMMENDED[0] }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-xl hover:border-white/10 transition-all flex-shrink-0 w-64 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <DisciplinePill discipline={item.discipline} />
        <span className="text-[#666] text-xs shrink-0">{item.level}</span>
      </div>
      <div>
        <p className="text-white font-bold text-sm leading-snug">{item.title}</p>
        <p className="text-[#666] text-xs mt-1">{item.gym}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[#555] text-xs">{item.datetime}</p>
      </div>
      <div className="mt-auto">
        <span className="inline-block text-xs text-[#DC2626] bg-[#DC2626]/10 border border-[#DC2626]/20 px-2.5 py-1 rounded-full font-medium">
          {item.label}
        </span>
      </div>
    </div>
  )
}

// ─── Trending Card ────────────────────────────────────────────────────────────
function TrendingCard({ item }: { item: typeof TRENDING[0] }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-xl hover:border-white/10 transition-all flex-shrink-0 w-56 p-4 flex flex-col gap-3">
      <DisciplinePill discipline={item.discipline} />
      <p className="text-white font-bold text-sm leading-snug">{item.title}</p>
      <p className="text-[#666] text-xs">{item.gym}</p>
      <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold mt-auto">
        <Flame size={13} />
        <span>{item.watching} watching</span>
      </div>
    </div>
  )
}

// ─── Continue Watching Card ───────────────────────────────────────────────────
function ContinueCard({ item }: { item: typeof CONTINUE_WATCHING[0] }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-xl hover:border-white/10 transition-all flex-1 min-w-[220px] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <DisciplinePill discipline={item.discipline} />
        <span className="text-[#666] text-xs flex items-center gap-1">
          <Clock size={11} /> {item.duration} min
        </span>
      </div>
      <p className="text-white font-bold text-sm leading-snug">{item.title}</p>
      <div className="mt-auto space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[#555] text-xs">{item.progress}% complete</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#DC2626] rounded-full transition-all"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      </div>
      <button className="mt-1 w-full flex items-center justify-center gap-1.5 border border-white/10 hover:border-[#DC2626]/40 hover:bg-[#DC2626]/5 text-white text-xs font-semibold py-2 rounded-xl transition-all">
        <Play size={12} className="fill-white" /> Resume
      </button>
    </div>
  )
}

// ─── Empty Gym Cards (discipline-based) ──────────────────────────────────────
function EmptyGymCards({ prefs }: { prefs: MatpeakPrefs }) {
  const showXtreme =
    prefs.disciplines.length === 0 ||
    prefs.disciplines.some((d) => ['BJJ', 'Muay Thai', 'Wrestling', 'MMA'].includes(d))
  const showBoxing =
    prefs.disciplines.length === 0 || prefs.disciplines.includes('Boxing')

  const gyms = [
    showXtreme && {
      name: 'Xtreme MMA Mumbai',
      city: 'Mumbai',
      disciplines: ['BJJ', 'Muay Thai', 'Wrestling', 'MMA'],
      slug: 'xtreme-mma-mumbai',
    },
    showBoxing && {
      name: 'Strike Lab Boxing',
      city: 'Mumbai',
      disciplines: ['Boxing'],
      slug: 'strike-lab-boxing',
    },
  ].filter(Boolean) as { name: string; city: string; disciplines: string[]; slug: string }[]

  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-white/5 rounded-2xl px-6 py-8 text-center">
        <p className="text-white font-black text-xl mb-2">Start training today</p>
        <p className="text-[#666] text-sm mb-6">Join a gym and get access to live classes, replays, and schedules.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {gyms.map((gym) => (
            <a
              key={gym.slug}
              href={`/gyms/${gym.slug}`}
              className="bg-[#0a0a0a] border border-white/10 hover:border-white/20 rounded-xl px-5 py-4 text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-[#DC2626]/20 flex items-center justify-center mb-2">
                <span className="text-[#DC2626] font-black text-xs">{gym.name[0]}</span>
              </div>
              <p className="text-white font-bold text-sm">{gym.name}</p>
              <p className="text-[#666] text-xs mb-2">{gym.city}</p>
              <div className="flex flex-wrap gap-1">
                {gym.disciplines.map((d) => (
                  <DisciplinePill key={d} discipline={d} />
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardClient({ user, memberships, upcoming, replays, liveSession }: Props) {
  const [prefs, setPrefs] = useState<MatpeakPrefs>({ disciplines: [], level: '', goal: '' })
  const grouped = groupByDay(upcoming)

  // Read onboarding prefs from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('matpeak_prefs')
      if (raw) {
        const parsed = JSON.parse(raw) as MatpeakPrefs
        setPrefs(parsed)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const firstName = user.name.split(' ')[0]
  const subtitle = goalSubtitle(prefs.goal)
  const topDiscipline = prefs.disciplines[0] ?? null

  const hasGyms = memberships.length > 0

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <MemberSidebar active="Dashboard" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-[#888888] text-xs">{subtitle}</p>
          </div>
          <ProfileDropdown name={user.name} />
        </div>

        <div className="px-6 py-6 space-y-10 max-w-5xl">

          {/* ── SECTION 1: Welcome Header ─────────────────────────────────── */}
          <FadeSection delay={0}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-black text-2xl">
                  Hey, {firstName} 👋
                </h2>
                <p className="text-[#666] text-sm mt-1">{subtitle}</p>
              </div>
              {topDiscipline && (
                <div className="shrink-0 mt-1">
                  <DisciplinePill discipline={topDiscipline} />
                </div>
              )}
            </div>
          </FadeSection>

          {/* ── SECTION 2: Happening Now ──────────────────────────────────── */}
          <FadeSection delay={0.1}>
            <SectionHeader>⚡ Happening Now</SectionHeader>
            {liveSession ? (
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
                <a
                  href={`/watch/${liveSession.id}`}
                  className="shrink-0 bg-[#DC2626] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Join Now
                </a>
              </div>
            ) : (
              <p className="text-[#555] text-sm">No classes live right now — check back soon.</p>
            )}
          </FadeSection>

          {/* ── SECTION 3: Recommended for You ───────────────────────────── */}
          <FadeSection delay={0.2}>
            <SectionHeader>🎯 Recommended for You</SectionHeader>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {RECOMMENDED.map((item) => (
                <RecommendedCard key={item.id} item={item} />
              ))}
            </div>
          </FadeSection>

          {/* ── SECTION 4: My Schedule This Week ─────────────────────────── */}
          <FadeSection delay={0.3}>
            <SectionHeader>📅 My Schedule This Week</SectionHeader>
            {!hasGyms ? (
              <EmptyGymCards prefs={prefs} />
            ) : grouped.length === 0 ? (
              <div className="bg-[#111] border border-white/5 rounded-2xl px-6 py-8 text-center">
                <Calendar size={28} className="text-[#555] mx-auto mb-3" />
                <p className="text-[#666] text-sm">No upcoming classes this week.</p>
              </div>
            ) : (
              <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
                {grouped.map((group, gi) => (
                  <div key={group.label}>
                    {gi > 0 && <div className="border-t border-white/5" />}
                    <div className="px-4 py-2.5 bg-white/[0.02]">
                      <span className="text-[#888888] text-xs font-bold uppercase tracking-widest">{group.label}</span>
                    </div>
                    {group.sessions.map((s: any) => (
                      <div
                        key={s.id}
                        className={`flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.03] transition-colors
                          ${s.status === 'live' ? 'bg-[#DC2626]/5 border-l-2 border-[#DC2626]' : ''}`}
                      >
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
                          <DisciplinePill discipline={s.discipline} />
                          <span className="text-xs text-[#555]">{s.level}</span>
                        </div>
                        {s.status === 'live' && (
                          <a
                            href={`/watch/${s.id}`}
                            className="shrink-0 bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Watch
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </FadeSection>

          {/* ── SECTION 5: Trending This Week ────────────────────────────── */}
          <FadeSection delay={0.4}>
            <SectionHeader>🔥 Trending This Week</SectionHeader>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {TRENDING.map((item) => (
                <TrendingCard key={item.id} item={item} />
              ))}
            </div>
          </FadeSection>

          {/* ── SECTION 6: Continue Watching ─────────────────────────────── */}
          <FadeSection delay={0.5}>
            <div className="flex items-center justify-between mb-4">
              <SectionHeader>📚 Continue Watching</SectionHeader>
              <a href="/dashboard/replays" className="text-[#888] hover:text-white text-sm transition-colors">
                View all
              </a>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {CONTINUE_WATCHING.map((item) => (
                <ContinueCard key={item.id} item={item} />
              ))}
            </div>
          </FadeSection>

        </div>
      </main>
    </div>
  )
}
