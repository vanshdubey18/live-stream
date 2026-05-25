'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import MemberSidebar from '@/components/layout/MemberSidebar'
import ProgressRing from '@/components/ui/ProgressRing'
import StatCard from '@/components/ui/StatCard'
import InsightCard from '@/components/ui/InsightCard'
import { ChevronRight, ArrowRight } from 'lucide-react'

interface Props {
  user: { name: string; email: string }
  memberships: any[]
  upcoming: any[]
  replays: any[]
  liveSession: any | null
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
function HeroPanel({ upcoming, user }: { upcoming: any[]; user: { name: string } }) {
  const todayCount = upcoming.filter(s => {
    const d = new Date(s.scheduled_at)
    return d.toDateString() === new Date().toDateString()
  }).length

  const weekCount = 4
  const weekGoal = 5
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
              {todayCount || upcoming.length || 3}
            </div>
            <p className="font-inter text-sm text-[#999999] mt-3">Classes available today</p>
            <p className="font-inter text-xs text-[#555555] mt-1 uppercase tracking-[2px]">
              Good to see you, {firstName}
            </p>
          </div>

          <div className="hidden lg:block w-px bg-[#333333] self-stretch" />

          <div className="flex flex-col items-center gap-4">
            <ProgressRing
              value={weekCount}
              max={weekGoal}
              size={148}
              strokeWidth={7}
              color="#FF3B3B"
              label={`${weekCount}/${weekGoal}`}
              sublabel="THIS WEEK"
            />
            <div className="text-center">
              <p className="font-inter text-xs text-[#999999] uppercase tracking-[3px]">Weekly Goal</p>
              <p className="font-inter text-[11px] text-[#555555] mt-1">
                {weekGoal - weekCount} more to hit your target
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Row ────────────────────────────────────────────────────────────────
function StatsRow({ memberships, replays }: { memberships: any[]; replays: any[] }) {
  const totalHours = replays.reduce((acc: number, r: any) => acc + (r.duration_minutes ?? 0) / 60, 0)
  const stats = [
    { number: `${Math.round(totalHours) || 28}H`, label: 'Trained' },
    { number: '47', label: 'Techniques' },
    { number: '8', label: 'Day Streak' },
    { number: String(memberships.length || 2), label: 'Gyms Joined' },
  ]

  return (
    <section className="border-b border-[#333333]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333]">
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardClient({ user, memberships, upcoming, replays, liveSession }: Props) {
  const [, setSearchOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black flex">
      <MemberSidebar active="Dashboard" onSearchOpen={() => setSearchOpen(true)} />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {liveSession && <LiveBanner session={liveSession} />}
        <HeroPanel upcoming={upcoming} user={user} />
        <StatsRow memberships={memberships} replays={replays} />
        <MyGyms memberships={memberships} />
        <UpcomingClasses sessions={upcoming} />
        <RecentReplays replays={replays} />

        <section className="border-b border-[#333333]">
          <div className="max-w-[1280px] mx-auto px-6 py-8">
            <InsightCard body="You've watched 8 guard retention classes this month. You're building real depth in this position. Next step — find a class focused on attacking from guard, not just surviving it." />
          </div>
        </section>
      </main>
    </div>
  )
}
