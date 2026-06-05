'use client'

import { motion } from 'framer-motion'
import MemberSidebar from '@/components/layout/MemberSidebar'
import { Trophy, Flame, Target, Zap, Clock, Shield, Star, Lock } from 'lucide-react'

const MILESTONES = [
  { icon: Star,   label: 'First Class',       desc: 'Watch your first class',              unlocked: true  },
  { icon: Flame,  label: '5 Classes',          desc: 'Complete 5 classes',                  unlocked: true  },
  { icon: Flame,  label: '10 Classes',         desc: 'Complete 10 classes',                 unlocked: false },
  { icon: Flame,  label: '25 Classes',         desc: 'Keep going — 25 classes',             unlocked: false },
  { icon: Flame,  label: '50 Classes',         desc: 'Half century',                        unlocked: false },
  { icon: Flame,  label: '100 Classes',        desc: 'Dedicated practitioner',              unlocked: false },
  { icon: Clock,  label: '5 Hours Trained',    desc: 'Accumulate 5 hours on the mat',       unlocked: true  },
  { icon: Clock,  label: '10 Hours Trained',   desc: 'Accumulate 10 hours on the mat',      unlocked: false },
  { icon: Clock,  label: '25 Hours Trained',   desc: '25 hours — serious commitment',       unlocked: false },
  { icon: Zap,    label: 'Night Owl',          desc: 'Watch a class after 10pm',            unlocked: true  },
  { icon: Shield, label: 'Consistent',         desc: '3 classes in one week',               unlocked: false },
  { icon: Target, label: 'Monthly Goal',       desc: 'Hit your class goal for the month',   unlocked: false },
]

const CHALLENGES = [
  { label: 'Guard Passing Week',   desc: 'Watch 5 guard passing classes',  progress: 2, total: 5 },
  { label: '30-Day Commitment',    desc: 'Train 12 times this month',       progress: 4, total: 12 },
  { label: 'Cross-Train',          desc: 'Watch classes from 2 disciplines', progress: 1, total: 2 },
]

export default function AchievementsPage() {
  const unlocked = MILESTONES.filter(m => m.unlocked).length

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <MemberSidebar active="Achievements" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {/* Header */}
        <div className="border-b border-[#333333] px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px]">Your Wins</p>
            <span className="font-inter text-[9px] text-[#FF3B3B] tracking-[2px] uppercase border border-[#FF3B3B]/30 px-1.5 py-0.5 rounded-sm">
              Coming Soon
            </span>
          </div>
          <h1 className="font-bebas text-4xl text-white tracking-[1px]">Achievements</h1>
          <p className="font-inter text-sm text-[#555555] mt-2 max-w-lg">
            Every class watched, every streak kept, every goal hit — all tracked here. Small wins add up.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">

          {/* Summary strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 divide-x divide-[#222222] border border-[#222222] rounded-sm bg-[#0D0D0D]"
          >
            {[
              { value: `${unlocked}/${MILESTONES.length}`, label: 'Badges Earned' },
              { value: '0',  label: 'Active Streaks' },
              { value: '0',  label: 'Challenges Done' },
            ].map(({ value, label }) => (
              <div key={label} className="px-6 py-5 text-center">
                <p className="font-bebas text-3xl text-white tracking-[1px]">{value}</p>
                <p className="font-inter text-[11px] text-[#555555] uppercase tracking-[3px] mt-1">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Milestone badges */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <p className="font-bebas text-xl text-white tracking-[1px] mb-5">Milestone Badges</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MILESTONES.map((m, i) => {
                const Icon = m.icon
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-2 px-3 py-5 border rounded-sm text-center transition-colors ${
                      m.unlocked
                        ? 'border-[#FF3B3B]/30 bg-[#FF3B3B]/5'
                        : 'border-[#1A1A1A] bg-[#0D0D0D]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${
                      m.unlocked ? 'bg-[#FF3B3B]/20' : 'bg-[#1A1A1A]'
                    }`}>
                      {m.unlocked
                        ? <Icon size={18} className="text-[#FF3B3B]" />
                        : <Lock size={14} className="text-[#333333]" />
                      }
                    </div>
                    <p className={`font-bebas text-sm tracking-[1px] leading-tight ${m.unlocked ? 'text-white' : 'text-[#333333]'}`}>
                      {m.label}
                    </p>
                    <p className="font-inter text-[10px] text-[#444444] leading-snug">{m.desc}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Weekly challenges */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.14 }}
          >
            <p className="font-bebas text-xl text-white tracking-[1px] mb-5">Weekly Challenges</p>
            <div className="space-y-2">
              {CHALLENGES.map((c, i) => {
                const pct = Math.round((c.progress / c.total) * 100)
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border border-[#1A1A1A] bg-[#0D0D0D] rounded-sm">
                    <div className="w-8 h-8 rounded-sm bg-[#1A1A1A] border border-[#222222] flex items-center justify-center shrink-0">
                      <Target size={14} className="text-[#444444]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bebas text-lg text-white tracking-[1px]">{c.label}</p>
                      <p className="font-inter text-xs text-[#555555]">{c.desc}</p>
                      <div className="mt-2 h-1 bg-[#1A1A1A] rounded-full overflow-hidden w-full">
                        <div className="h-full bg-[#FF3B3B] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <p className="font-inter text-xs text-[#555555] shrink-0">{c.progress}/{c.total}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Streak section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="font-bebas text-xl text-white tracking-[1px] mb-5">Streaks</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Weekly Streak',    sub: 'Consecutive weeks with a class', value: '0 weeks',  icon: Flame },
                { label: 'Monthly Goal',     sub: 'Classes this month vs your goal', value: '0 / 8',   icon: Target },
              ].map(({ label, sub, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 px-5 py-5 border border-[#1A1A1A] bg-[#0D0D0D] rounded-sm">
                  <div className="w-10 h-10 rounded-sm bg-[#1A1A1A] border border-[#222222] flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#333333]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bebas text-2xl text-white tracking-[1px]">{value}</p>
                    <p className="font-inter text-xs text-white">{label}</p>
                    <p className="font-inter text-[11px] text-[#444444]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Preview notice */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="border border-[#FF3B3B]/20 bg-[#FF3B3B]/5 rounded-sm px-6 py-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-sm bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex items-center justify-center shrink-0">
              <Trophy size={18} className="text-[#FF3B3B]" />
            </div>
            <div>
              <p className="font-bebas text-lg text-white tracking-[1px]">This is a preview</p>
              <p className="font-inter text-sm text-[#999999] mt-1 leading-relaxed">
                Achievements, streaks, and challenges are being built. Soon every class you watch, every streak you keep, and every challenge you complete will be tracked and rewarded here. The data above is just an example.
              </p>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
