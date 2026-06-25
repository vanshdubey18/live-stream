'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MemberSidebar from '@/components/layout/MemberSidebar'
import InsightCard from '@/components/ui/InsightCard'
import { ChevronRight, ArrowRight, BookOpen, Sparkles, Layers, MessageCircle, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
        {/* Glow layer */}
        <svg className="absolute inset-0 blur-[6px] opacity-40" width={size} height={size}>
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#FF3B3B"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        {/* Track ring */}
        <svg className="absolute inset-0" width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1A1A1A" strokeWidth={strokeWidth} />
        </svg>
        {/* Progress ring */}
        <svg className="absolute inset-0" width={size} height={size}>
          <defs>
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF3B3B" />
              <stop offset="100%" stopColor="#FF6B6B" />
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
          <span className="font-bebas text-[52px] text-white leading-none tracking-[1px]">
            {weekSessions}
          </span>
          <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px]">
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
                  isToday ? 'bg-[#FF3B3B]' : isPast ? 'bg-[#333333]' : 'bg-[#222222]'
                }`}
              />
              <span className={`font-inter text-[9px] uppercase tracking-[1px] ${isToday ? 'text-white' : 'text-[#444444]'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      <p className="font-inter text-[10px] text-[#444444] uppercase tracking-[3px]">Weekly Goal</p>
    </div>
  )
}

// ─── Hero Status Panel ────────────────────────────────────────────────────────
function HeroPanel({ upcoming, user, memberships }: { upcoming: any[]; user: { name: string }; memberships: any[] }) {
  const todayCount = upcoming.filter(s => {
    const d = new Date(s.scheduled_at)
    return d.toDateString() === new Date().toDateString()
  }).length

  // Count sessions this week (Mon–Sun)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  const weekCount = upcoming.filter(s => {
    const d = new Date(s.scheduled_at)
    return d >= weekStart && d < weekEnd
  }).length

  const firstName = user.name?.split(' ')[0] ?? 'Fighter'

  return (
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-px bg-[#FF3B3B]" />
              <p className="font-inter text-[11px] text-[#FF3B3B] uppercase tracking-[4px]">Today&apos;s Training</p>
            </div>
            <div className="font-bebas text-[56px] sm:text-[80px] lg:text-[96px] text-white leading-none tracking-[1px]">
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
                      <span className="w-1.5 h-1.5 rounded-sm bg-[#00D4AA] shrink-0" />
                    )}
                    Member of {m.gyms?.name ?? 'your gym'}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Streak ring — desktop: right side, mobile: below text */}
          <div className="flex justify-center lg:justify-end">
            <StreakRing weekSessions={weekCount} goal={4} />
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
const DISCIPLINE_BAR_COLOR: Record<string, string> = {
  BJJ: '#FF3B3B',
  Boxing: '#FFFFFF',
  'Muay Thai': '#999999',
  Wrestling: '#666666',
  MMA: '#444444',
  Kickboxing: '#555555',
  Judo: '#333333',
  Sambo: '#2A2A2A',
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
  const weekProgress = Math.min(weekCount / weekGoal, 1)

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
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-6">

        {/* ── Top: weekly goal + supporting stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#333333]">
          {/* Weekly sessions — anchor stat */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative pr-6 pb-6 sm:pb-0"
          >
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#FF3B3B]" />
            <div className="pl-4">
              <p className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px] mb-2">This Week</p>
              <div className="flex items-baseline gap-1">
                <span className="font-bebas text-5xl sm:text-6xl text-white leading-none tracking-[1px]">{weekCount}</span>
                <span className="font-bebas text-2xl text-[#333333] leading-none tracking-[1px]">/ {weekGoal}</span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-0.5 bg-[#222222] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#FF3B3B]"
                  initial={{ width: 0 }}
                  animate={{ width: `${weekProgress * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <p className="font-inter text-[10px] text-[#555555] mt-1.5 tracking-[2px] uppercase">
                {weekCount >= weekGoal ? 'Goal reached' : `${weekGoal - weekCount} to go`}
              </p>
            </div>
          </motion.div>

          {/* Supporting stats */}
          {[
            { number: `${totalHours}h`, label: 'Hours Trained' },
            { number: String(completedCount), label: 'Replays' },
            { number: String(monthCount), label: 'This Month' },
          ].map(({ number, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut', delay: (i + 1) * 0.05 }}
              className="px-6 py-0 flex flex-col justify-center"
            >
              <div className="font-bebas text-4xl sm:text-5xl text-white leading-none tracking-[1px]">{number}</div>
              <p className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px] mt-1.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom: 7-day bars + discipline breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut', delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#1A1A1A]"
        >
          {/* 7-day activity bars */}
          <div>
            <p className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px] mb-3">Week Activity</p>
            <div className="flex items-end gap-1.5 h-10">
              {dayCounts.map((count, i) => {
                const isToday = i === todayIdx
                const heightPct = count > 0 ? Math.max((count / maxDayCount) * 100, 20) : 8
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <motion.div
                      className={`w-full rounded-sm ${isToday ? 'bg-[#FF3B3B]' : count > 0 ? 'bg-[#555555]' : 'bg-[#1A1A1A]'}`}
                      style={{ height: `${heightPct}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 + i * 0.04 }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {dayLabels.map((label, i) => (
                <div key={i} className="flex-1 flex justify-center">
                  <span className={`font-inter text-[9px] uppercase tracking-[1px] ${i === todayIdx ? 'text-[#FF3B3B]' : 'text-[#333333]'}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Discipline breakdown */}
          <div>
            <p className="font-inter text-[10px] text-[#555555] uppercase tracking-[3px] mb-3">Discipline Split</p>
            {totalDisc > 1 ? (
              <>
                {/* Segmented bar */}
                <div className="flex h-1.5 rounded-sm overflow-hidden gap-px mb-3">
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
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {topDisc.map(([disc, count]) => (
                    <div key={disc} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ backgroundColor: DISCIPLINE_BAR_COLOR[disc] ?? '#444' }} />
                      <span className="font-inter text-[10px] text-[#555555] uppercase tracking-[1px]">{disc}</span>
                      <span className="font-inter text-[10px] text-[#333333]">{Math.round((count / totalDisc) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="font-inter text-xs text-[#333333]">Train more to see your split</p>
            )}
          </div>
        </motion.div>

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-px bg-[#FF3B3B]" />
          <p className="font-inter text-[11px] text-[#FF3B3B] uppercase tracking-[4px]">My Gyms</p>
        </div>
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
          <div className="flex items-center gap-3">
            <div className="w-5 h-px bg-[#FF3B3B]" />
            <p className="font-inter text-[11px] text-[#FF3B3B] uppercase tracking-[4px]">Upcoming Classes</p>
          </div>
          <a href="/dashboard/schedule" className="font-inter text-xs text-[#555555] hover:text-white transition-colors flex items-center gap-1">
            View all <ChevronRight size={12} />
          </a>
        </div>

        {items.length === 0 ? (
          <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-10 text-center overflow-hidden">
            <span className="absolute inset-0 flex items-center justify-center font-bebas text-[120px] text-white/[0.03] leading-none select-none pointer-events-none">LIVE</span>
            <p className="relative font-inter text-sm text-[#555555]">No upcoming classes. Join a gym to get started.</p>
          </div>
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
          <div className="flex items-center gap-3">
            <div className="w-5 h-px bg-[#FF3B3B]" />
            <p className="font-inter text-[11px] text-[#FF3B3B] uppercase tracking-[4px]">Replay Library</p>
          </div>
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
          <div className="flex items-center gap-3">
            <div className="w-5 h-px bg-[#FF3B3B]" />
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
                <span className={f.free ? 'text-[#FF3B3B]' : 'text-[#555555]'}>{f.icon}</span>
                {f.free
                  ? <span className="font-inter text-[10px] text-[#FF3B3B] tracking-[2px] uppercase">Free</span>
                  : <Lock size={10} className="text-[#555555]" />}
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
export default function DashboardClient({ user, memberships, upcoming, replays, liveSession: initialLiveSession, completedCount, totalHours, monthCount, gymIds, gymNames }: Props) {
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
          setLiveSession(prev => prev?.id === s.id ? null : prev)
        }
      }
    )
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [gymIds, gymNames])

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <MemberSidebar active="Dashboard" onSearchOpen={() => setSearchOpen(true)} />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {liveSession && <LiveBanner session={liveSession} />}
        <HeroPanel upcoming={upcoming} user={user} memberships={memberships} />
        <StatsRow memberships={memberships} completedCount={completedCount} totalHours={totalHours} monthCount={monthCount} upcoming={upcoming} replays={replays} />
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
