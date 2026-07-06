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
    <div className="min-h-screen bg-[#141410] flex">
      <MemberSidebar active="Achievements" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {/* Header */}
        <div className="border-b border-[#322f26] px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-mincho text-[11px] text-[#a29c8c] uppercase tracking-[4px]">Your Wins</p>
            <span className="font-mincho text-[9px] text-[#b3402f] tracking-[2px] uppercase border border-[#b3402f]/30 px-1.5 py-0.5 rounded-sm">
              Coming Soon
            </span>
          </div>
          <h1 className="font-mincho text-4xl text-[#f0eadc] tracking-[1px]">Achievements</h1>
          <p className="font-mincho text-sm text-[#7a7568] mt-2 max-w-lg">
            Every class watched, every streak kept, every goal hit — all tracked here. Small wins add up.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">

          {/* Summary strip */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 divide-x divide-[#242420] border border-[#242420] rounded-sm bg-[#141410]"
          >
            {[
              { value: `${unlocked}/${MILESTONES.length}`, label: 'Badges Earned' },
              { value: '0',  label: 'Active Streaks' },
              { value: '0',  label: 'Challenges Done' },
            ].map(({ value, label }) => (
              <div key={label} className="px-6 py-5 text-center">
                <p className="font-mincho text-3xl text-[#f0eadc] tracking-[1px]">{value}</p>
                <p className="font-mincho text-[11px] text-[#7a7568] uppercase tracking-[3px] mt-1">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Milestone badges */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <p className="font-mincho text-xl text-[#f0eadc] tracking-[1px] mb-5">Milestone Badges</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {MILESTONES.map((m, i) => {
                const Icon = m.icon
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-2 px-3 py-5 border rounded-sm text-center transition-colors ${
                      m.unlocked
                        ? 'border-[#b3402f]/30 bg-[#b3402f]/5'
                        : 'border-[#1c1c16] bg-[#141410]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-sm flex items-center justify-center ${
                      m.unlocked ? 'bg-[#b3402f]/20' : 'bg-[#1c1c16]'
                    }`}>
                      {m.unlocked
                        ? <Icon size={18} className="text-[#b3402f]" />
                        : <Lock size={14} className="text-[#322f26]" />
                      }
                    </div>
                    <p className={`font-mincho text-sm tracking-[1px] leading-tight ${m.unlocked ? 'text-[#f0eadc]' : 'text-[#322f26]'}`}>
                      {m.label}
                    </p>
                    <p className="font-mincho text-[10px] text-[#635f54] leading-snug">{m.desc}</p>
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
            <p className="font-mincho text-xl text-[#f0eadc] tracking-[1px] mb-5">Weekly Challenges</p>
            <div className="space-y-2">
              {CHALLENGES.map((c, i) => {
                const pct = Math.round((c.progress / c.total) * 100)
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 border border-[#1c1c16] bg-[#141410] rounded-sm">
                    <div className="w-8 h-8 rounded-sm bg-[#1c1c16] border border-[#242420] flex items-center justify-center shrink-0">
                      <Target size={14} className="text-[#635f54]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mincho text-lg text-[#f0eadc] tracking-[1px]">{c.label}</p>
                      <p className="font-mincho text-xs text-[#7a7568]">{c.desc}</p>
                      <div className="mt-2 h-1 bg-[#1c1c16] rounded-full overflow-hidden w-full">
                        <div className="h-full bg-[#b3402f] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <p className="font-mincho text-xs text-[#7a7568] shrink-0">{c.progress}/{c.total}</p>
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
            <p className="font-mincho text-xl text-[#f0eadc] tracking-[1px] mb-5">Streaks</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Weekly Streak',    sub: 'Consecutive weeks with a class', value: '0 weeks',  icon: Flame },
                { label: 'Monthly Goal',     sub: 'Classes this month vs your goal', value: '0 / 8',   icon: Target },
              ].map(({ label, sub, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 px-5 py-5 border border-[#1c1c16] bg-[#141410] rounded-sm">
                  <div className="w-10 h-10 rounded-sm bg-[#1c1c16] border border-[#242420] flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#322f26]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-mincho text-2xl text-[#f0eadc] tracking-[1px]">{value}</p>
                    <p className="font-mincho text-xs text-[#f0eadc]">{label}</p>
                    <p className="font-mincho text-[11px] text-[#635f54]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Preview notice */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="border border-[#b3402f]/20 bg-[#b3402f]/5 rounded-sm px-6 py-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-sm bg-[#b3402f]/10 border border-[#b3402f]/20 flex items-center justify-center shrink-0">
              <Trophy size={18} className="text-[#b3402f]" />
            </div>
            <div>
              <p className="font-mincho text-lg text-[#f0eadc] tracking-[1px]">This is a preview</p>
              <p className="font-mincho text-sm text-[#a29c8c] mt-1 leading-relaxed">
                Achievements, streaks, and challenges are being built. Soon every class you watch, every streak you keep, and every challenge you complete will be tracked and rewarded here. The data above is just an example.
              </p>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
