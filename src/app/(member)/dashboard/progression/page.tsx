'use client'

import { motion } from 'framer-motion'
import MemberSidebar from '@/components/layout/MemberSidebar'
import { Lock, Check, Award } from 'lucide-react'

// Preview of the upcoming belt-progression curriculum feature.
// Static teaser data — no backend yet.
const BELTS = [
  { name: 'White Belt', color: '#E5E5E5', state: 'done', label: 'Completed' },
  { name: 'Blue Belt', color: '#3B82F6', state: 'active', label: 'In progress' },
  { name: 'Purple Belt', color: '#8B5CF6', state: 'locked', label: 'Locked' },
  { name: 'Brown Belt', color: '#92400E', state: 'locked', label: 'Locked' },
  { name: 'Black Belt', color: '#111111', state: 'locked', label: 'Locked' },
]

const SAMPLE_MODULES = [
  { title: 'Closed Guard Fundamentals', classes: 6, done: 6 },
  { title: 'Escapes & Survival', classes: 8, done: 5 },
  { title: 'Takedowns for BJJ', classes: 5, done: 2 },
  { title: 'Submissions from Mount', classes: 7, done: 0 },
]

export default function ProgressionPage() {
  return (
    <div className="min-h-screen bg-black flex">
      <MemberSidebar active="Progression" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="h-14 lg:hidden" />

        {/* Header */}
        <div className="border-b border-[#333333] px-6 py-8">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px]">Your Journey</p>
            <span className="font-inter text-[9px] text-[#FF3B3B] tracking-[2px] uppercase border border-[#FF3B3B]/30 px-1.5 py-0.5 rounded-sm">
              Coming Soon
            </span>
          </div>
          <h1 className="font-bebas text-4xl text-white tracking-[1px]">Belt Progression</h1>
          <p className="font-inter text-sm text-[#555555] mt-2 max-w-lg">
            Follow a structured path to your next belt. Your coach assigns modules, you complete classes, and you track every step toward your next promotion — all in one place.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

          {/* Belt path */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-bebas text-xl text-white tracking-[1px] mb-5">Your Belt Path</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {BELTS.map((belt, i) => (
                <div key={belt.name} className="flex items-center gap-2 shrink-0">
                  <div className="flex flex-col items-center gap-2 w-28">
                    <div
                      className={`w-full h-12 rounded-sm border flex items-center justify-center relative ${
                        belt.state === 'locked' ? 'border-[#222222] bg-[#0D0D0D]' : 'border-[#333333]'
                      }`}
                      style={{
                        backgroundColor: belt.state === 'locked' ? undefined : `${belt.color}15`,
                      }}
                    >
                      <div className="w-8 h-1.5 rounded-full" style={{ backgroundColor: belt.color, opacity: belt.state === 'locked' ? 0.25 : 1 }} />
                      {belt.state === 'done' && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#00D4AA] flex items-center justify-center">
                          <Check size={11} className="text-black" />
                        </div>
                      )}
                      {belt.state === 'locked' && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center">
                          <Lock size={9} className="text-[#555555]" />
                        </div>
                      )}
                    </div>
                    <p className={`font-inter text-[11px] text-center ${belt.state === 'locked' ? 'text-[#444444]' : 'text-white'}`}>
                      {belt.name}
                    </p>
                    <span className={`font-inter text-[9px] uppercase tracking-[1px] ${
                      belt.state === 'done' ? 'text-[#00D4AA]' : belt.state === 'active' ? 'text-[#FF3B3B]' : 'text-[#444444]'
                    }`}>
                      {belt.label}
                    </span>
                  </div>
                  {i < BELTS.length - 1 && (
                    <div className="w-6 h-px bg-[#333333] shrink-0 -mt-9" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Current belt modules preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-1.5 rounded-full bg-[#3B82F6]" />
              <p className="font-bebas text-xl text-white tracking-[1px]">Blue Belt — Required Modules</p>
            </div>

            <div className="space-y-2 relative">
              {/* Blur overlay teaser */}
              {SAMPLE_MODULES.map((m) => {
                const pct = Math.round((m.done / m.classes) * 100)
                return (
                  <div key={m.title} className="flex items-center gap-4 px-5 py-4 border border-[#222222] bg-[#0D0D0D] rounded-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-bebas text-lg text-white tracking-[1px]">{m.title}</p>
                      <p className="font-inter text-xs text-[#555555] mt-0.5">{m.done} of {m.classes} classes complete</p>
                    </div>
                    <div className="w-24 shrink-0">
                      <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF3B3B] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="font-inter text-[10px] text-[#555555] text-right mt-1">{pct}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Coming soon notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="border border-[#FF3B3B]/20 bg-[#FF3B3B]/5 rounded-sm px-6 py-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-sm bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex items-center justify-center shrink-0">
              <Award size={18} className="text-[#FF3B3B]" />
            </div>
            <div>
              <p className="font-bebas text-lg text-white tracking-[1px]">This is a preview</p>
              <p className="font-inter text-sm text-[#999999] mt-1 leading-relaxed">
                Belt progression is being built. Soon your coach will assign structured modules tied to real classes and replays, and you'll track your path to every promotion. The data above is just an example.
              </p>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
