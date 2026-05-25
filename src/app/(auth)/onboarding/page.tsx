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
  { id: 'BJJ', label: 'BJJ' },
  { id: 'Boxing', label: 'Boxing' },
  { id: 'Muay Thai', label: 'Muay Thai' },
  { id: 'Wrestling', label: 'Wrestling' },
  { id: 'MMA', label: 'MMA' },
  { id: 'Kickboxing', label: 'Kickboxing' },
]

const LEVELS = [
  { id: 'beginner', label: 'Complete Beginner', desc: 'Never trained before, starting fresh' },
  { id: 'some_experience', label: 'Some Experience', desc: 'Tried a few classes, know the basics' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Training regularly for 1–3 years' },
  { id: 'advanced', label: 'Advanced / Competitor', desc: 'Competing or training seriously' },
]

const GOALS = [
  { id: 'fit', label: 'Get fit & lose weight' },
  { id: 'self_defense', label: 'Learn self defense' },
  { id: 'athlete', label: 'Train consistently like an athlete' },
  { id: 'compete', label: 'Compete in tournaments' },
  { id: 'complete', label: 'Become a complete fighter' },
]

// ─── Step progress bar ────────────────────────────────────────────────────────
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-0.5 transition-all duration-150 ease-out rounded-sm ${
            i <= current ? 'bg-white' : 'bg-[#333333]'
          } ${i === current ? 'w-8' : 'w-4'}`}
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
      className={`w-full text-left rounded-sm p-4 border transition-colors duration-150 cursor-pointer ${
        selected
          ? 'bg-white border-white'
          : 'bg-[#1A1A1A] border-[#333333] hover:border-white'
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
      <header className="flex items-center justify-between px-6 py-5 border-b border-[#1A1A1A]">
        <a href="/" className="font-bebas text-xl tracking-[3px] text-[#FF3B3B]">
          MATPEAK
        </a>
        <StepBar current={step} total={3} />
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
                transition={{ duration: 0.15, ease: 'easeOut' }}
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
                transition={{ duration: 0.15, ease: 'easeOut' }}
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
                transition={{ duration: 0.15, ease: 'easeOut' }}
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
              className="font-bebas tracking-[3px] w-full bg-white hover:bg-[#E5E5E5] disabled:opacity-30 disabled:cursor-not-allowed text-black py-4 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {step === 2 ? 'GO TO DASHBOARD' : 'CONTINUE'}
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
      <p className="font-inter text-[#555555] text-xs tracking-[4px] uppercase mb-3">
        Step 1 of 3
      </p>
      <h2 className="font-bebas tracking-[2px] text-white text-4xl mb-1">
        WHAT DO YOU WANT TO TRAIN?
      </h2>
      <p className="font-inter text-[#999999] text-sm mb-8">Select all that apply.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
        {DISCIPLINES.map((d) => {
          const selected = prefs.disciplines.includes(d.id)
          return (
            <SelectCard key={d.id} selected={selected} onClick={() => toggleDiscipline(d.id)}>
              <p className={`font-bebas tracking-[2px] text-sm ${selected ? 'text-black' : 'text-white'}`}>
                {d.label}
              </p>
            </SelectCard>
          )
        })}
      </div>

      {/* "I want everything" */}
      <SelectCard selected={allSelected} onClick={() => toggleDiscipline('all')}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-bebas tracking-[2px] text-sm ${allSelected ? 'text-black' : 'text-white'}`}>
              ALL DISCIPLINES
            </p>
            <p className="font-inter text-xs mt-0.5 text-[#555555]">
              Train across every discipline
            </p>
          </div>
          {allSelected && (
            <div className="ml-auto w-4 h-4 rounded-sm bg-black flex items-center justify-center">
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
      <p className="font-inter text-[#555555] text-xs tracking-[4px] uppercase mb-3">
        Step 2 of 3
      </p>
      <h2 className="font-bebas tracking-[2px] text-white text-4xl mb-1">
        WHAT&apos;S YOUR CURRENT LEVEL?
      </h2>
      <p className="font-inter text-[#999999] text-sm mb-8">
        Be honest — we&apos;ll match you with the right classes.
      </p>

      <div className="space-y-2">
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
                  <p className={`font-bebas tracking-[2px] text-sm ${selected ? 'text-black' : 'text-white'}`}>
                    {l.label}
                  </p>
                  <p className="font-inter text-xs mt-0.5 text-[#555555]">
                    {l.desc}
                  </p>
                </div>
                {selected && (
                  <div className="ml-4 shrink-0 w-4 h-4 rounded-sm bg-black flex items-center justify-center">
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
      <p className="font-inter text-[#555555] text-xs tracking-[4px] uppercase mb-3">
        Step 3 of 3
      </p>
      <h2 className="font-bebas tracking-[2px] text-white text-4xl mb-1">
        WHAT&apos;S YOUR TRAINING GOAL?
      </h2>
      <p className="font-inter text-[#999999] text-sm mb-8">
        This shapes your dashboard experience.
      </p>

      <div className="space-y-2">
        {GOALS.map((g) => {
          const selected = prefs.goal === g.id
          return (
            <SelectCard
              key={g.id}
              selected={selected}
              onClick={() => setPrefs((p) => ({ ...p, goal: g.id }))}
            >
              <div className="flex items-center justify-between">
                <p className={`font-bebas tracking-[2px] text-sm flex-1 ${selected ? 'text-black' : 'text-white'}`}>
                  {g.label}
                </p>
                {selected && (
                  <div className="shrink-0 w-4 h-4 rounded-sm bg-black flex items-center justify-center">
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
