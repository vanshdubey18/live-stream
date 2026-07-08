'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MemberSidebar from '@/components/layout/MemberSidebar'
import InsightCard from '@/components/ui/InsightCard'
import EmptyState from '@/components/ui/EmptyState'
import { ChevronRight, ArrowRight, ArrowUpRight, Play, Clock, RotateCcw, CalendarDays, Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cfThumbnailUrl } from '@/lib/cf-thumbnail'

interface Props {
  user: { name: string; email: string }
  memberships: any[]
  upcoming: any[]
  replays: any[]
  liveSession: any | null
  completedCount: number
  totalHours: number
  monthCount: number
  gymIds: string[]
  gymNames: Record<string, string>
  announcements: any[]
}

const DISCIPLINE_COLOR: Record<string, string> = {
  BJJ: '#f0eadc',
  Boxing: '#a29c8c',
  'Muay Thai': '#7a7568',
  Wrestling: '#322f26',
  MMA: '#635f54',
}

// Placeholder training photos shown until a replay has a real Cloudflare
// Stream thumbnail (cf_video_uid). Swap for real class photography when
// available — these are just to avoid an empty card in the meantime.
const MOCK_REPLAY_PHOTOS = [
  'https://images.pexels.com/photos/4761598/pexels-photo-4761598.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/5750947/pexels-photo-5750947.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6296121/pexels-photo-6296121.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7991692/pexels-photo-7991692.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6793653/pexels-photo-6793653.jpeg?auto=compress&cs=tinysrgb&w=800',
]

function mockPhotoFor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return MOCK_REPLAY_PHOTOS[hash % MOCK_REPLAY_PHOTOS.length]
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
function formatAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 60) return `${Math.max(diff, 1)}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function LiveBanner({ session }: { session: any }) {
  return (
    <motion.a
      href={`/watch/${session.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="block border-b border-[#322f26] bg-[#1c1c16] hover:bg-[#242420] transition-colors duration-150"
    >
      <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#b3402f] live-pulse" />
            <span className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Live Now</span>
          </div>
          <span className="font-mincho text-xl text-[#f0eadc] tracking-[1px]">{session.title}</span>
          <span className="font-mincho text-sm text-[#a29c8c] hidden sm:inline">
            {session.gyms?.name ?? session.gym_name}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#b3402f] shrink-0">
          <span className="font-mincho text-xs">Watch now</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </motion.a>
  )
}

// ─── Streak Ring ──────────────────────────────────────────────────────────────
function StreakRing({ weekSessions, goal = 4 }: { weekSessions: number; goal?: number }) {
  const size = 180
  const strokeWidth = 8
  const r = (size - strokeWidth * 2) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const progress = Math.min(weekSessions / goal, 1)
  const dash = circumference * progress
  const gap = circumference - dash

  // Day-of-week dots (Mon–Sun), highlight days with upcoming sessions
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const now = new Date()
  const weekDayStart = new Date(now)
  weekDayStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // Monday

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Ring */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Ambient glow behind the whole ring */}
        <div className="absolute -inset-6 bg-[#b3402f]/[0.08] blur-[36px] rounded-full pointer-events-none" />
        {/* Glow layer */}
        <svg className="absolute inset-0 blur-[8px] opacity-50" width={size} height={size}>
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#b3402f"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        {/* Track ring */}
        <svg className="absolute inset-0" width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1c1c16" strokeWidth={strokeWidth} />
        </svg>
        {/* Progress ring */}
        <svg className="absolute inset-0" width={size} height={size}>
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b3402f" />
              <stop offset="100%" stopColor="#c25040" />
            </linearGradient>
          </defs>
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="font-mincho text-[52px] text-[#f0eadc] leading-none tracking-[1px]">
            {weekSessions}
          </span>
          <span className="font-mincho text-[10px] text-[#7a7568] uppercase tracking-[3px]">
            / {goal} this week
          </span>
        </div>
      </div>

      {/* Day dots */}
      <div className="flex items-center gap-3">
        {dayLabels.map((label, i) => {
          const day = new Date(weekDayStart)
          day.setDate(weekDayStart.getDate() + i)
          const isPast = day < now && day.toDateString() !== now.toDateString()
          const isToday = day.toDateString() === now.toDateString()
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isToday ? 'bg-[#b3402f]' : isPast ? 'bg-[#322f26]' : 'bg-[#242420]'
                }`}
              />
              <span className={`font-mincho text-[9px] uppercase tracking-[1px] ${isToday ? 'text-[#f0eadc]' : 'text-[#635f54]'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
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
    <section className="relative border-b border-[#322f26] overflow-hidden">
      {/* Ambient glow — atmospheric depth behind the hero stat */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-[#b3402f]/[0.07] blur-[100px] rounded-full pointer-events-none" />
      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-px bg-[#b3402f]" />
          <p className="font-mincho text-[11px] text-[#b3402f] uppercase tracking-[4px]">Today&apos;s Training</p>
        </div>
        <div className="relative inline-block">
          <div className="absolute -inset-6 bg-[#b3402f]/[0.12] blur-[40px] rounded-full pointer-events-none" />
          <div className="relative font-mincho text-[56px] sm:text-[80px] lg:text-[96px] text-[#f0eadc] leading-none tracking-[1px]">
            {todayCount || upcoming.length || 0}
          </div>
        </div>
        <p className="font-mincho text-sm text-[#a29c8c] mt-3">
          {(todayCount || upcoming.length) ? 'Classes available today' : 'No classes scheduled yet'}
        </p>
        <p className="font-mincho text-xs text-[#7a7568] mt-1 uppercase tracking-[2px]">
          Good to see you, {firstName}
        </p>

        {memberships.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {memberships.map((m: any) => (
              <span
                key={m.id ?? m.gyms?.id}
                className="inline-flex items-center gap-2 font-mincho text-[11px] text-[#c9bda0] tracking-[3px] uppercase border border-[#322f26] bg-[#1c1c16] px-3 py-1.5 rounded-sm"
              >
                {m.gyms?.logo_url ? (
                  <img src={m.gyms.logo_url} alt="" className="w-4 h-4 rounded-sm object-cover shrink-0 grayscale" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#c9bda0] shrink-0" />
                )}
                Member of {m.gyms?.name ?? 'your gym'}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Card chrome shared by the Activity Ring card and the stat boxes ─────────
// The whole card is the link (StatCard below) — this header just renders the
// label + a circular affordance button that reacts to the card's own hover.
function CardHeader({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[3px]">{label}</p>
      <span className="w-8 h-8 rounded-full border border-[#322f26] bg-[#242420] flex items-center justify-center text-[#a29c8c] group-hover:text-[#f0eadc] group-hover:border-[#b3402f]/40 group-hover:bg-[#2a2a20] transition-colors duration-150 shrink-0">
        <Icon size={14} />
      </span>
    </div>
  )
}

function StatCard({ href, delay, children }: { href: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay }}
      whileHover={{ y: -2 }}
      className="group block border border-[#322f26] rounded-sm bg-[#1c1c16] hover:bg-[#201f19] hover:border-[#3a3630] transition-colors duration-150 p-5 cursor-pointer"
    >
      {children}
    </motion.a>
  )
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
const DISCIPLINE_BAR_COLOR: Record<string, string> = {
  BJJ: '#b3402f',
  Boxing: '#f0eadc',
  'Muay Thai': '#a29c8c',
  Wrestling: '#7a7568',
  MMA: '#635f54',
  Kickboxing: '#7a7568',
  Judo: '#322f26',
  Sambo: '#2a2a20',
}

function StatsRow({ completedCount, totalHours, monthCount, upcoming, replays }: {
  memberships?: any[]
  completedCount: number
  totalHours: number
  monthCount: number
  upcoming: any[]
  replays: any[]
}) {
  const weekGoal = 4
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  const weekCount = upcoming.filter(s => {
    const d = new Date(s.scheduled_at)
    return d >= weekStart && d < weekEnd
  }).length

  // 7-day bar chart — combine upcoming + replays
  const allSessions = [...upcoming, ...replays]
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const dayCounts = dayLabels.map((_, i) => {
    const dayStart = new Date(weekStart)
    dayStart.setDate(weekStart.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayStart.getDate() + 1)
    return allSessions.filter(s => {
      const d = new Date(s.scheduled_at ?? s.created_at)
      return d >= dayStart && d < dayEnd
    }).length
  })
  const maxDayCount = Math.max(...dayCounts, 1)
  const todayIdx = (now.getDay() + 6) % 7

  // Discipline breakdown
  const discCounts: Record<string, number> = {}
  allSessions.forEach(s => {
    const d = s.discipline ?? 'Other'
    discCounts[d] = (discCounts[d] ?? 0) + 1
  })
  const totalDisc = Object.values(discCounts).reduce((a, b) => a + b, 0) || 1
  const topDisc = Object.entries(discCounts).sort(([, a], [, b]) => b - a).slice(0, 5)

  return (
    <section className="border-b border-[#322f26] bg-[#18180f]">
      <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-4">

        {/* ── Activity Ring card ── */}
        <motion.a
          href="/dashboard/schedule"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          whileHover={{ y: -2 }}
          className="group block border border-[#322f26] rounded-sm bg-[#1c1c16] hover:bg-[#201f19] hover:border-[#3a3630] transition-colors duration-150 p-6 cursor-pointer"
        >
          <CardHeader label="Weekly Goal" icon={ArrowUpRight} />
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <StreakRing weekSessions={weekCount} goal={weekGoal} />
            <div className="flex-1 text-center sm:text-left pt-2">
              <p className="font-mincho text-sm text-[#f0eadc]">
                {weekCount >= weekGoal ? 'Weekly goal reached.' : `${weekGoal - weekCount} session${weekGoal - weekCount === 1 ? '' : 's'} to hit your goal.`}
              </p>
              <p className="font-mincho text-xs text-[#7a7568] mt-1.5">
                {weekCount} of {weekGoal} classes this week across every gym you train at.
              </p>
              <p className="font-mincho text-[10px] text-[#7a7568] group-hover:text-[#a29c8c] uppercase tracking-[2px] mt-4 transition-colors duration-150">
                View schedule &rarr;
              </p>
            </div>
          </div>
        </motion.a>

        {/* ── 2x2 stat box grid — every card is a real link, not just the icon ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* This Week — sparkline is the 7-day bar chart */}
          <StatCard href="/dashboard/schedule" delay={0.05}>
            <CardHeader label="This Week" icon={CalendarDays} />
            <div className="flex items-baseline gap-1 mb-3">
              <span className="font-mincho text-4xl text-[#f0eadc] leading-none tracking-[1px]">{weekCount}</span>
              <span className="font-mincho text-lg text-[#635f54] leading-none tracking-[1px]">/{weekGoal}</span>
            </div>
            <div className="flex items-end gap-1 h-8">
              {dayCounts.map((count, i) => {
                const isToday = i === todayIdx
                const heightPct = count > 0 ? Math.max((count / maxDayCount) * 100, 25) : 10
                return (
                  <motion.div
                    key={i}
                    className={`flex-1 rounded-sm ${isToday ? 'bg-[#b3402f]' : count > 0 ? 'bg-[#7a7568]' : 'bg-[#242420]'}`}
                    style={{ height: `${heightPct}%` }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 + i * 0.04 }}
                  />
                )
              })}
            </div>
          </StatCard>

          {/* Hours Trained */}
          <StatCard href="/dashboard/replays" delay={0.1}>
            <CardHeader label="Hours Trained" icon={Clock} />
            <div className="font-mincho text-4xl text-[#f0eadc] leading-none tracking-[1px] mb-3">{totalHours}h</div>
            <p className="font-mincho text-[11px] text-[#7a7568]">Total mat time logged</p>
          </StatCard>

          {/* Replays */}
          <StatCard href="/dashboard/replays" delay={0.15}>
            <CardHeader label="Replays" icon={RotateCcw} />
            <div className="font-mincho text-4xl text-[#f0eadc] leading-none tracking-[1px] mb-3">{completedCount}</div>
            <p className="font-mincho text-[11px] text-[#7a7568]">Classes completed all-time</p>
          </StatCard>

          {/* This Month — discipline split lives here since it's also an aggregate view */}
          <StatCard href="/dashboard/replays" delay={0.2}>
            <CardHeader label="This Month" icon={ChevronRight} />
            <div className="font-mincho text-4xl text-[#f0eadc] leading-none tracking-[1px] mb-3">{monthCount}</div>
            {totalDisc > 1 ? (
              <div className="flex h-1.5 rounded-sm overflow-hidden gap-px">
                {topDisc.map(([disc, count]) => (
                  <motion.div
                    key={disc}
                    style={{ backgroundColor: DISCIPLINE_BAR_COLOR[disc] ?? '#444', width: `${(count / totalDisc) * 100}%` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut', delay: 0.35 }}
                  />
                ))}
              </div>
            ) : (
              <p className="font-mincho text-[11px] text-[#7a7568]">Classes completed this month</p>
            )}
          </StatCard>
        </div>

      </div>
    </section>
  )
}

// ─── My Gyms ─────────────────────────────────────────────────────────────────
function MyGyms({ memberships }: { memberships: any[] }) {
  if (!memberships.length) return null

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-5 h-px bg-[#b3402f]" />
        <p className="font-mincho text-[11px] text-[#b3402f] uppercase tracking-[4px]">My Gyms</p>
      </div>
      <div className="space-y-3">
        {memberships.map((m: any, i: number) => {
          const gym = m.gyms ?? {}
          const disciplines: string[] = gym.disciplines ?? m.disciplines ?? []
          const isLive = m.nextSession?.status === 'live'
          const nextTime = m.nextSession?.scheduled_at ? formatRelDay(m.nextSession.scheduled_at) : null
          const image = gym.cover_url ?? gym.logo_url

          return (
            <motion.a
              key={m.id ?? gym.id}
              href={`/gyms/${gym.slug ?? ''}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="relative block h-28 rounded-sm overflow-hidden border border-[#322f26] group bg-[#1c1c16]"
            >
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center font-mincho text-[64px] text-[#f0eadc]/[0.04] leading-none select-none pointer-events-none">
                  {(gym.name ?? 'G').charAt(0)}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141410] via-[#141410]/60 to-transparent" />
              <div className="absolute inset-0 bg-[#b3402f]/[0.06] mix-blend-overlay" />

              <div className="relative h-full flex flex-col justify-end p-4">
                <div className="flex items-center gap-2 mb-1">
                  {isLive && (
                    <span className="flex items-center gap-1.5 font-mincho text-[9px] text-[#b3402f] tracking-[2px] uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b3402f] live-pulse" />
                      Live
                    </span>
                  )}
                  {nextTime && !isLive && (
                    <span className="font-mincho text-[9px] text-[#a29c8c] tracking-[2px] uppercase">Next {nextTime}</span>
                  )}
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mincho text-lg text-[#f0eadc] tracking-[1px] leading-none truncate group-hover:text-[#c9bda0] transition-colors duration-150">
                      {gym.name ?? 'Unknown Gym'}
                    </p>
                    <p className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[1px] mt-1.5 truncate">
                      {disciplines.slice(0, 3).join(' · ')}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-[#a29c8c] group-hover:text-[#f0eadc] group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
                </div>
              </div>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}

// ─── Announcements ────────────────────────────────────────────────────────────
function Announcements({ announcements }: { announcements: any[] }) {
  if (!announcements.length) return null

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-5 h-px bg-[#b3402f]" />
        <p className="font-mincho text-[11px] text-[#b3402f] uppercase tracking-[4px]">Announcements</p>
      </div>
      <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm divide-y divide-[#242420]">
        {announcements.slice(0, 4).map((a: any, i: number) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.05 }}
            className="px-4 py-3.5 flex items-start gap-3"
          >
            <Megaphone size={14} className="text-[#b3402f] mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-mincho text-sm text-[#f0eadc] leading-relaxed">{a.body}</p>
              <p className="font-mincho text-[10px] text-[#7a7568] mt-1.5 uppercase tracking-[1px]">
                {a.gyms?.name ?? 'Your gym'} · {formatAgo(a.created_at)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Upcoming Classes ─────────────────────────────────────────────────────────
function UpcomingClasses({ sessions }: { sessions: any[] }) {
  const items = sessions.slice(0, 3)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-5 h-px bg-[#b3402f]" />
          <p className="font-mincho text-[11px] text-[#b3402f] uppercase tracking-[4px]">Upcoming Classes</p>
        </div>
        <a href="/dashboard/schedule" className="font-mincho text-xs text-[#7a7568] hover:text-[#f0eadc] transition-colors flex items-center gap-1">
          View all <ChevronRight size={12} />
        </a>
      </div>

      {items.length === 0 ? (
        <EmptyState ghost="LIVE" message="No upcoming classes. Join a gym to get started." />
      ) : (
        <div className="divide-y divide-[#322f26] border border-[#322f26] rounded-sm bg-[#1c1c16]">
          {items.map((s: any, i: number) => {
            const discipline = s.discipline ?? 'BJJ'
            const dotColor = DISCIPLINE_COLOR[discipline] ?? '#a29c8c'
            return (
              <motion.a
                key={s.id}
                href={`/watch/${s.id}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
                whileHover={{ x: 3 }}
                className="flex items-center gap-4 px-5 py-4 group"
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                <div className="flex-1 min-w-0">
                  <p className="font-mincho text-lg text-[#f0eadc] tracking-[1px] leading-none mb-1 group-hover:text-[#b3402f] transition-colors duration-150 truncate">
                    {s.title}
                  </p>
                  <p className="font-mincho text-xs text-[#7a7568] truncate">
                    {s.coaches?.name ?? 'Coach'}&nbsp;·&nbsp;{s.gyms?.name ?? ''}
                  </p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="font-mincho text-sm text-[#a29c8c]">{formatTime(s.scheduled_at)}</p>
                  <p className="font-mincho text-[11px] text-[#7a7568]">{formatRelDay(s.scheduled_at)}</p>
                </div>
                <span className="font-mincho text-[10px] text-[#7a7568] uppercase tracking-[2px] border border-[#322f26] bg-[#242420] px-2 py-0.5 rounded-sm shrink-0 hidden md:inline-block">
                  {discipline}
                </span>
              </motion.a>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ReplayCard({ s, i }: { s: any; i: number }) {
  const cfThumb = cfThumbnailUrl(s.cf_video_uid)
  const [imgSrc, setImgSrc] = useState<string | null>(cfThumb ?? mockPhotoFor(String(s.id)))

  return (
    <motion.a
      href={`/replay/${s.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: i * 0.04 }}
      whileHover={{ y: -3 }}
      className="block group border border-[#322f26] rounded-sm overflow-hidden bg-[#1c1c16]"
    >
      <div className="relative h-32 overflow-hidden bg-[#18180f]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            onError={() => setImgSrc(null)}
            className="absolute inset-0 w-full h-full object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-mincho text-[56px] text-[#f0eadc]/[0.04] leading-none select-none pointer-events-none">
            {s.discipline?.charAt(0) ?? 'M'}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c16] via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <span className="w-9 h-9 rounded-full bg-[#141410]/70 border border-[#f0eadc]/30 flex items-center justify-center backdrop-blur-sm">
            <Play size={14} className="text-[#f0eadc] ml-0.5" fill="currentColor" />
          </span>
        </div>
        <span className="absolute top-2.5 left-2.5 font-mincho text-[9px] text-[#f0eadc] uppercase tracking-[2px] border border-[#f0eadc]/20 bg-[#141410]/70 backdrop-blur-sm px-2 py-0.5 rounded-sm">
          {s.discipline ?? 'BJJ'}
        </span>
        {s.ai_summary && (
          <span className="absolute top-2.5 right-2.5 font-mincho text-[9px] text-[#b3402f] uppercase tracking-[2px] border border-[#b3402f]/30 bg-[#141410]/70 backdrop-blur-sm px-2 py-0.5 rounded-sm">
            AI Notes
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-mincho text-base text-[#f0eadc] leading-tight tracking-[1px] mb-1.5 group-hover:text-[#b3402f] transition-colors duration-150 truncate">
          {s.title}
        </p>
        <p className="font-mincho text-xs text-[#7a7568] truncate">
          {s.coaches?.name ?? 'Coach'}&nbsp;·&nbsp;{s.duration_minutes ?? 60}m
        </p>
      </div>
    </motion.a>
  )
}

// ─── Recent Replays ───────────────────────────────────────────────────────────
function RecentReplays({ replays, hasGyms }: { replays: any[]; hasGyms: boolean }) {
  const items = replays.slice(0, 3)
  if (!items.length && !hasGyms) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-5 h-px bg-[#b3402f]" />
          <p className="font-mincho text-[11px] text-[#b3402f] uppercase tracking-[4px]">Replay Library</p>
        </div>
        <a href="/dashboard/replays" className="font-mincho text-xs text-[#7a7568] hover:text-[#f0eadc] transition-colors flex items-center gap-1">
          View all <ChevronRight size={12} />
        </a>
      </div>

      {items.length === 0 ? (
        <EmptyState ghost="REPLAY" message="No replays yet. They'll show up here once a class you attend ends." size="sm" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {items.map((s: any, i: number) => <ReplayCard key={s.id} s={s} i={i} />)}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardClient({ user, memberships, upcoming, replays, liveSession: initialLiveSession, completedCount, totalHours, monthCount, gymIds, gymNames, announcements }: Props) {
  const [, setSearchOpen] = useState(false)
  const [liveSession, setLiveSession] = useState<any | null>(initialLiveSession)

  // Real-time: detect when any session in member's gyms goes live or ends
  useEffect(() => {
    if (!gymIds.length) return
    const supabase = createClient()
    const channel = supabase.channel('dashboard-live-sessions')
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'sessions' },
      (payload) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = payload.new as any
        if (!gymIds.includes(s.gym_id)) return
        if (s.status === 'live') {
          setLiveSession({ ...s, gyms: { name: gymNames[s.gym_id] ?? '' } })
        } else {
          setLiveSession((prev: any | null) => prev?.id === s.id ? null : prev)
        }
      }
    )
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [gymIds, gymNames])

  // Fallback poll — catches "gym went live" within a few seconds even if the
  // Realtime subscription above misses the event (e.g. table not replicated yet).
  useEffect(() => {
    if (!gymIds.length) return
    let cancelled = false
    const poll = async () => {
      try {
        const res = await fetch(`/api/member/live-sessions?gym_ids=${gymIds.join(',')}`)
        const data = await res.json()
        if (cancelled) return
        if (data.session) {
          setLiveSession((prev: any | null) => prev?.id === data.session.id ? prev : { ...data.session, gyms: { name: gymNames[data.session.gym_id] ?? '' } })
        } else {
          setLiveSession(null)
        }
      } catch { /* ignore */ }
    }
    const t = setInterval(poll, 5_000)
    return () => { cancelled = true; clearInterval(t) }
  }, [gymIds, gymNames])

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <MemberSidebar active="Dashboard" onSearchOpen={() => setSearchOpen(true)} />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {liveSession && <LiveBanner session={liveSession} />}
        <HeroPanel upcoming={upcoming} user={user} memberships={memberships} />
        <StatsRow memberships={memberships} completedCount={completedCount} totalHours={totalHours} monthCount={monthCount} upcoming={upcoming} replays={replays} />

        <section className="max-w-[1280px] mx-auto px-6 py-8">
          {memberships.length === 0 ? (
            <InsightCard body="Welcome to Matpeak. Browse gyms and join one with your invite code to start training." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Main feed */}
              <div className="lg:col-span-2 space-y-10">
                <UpcomingClasses sessions={upcoming} />
                <RecentReplays replays={replays} hasGyms={memberships.length > 0} />
              </div>
              {/* Rail */}
              <div className="lg:col-span-1 space-y-10">
                <Announcements announcements={announcements} />
                <MyGyms memberships={memberships} />
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
