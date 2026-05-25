'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Prefs {
  disciplines: string[]
  level: string
  goal: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const DISCIPLINES = [
  { id: 'BJJ', label: 'BJJ', emoji: '🥋' },
  { id: 'Boxing', label: 'Boxing', emoji: '🥊' },
  { id: 'Muay Thai', label: 'Muay Thai', emoji: '🦵' },
  { id: 'Wrestling', label: 'Wrestling', emoji: '🤼' },
  { id: 'MMA', label: 'MMA', emoji: '🏆' },
  { id: 'Kickboxing', label: 'Kickboxing', emoji: '⚡' },
]

const LEVELS = [
  { id: 'beginner', label: 'Complete Beginner', desc: 'Never trained before, starting fresh' },
  { id: 'some_experience', label: 'Some Experience', desc: 'Tried a few classes, know the basics' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Training regularly for 1–3 years' },
  { id: 'advanced', label: 'Advanced / Competitor', desc: 'Competing or training seriously' },
]

const GOALS = [
  { id: 'fit', label: 'Get fit & lose weight', emoji: '🔥' },
  { id: 'self_defense', label: 'Learn self defense', emoji: '🛡️' },
  { id: 'athlete', label: 'Train consistently like an athlete', emoji: '💪' },
  { id: 'compete', label: 'Compete in tournaments', emoji: '🏅' },
  { id: 'complete', label: 'Become a complete fighter', emoji: '🥋' },
]

// ─── Step indicators ──────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 h-2.5 bg-[#FF3B3B]'
              : i < current
              ? 'w-2.5 h-2.5 bg-[#FF3B3B]/40'
              : 'w-2.5 h-2.5 bg-white/10'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Selection Card ───────────────────────────────────────────────────────────
function SelectCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left bg-[#111] rounded-2xl p-6 border transition-all duration-200 cursor-pointer
        ${selected
          ? 'border-[#FF3B3B]/50 bg-[#FF3B3B]/5 shadow-[0_0_0_1px_rgba(220,38,38,0.2)]'
          : 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
        }`}
    >
      {children}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [prefs, setPrefs] = useState<Prefs>({ disciplines: [], level: '', goal: '' })

  const canContinue =
    step === 0
      ? prefs.disciplines.length > 0
      : step === 1
      ? prefs.level !== ''
      : prefs.goal !== ''

  function toggleDiscipline(id: string) {
    setPrefs((prev) => {
      if (id === 'all') {
        return { ...prev, disciplines: DISCIPLINES.map((d) => d.id) }
      }
      const already = prev.disciplines.includes(id)
      return {
        ...prev,
        disciplines: already
          ? prev.disciplines.filter((d) => d !== id)
          : [...prev.disciplines, id],
      }
    })
  }

  function advance() {
    if (!canContinue) return
    if (step < 2) {
      setDirection(1)
      setStep((s) => s + 1)
    } else {
      // Save and redirect
      if (typeof window !== 'undefined') {
        localStorage.setItem('matpeak_prefs', JSON.stringify(prefs))
      }
      router.push('/dashboard')
    }
  }

  const variants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5">
        <a href="/" className="text-xl font-black tracking-tighter text-[#FF3B3B]">
          MATPEAK
        </a>
        <StepDots current={step} total={3} />
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 0 && (
              <motion.div
                key="step0"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <StepOne prefs={prefs} toggleDiscipline={toggleDiscipline} />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <StepTwo prefs={prefs} setPrefs={setPrefs} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <StepThree prefs={prefs} setPrefs={setPrefs} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue Button */}
          <div className="mt-8">
            <button
              onClick={advance}
              disabled={!canContinue}
              className="w-full bg-[#FF3B3B] hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {step === 2 ? 'Go to Dashboard' : 'Continue'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

// ─── Step 1: Disciplines ──────────────────────────────────────────────────────
function StepOne({ prefs, toggleDiscipline }: { prefs: Prefs; toggleDiscipline: (id: string) => void }) {
  const allSelected = prefs.disciplines.length === DISCIPLINES.length

  return (
    <div>
      <p className="text-[#888] text-sm mb-2 uppercase tracking-widest font-semibold">Step 1 of 3</p>
      <h2 className="text-white font-black text-3xl mb-1">What do you want to train?</h2>
      <p className="text-[#666] text-sm mb-8">Select all that apply.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {DISCIPLINES.map((d) => {
          const selected = prefs.disciplines.includes(d.id)
          return (
            <SelectCard key={d.id} selected={selected} onClick={() => toggleDiscipline(d.id)}>
              <div className="text-2xl mb-2">{d.emoji}</div>
              <p className={`font-bold text-sm ${selected ? 'text-white' : 'text-[#ccc]'}`}>{d.label}</p>
            </SelectCard>
          )
        })}
      </div>

      {/* "I want everything" */}
      <SelectCard selected={allSelected} onClick={() => toggleDiscipline('all')}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          <div>
            <p className={`font-bold text-sm ${allSelected ? 'text-white' : 'text-[#ccc]'}`}>I want everything</p>
            <p className="text-[#666] text-xs mt-0.5">Train across all disciplines</p>
          </div>
          {allSelected && (
            <div className="ml-auto w-5 h-5 rounded-full bg-[#FF3B3B] flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </SelectCard>
    </div>
  )
}

// ─── Step 2: Level ────────────────────────────────────────────────────────────
function StepTwo({ prefs, setPrefs }: { prefs: Prefs; setPrefs: React.Dispatch<React.SetStateAction<Prefs>> }) {
  return (
    <div>
      <p className="text-[#888] text-sm mb-2 uppercase tracking-widest font-semibold">Step 2 of 3</p>
      <h2 className="text-white font-black text-3xl mb-1">What's your current level?</h2>
      <p className="text-[#666] text-sm mb-8">Be honest — we'll match you with the right classes.</p>

      <div className="space-y-3">
        {LEVELS.map((l) => {
          const selected = prefs.level === l.id
          return (
            <SelectCard
              key={l.id}
              selected={selected}
              onClick={() => setPrefs((p) => ({ ...p, level: l.id }))}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-bold text-base ${selected ? 'text-white' : 'text-[#ccc]'}`}>{l.label}</p>
                  <p className="text-[#666] text-sm mt-0.5">{l.desc}</p>
                </div>
                {selected && (
                  <div className="ml-4 shrink-0 w-5 h-5 rounded-full bg-[#FF3B3B] flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </SelectCard>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 3: Goal ─────────────────────────────────────────────────────────────
function StepThree({ prefs, setPrefs }: { prefs: Prefs; setPrefs: React.Dispatch<React.SetStateAction<Prefs>> }) {
  return (
    <div>
      <p className="text-[#888] text-sm mb-2 uppercase tracking-widest font-semibold">Step 3 of 3</p>
      <h2 className="text-white font-black text-3xl mb-1">What's your training goal?</h2>
      <p className="text-[#666] text-sm mb-8">This shapes your dashboard experience.</p>

      <div className="space-y-3">
        {GOALS.map((g) => {
          const selected = prefs.goal === g.id
          return (
            <SelectCard
              key={g.id}
              selected={selected}
              onClick={() => setPrefs((p) => ({ ...p, goal: g.id }))}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{g.emoji}</span>
                <p className={`font-bold text-base flex-1 ${selected ? 'text-white' : 'text-[#ccc]'}`}>{g.label}</p>
                {selected && (
                  <div className="shrink-0 w-5 h-5 rounded-full bg-[#FF3B3B] flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
            </SelectCard>
          )
        })}
      </div>
    </div>
  )
}
