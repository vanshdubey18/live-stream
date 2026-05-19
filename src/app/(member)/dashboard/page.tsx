'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  User,
  CreditCard,
  LogOut,
  Radio,
  Building2,
} from 'lucide-react'
import MemberSidebar from '@/components/layout/MemberSidebar'
import GymCard from '@/components/member/GymCard'
import ClassRow from '@/components/member/ClassRow'
import ReplayCard from '@/components/member/ReplayCard'

// ─── Placeholder data ─────────────────────────────────────────────────────────
const GYMS = [
  {
    name: 'Iron Temple MMA',
    plan: 'Full MMA' as const,
    disciplines: ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling'],
    nextClass: 'Advanced BJJ — Guard Passing',
    nextClassTime: 'Today at 7:00 PM',
    city: 'Mumbai, India',
  },
  {
    name: 'Strike Lab Boxing',
    plan: 'Single' as const,
    disciplines: ['Boxing'],
    nextClass: 'Footwork & Combinations',
    nextClassTime: 'Tomorrow at 6:30 AM',
    city: 'Delhi, India',
  },
]

const UPCOMING = [
  {
    day: 'Today',
    classes: [
      { time: '7:00 PM', title: 'Advanced BJJ — Guard Passing', discipline: 'BJJ', coach: 'Coach Rajan', gym: 'Iron Temple MMA', level: 'Advanced' as const, isLive: true },
      { time: '8:30 PM', title: 'Muay Thai Clinch Work', discipline: 'Muay Thai', coach: 'Coach Siddhi', gym: 'Iron Temple MMA', level: 'Intermediate' as const },
    ],
  },
  {
    day: 'Tomorrow',
    classes: [
      { time: '6:30 AM', title: 'Footwork & Combinations', discipline: 'Boxing', coach: 'Coach Arjun', gym: 'Strike Lab Boxing', level: 'Beginner' as const },
      { time: '12:00 PM', title: 'Wrestling Takedown Chains', discipline: 'Wrestling', coach: 'Coach Preet', gym: 'Iron Temple MMA', level: 'Intermediate' as const },
    ],
  },
  {
    day: 'Wednesday',
    classes: [
      { time: '7:00 PM', title: 'No-Gi Submission Wrestling', discipline: 'BJJ', coach: 'Coach Rajan', gym: 'Iron Temple MMA', level: 'Advanced' as const },
    ],
  },
]

const REPLAYS = [
  { title: 'Back Takes & RNC Finish', coach: 'Coach Rajan', discipline: 'BJJ', duration: '58 min', gym: 'Iron Temple MMA', daysAgo: 1 },
  { title: 'Southpaw Pressure Fighting', coach: 'Coach Arjun', discipline: 'Boxing', duration: '45 min', gym: 'Strike Lab Boxing', daysAgo: 2 },
  { title: 'Teep & Push Kick Defence', coach: 'Coach Siddhi', discipline: 'Muay Thai', duration: '52 min', gym: 'Iron Temple MMA', daysAgo: 3 },
  { title: 'Level Change Setups', coach: 'Coach Preet', discipline: 'Wrestling', duration: '40 min', gym: 'Iron Temple MMA', daysAgo: 5 },
]

const LIVE_CLASS = UPCOMING[0].classes[0]

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
            ].map((item) => (
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const userName = 'Vansh Dubey'

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <MemberSidebar active="Dashboard" />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Welcome back, {userName.split(' ')[0]}
            </h1>
            <p className="text-[#888888] text-xs">Ready to train?</p>
          </div>
          <ProfileDropdown name={userName} />
        </div>

        <div className="px-6 py-6 space-y-8 max-w-5xl">

          {/* Live Now Banner */}
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
                <p className="text-white font-bold text-sm">{LIVE_CLASS.title}</p>
                <p className="text-[#888888] text-xs">{LIVE_CLASS.gym} · {LIVE_CLASS.coach}</p>
              </div>
            </div>
            <a
              href="#"
              className="shrink-0 bg-[#DC2626] hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Watch Now
            </a>
          </div>

          {/* My Gyms */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">My Gyms</h2>
              <a href="/gyms" className="text-[#888888] hover:text-white text-sm transition-colors flex items-center gap-1">
                <Building2 size={14} /> Browse more
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GYMS.map((gym) => (
                <GymCard key={gym.name} {...gym} />
              ))}
            </div>
          </section>

          {/* Upcoming Classes */}
          <section>
            <h2 className="text-white font-bold text-lg mb-4">Upcoming Classes</h2>
            <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
              {UPCOMING.map((group, gi) => (
                <div key={group.day}>
                  {gi > 0 && <div className="border-t border-white/5" />}
                  <div className="px-4 py-2.5 bg-white/2">
                    <span className="text-[#888888] text-xs font-bold uppercase tracking-widest">
                      {group.day}
                    </span>
                  </div>
                  {group.classes.map((cls, i) => (
                    <ClassRow key={i} {...cls} />
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* Recent Replays */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Recent Replays</h2>
              <a href="/dashboard/replays" className="text-[#888888] hover:text-white text-sm transition-colors">
                View all
              </a>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {REPLAYS.map((r) => (
                <ReplayCard key={r.title} {...r} />
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
