'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import MemberSidebar from '@/components/layout/MemberSidebar'
import { Lock, Check, Award } from 'lucide-react'

// Each discipline has its own ranking system
const DISCIPLINES: Record<string, {
  label: string
  rankLabel: string
  ranks: { name: string; color: string }[]
  sampleModules: { title: string; classes: number; done: number }[]
}> = {
  BJJ: {
    label: 'Brazilian Jiu-Jitsu',
    rankLabel: 'Belt',
    ranks: [
      { name: 'White',  color: '#E5E5E5' },
      { name: 'Blue',   color: '#3B82F6' },
      { name: 'Purple', color: '#8B5CF6' },
      { name: 'Brown',  color: '#92400E' },
      { name: 'Black',  color: '#111111' },
    ],
    sampleModules: [
      { title: 'Closed Guard Fundamentals', classes: 6, done: 6 },
      { title: 'Escapes & Survival',        classes: 8, done: 5 },
      { title: 'Takedowns for BJJ',         classes: 5, done: 2 },
      { title: 'Submissions from Mount',    classes: 7, done: 0 },
    ],
  },
  'Muay Thai': {
    label: 'Muay Thai',
    rankLabel: 'Armband',
    ranks: [
      { name: 'White',  color: '#E5E5E5' },
      { name: 'Yellow', color: '#FFD60A' },
      { name: 'Orange', color: '#FF9500' },
      { name: 'Green',  color: '#00D4AA' },
      { name: 'Blue',   color: '#3B82F6' },
      { name: 'Red',    color: '#FF3B3B' },
    ],
    sampleModules: [
      { title: 'Stance & Footwork',       classes: 4, done: 4 },
      { title: 'Jab, Cross, Hook, Elbow', classes: 6, done: 3 },
      { title: 'Teep & Push Kick',        classes: 5, done: 1 },
      { title: 'Clinch & Knee Work',      classes: 6, done: 0 },
    ],
  },
  Boxing: {
    label: 'Boxing',
    rankLabel: 'Level',
    ranks: [
      { name: 'Beginner',     color: '#E5E5E5' },
      { name: 'Novice',       color: '#FFD60A' },
      { name: 'Intermediate', color: '#FF9500' },
      { name: 'Advanced',     color: '#FF3B3B' },
      { name: 'Pro',          color: '#FFD700' },
    ],
    sampleModules: [
      { title: 'Guard & Head Movement', classes: 5, done: 5 },
      { title: 'Basic Combinations',    classes: 6, done: 2 },
      { title: 'Footwork Patterns',     classes: 4, done: 1 },
      { title: 'Body Work & Counter',   classes: 5, done: 0 },
    ],
  },
  Wrestling: {
    label: 'Wrestling',
    rankLabel: 'Level',
    ranks: [
      { name: 'Beginner',     color: '#E5E5E5' },
      { name: 'Novice',       color: '#FFD60A' },
      { name: 'Intermediate', color: '#FF9500' },
      { name: 'Advanced',     color: '#FF3B3B' },
      { name: 'Competitor',   color: '#6B7FFF' },
    ],
    sampleModules: [
      { title: 'Level Changes & Shots', classes: 5, done: 3 },
      { title: 'Takedown Defense',      classes: 6, done: 1 },
      { title: 'Mat Returns',           classes: 4, done: 0 },
      { title: 'Top Control & Turns',   classes: 5, done: 0 },
    ],
  },
  MMA: {
    label: 'MMA',
    rankLabel: 'Level',
    ranks: [
      { name: 'Beginner',     color: '#E5E5E5' },
      { name: 'Amateur',      color: '#FFD60A' },
      { name: 'Intermediate', color: '#FF9500' },
      { name: 'Advanced',     color: '#FF3B3B' },
      { name: 'Pro',          color: '#FFD700' },
    ],
    sampleModules: [
      { title: 'Striking Fundamentals', classes: 6, done: 4 },
      { title: 'Takedowns & Clinch',    classes: 6, done: 2 },
      { title: 'Ground & Pound',        classes: 5, done: 0 },
      { title: 'Submission Defense',    classes: 5, done: 0 },
    ],
  },
}

const ACTIVE_RANK_INDEX = 1 // second rank = "in progress" for preview

export default function ProgressionPage() {
  const disciplineKeys = Object.keys(DISCIPLINES)
  const [selected, setSelected] = useState('BJJ')
  const disc = DISCIPLINES[selected]

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
          <h1 className="font-bebas text-4xl text-white tracking-[1px]">Rank Progression</h1>
          <p className="font-inter text-sm text-[#555555] mt-2 max-w-lg">
            Train BJJ and Muay Thai? You get a separate track for each. Every discipline has its own ranking system — your progress in one never affects the other.
          </p>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

          {/* Discipline selector */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-baseline gap-3 mb-3">
              <p className="font-inter text-[11px] text-[#555555] uppercase tracking-[3px]">Your Disciplines</p>
              <p className="font-inter text-[11px] text-[#444444]">Each one has its own separate track</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {disciplineKeys.map(d => (
                <button
                  key={d}
                  onClick={() => setSelected(d)}
                  className={`font-bebas tracking-[2px] text-sm px-4 py-2 rounded-sm border transition-all ${
                    selected === d
                      ? 'bg-white text-black border-white'
                      : 'border-[#333333] text-[#555555] hover:text-white hover:border-[#555555]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Rank path */}
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="font-bebas text-xl text-white tracking-[1px] mb-5">
              {disc.label} — {disc.rankLabel} Path
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {disc.ranks.map((rank, i) => {
                const state = i < ACTIVE_RANK_INDEX ? 'done' : i === ACTIVE_RANK_INDEX ? 'active' : 'locked'
                return (
                  <div key={rank.name} className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col items-center gap-2 w-24">
                      <div
                        className={`w-full h-12 rounded-sm border flex items-center justify-center relative ${
                          state === 'locked' ? 'border-[#222222] bg-[#0D0D0D]' : 'border-[#333333]'
                        }`}
                        style={{ backgroundColor: state !== 'locked' ? `${rank.color}15` : undefined }}
                      >
                        <div
                          className="w-8 h-1.5 rounded-full"
                          style={{ backgroundColor: rank.color, opacity: state === 'locked' ? 0.2 : 1 }}
                        />
                        {state === 'done' && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#00D4AA] flex items-center justify-center">
                            <Check size={11} className="text-black" />
                          </div>
                        )}
                        {state === 'locked' && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center">
                            <Lock size={9} className="text-[#555555]" />
                          </div>
                        )}
                      </div>
                      <p className={`font-inter text-[11px] text-center leading-tight ${state === 'locked' ? 'text-[#333333]' : 'text-white'}`}>
                        {rank.name}
                      </p>
                      <span className={`font-inter text-[9px] uppercase tracking-[1px] ${
                        state === 'done' ? 'text-[#00D4AA]' : state === 'active' ? 'text-[#FF3B3B]' : 'text-[#333333]'
                      }`}>
                        {state === 'done' ? 'Done' : state === 'active' ? 'Current' : 'Locked'}
                      </span>
                    </div>
                    {i < disc.ranks.length - 1 && (
                      <div className="w-4 h-px bg-[#222222] shrink-0 -mt-9" />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Current rank modules */}
          <motion.div
            key={`${selected}-modules`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: disc.ranks[ACTIVE_RANK_INDEX].color }} />
              <p className="font-bebas text-xl text-white tracking-[1px]">
                {disc.ranks[ACTIVE_RANK_INDEX].name} {disc.rankLabel} — Required Modules
              </p>
            </div>
            <div className="space-y-2">
              {disc.sampleModules.map((m) => {
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

          {/* Preview notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="border border-[#FF3B3B]/20 bg-[#FF3B3B]/5 rounded-sm px-6 py-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-sm bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex items-center justify-center shrink-0">
              <Award size={18} className="text-[#FF3B3B]" />
            </div>
            <div>
              <p className="font-bebas text-lg text-white tracking-[1px]">This is a preview</p>
              <p className="font-inter text-sm text-[#999999] mt-1 leading-relaxed">
                Rank progression is being built. Your coach will assign modules suited to your discipline — belts for BJJ, armbands for Muay Thai, levels for Boxing and Wrestling. All data above is an example.
              </p>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  )
}
