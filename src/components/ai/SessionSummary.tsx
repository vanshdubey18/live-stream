'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Lightbulb, BookOpen, ChevronRight, Bookmark, RotateCcw } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SessionSummaryData {
  title: string
  coach: string
  gym: string
  discipline: string
  duration: string
  summary: string
  techniques: string[]
  keyMoments: { timestamp: string; label: string }[]
  quote: string
  relatedClasses: { title: string; coach: string }[]
}

export const DEMO_SUMMARY: SessionSummaryData = {
  title: 'Half Guard Fundamentals',
  coach: 'Coach Rahul Sharma',
  gym: 'Xtreme MMA Mumbai',
  discipline: 'BJJ',
  duration: '58 minutes',
  summary:
    'Coach Rahul focused on the underhook battle from half guard. Three key sweeps were covered, with detailed grip-fighting emphasized throughout.',
  techniques: [
    'Hip escape entry',
    'Underhook from half guard',
    'Old school sweep',
    'Coyote half guard',
    'Knee shield defense',
  ],
  keyMoments: [
    { timestamp: '12:34', label: 'Hip escape detail' },
    { timestamp: '28:20', label: 'The sweep mechanics' },
    { timestamp: '41:15', label: 'Common mistakes to avoid' },
    { timestamp: '52:08', label: 'Live drilling demo' },
  ],
  quote:
    "The sweep doesn't work without the underhook. Drill the grip fight first, then the sweep.",
  relatedClasses: [
    { title: 'Half Guard Defense', coach: 'Coach Marcelo' },
    { title: 'Knee Cut Pass Defense', coach: 'Coach Dev' },
    { title: 'Advanced Half Guard', coach: 'Coach Rahul' },
  ],
}

const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'bg-[#1A1A1A] text-[#999999]',
  Boxing: 'bg-[#FFD60A]/10 text-[#FFD60A]',
  'Muay Thai': 'bg-[#1A1A1A] text-[#999999]',
  Wrestling: 'bg-[#00D4AA]/10 text-[#00D4AA]',
  MMA: 'bg-[#FF3B3B]/10 text-[#FF3B3B]',
}

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
  )
}

function Divider() {
  return <div className="h-px bg-[#333333]" />
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[#FF3B3B]">{icon}</span>
      <span className="text-[10px] font-black text-[#999999] uppercase tracking-[0.12em]">{label}</span>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
interface Props {
  data?: SessionSummaryData
  onTimestampClick?: (timestamp: string) => void
  compact?: boolean
}

export default function SessionSummary({ data = DEMO_SUMMARY, onTimestampClick, compact = false }: Props) {
  const [saved, setSaved] = useState(false)

  return (
    <div className={`bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden ${compact ? '' : ''}`}>

      {/* ── Header ── */}
      <Section delay={0}>
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="text-xs font-black text-[#FF3B3B] uppercase tracking-[0.12em] flex items-center gap-1.5">
              <BookOpen size={12} />
              Today's Session
            </div>
            <span className={`font-inter text-[10px] tracking-[2px] uppercase px-2 py-1 rounded-sm ${DISCIPLINE_COLORS[data.discipline] ?? 'bg-[#1A1A1A] text-[#999999]'}`}>
              {data.discipline}
            </span>
          </div>
          <h2 className="text-white font-black text-xl leading-tight mb-1">{data.title}</h2>
          <p className="text-[#999999] text-sm">{data.coach} · {data.gym}</p>
          <p className="text-[#555] text-xs mt-1">{data.duration}</p>
        </div>
      </Section>

      <Divider />

      {/* ── Breakdown ── */}
      <Section delay={0.08}>
        <div className="px-6 py-5">
          <SectionHeader icon={<span className="text-sm">📝</span>} label="The Breakdown" />
          <p className="text-[#aaaaaa] text-sm leading-relaxed">{data.summary}</p>
        </div>
      </Section>

      <Divider />

      {/* ── Techniques ── */}
      <Section delay={0.16}>
        <div className="px-6 py-5">
          <SectionHeader icon={<span className="text-sm">🥋</span>} label="Techniques Covered" />
          <div className="flex flex-wrap gap-2">
            {data.techniques.map((t, i) => (
              <motion.a
                key={t}
                href={`/techniques/${t.toLowerCase().replace(/\s+/g, '-')}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.16 + i * 0.06 }}
                className="group px-3 py-1.5 rounded-sm bg-[#222222] border border-[#333333] hover:border-[#FF3B3B]/40 hover:bg-[#FF3B3B]/5 transition-all cursor-pointer"
              >
                <span className="text-[#cccccc] group-hover:text-white text-xs font-medium transition-colors">{t}</span>
              </motion.a>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── Key Moments ── */}
      <Section delay={0.28}>
        <div className="px-6 py-5">
          <SectionHeader icon={<Play size={12} />} label="Key Moments" />
          <div className="space-y-2">
            {data.keyMoments.map((m, i) => (
              <motion.button
                key={m.timestamp}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.07 }}
                onClick={() => onTimestampClick?.(m.timestamp)}
                className="w-full flex items-center gap-3 group text-left hover:bg-[#1F1F1F] rounded-sm px-2 py-2 -mx-2 transition-colors"
              >
                <div className="w-7 h-7 rounded-sm bg-[#FF3B3B]/10 flex items-center justify-center shrink-0 group-hover:bg-[#FF3B3B]/20 transition-colors">
                  <Play size={10} className="text-[#FF3B3B]" />
                </div>
                <span className="text-[#FF3B3B] font-mono text-xs font-bold shrink-0">{m.timestamp}</span>
                <span className="text-[#aaaaaa] text-sm group-hover:text-white transition-colors flex-1">{m.label}</span>
                <ChevronRight size={13} className="text-[#333] group-hover:text-[#FF3B3B] transition-colors shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── Coach's Key Point ── */}
      <Section delay={0.4}>
        <div className="px-6 py-5">
          <SectionHeader icon={<Lightbulb size={12} />} label="Coach's Key Point" />
          <blockquote className="relative pl-4">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#FF3B3B]/50 rounded-full" />
            <p className="text-white text-sm leading-relaxed font-medium italic">
              &ldquo;{data.quote}&rdquo;
            </p>
          </blockquote>
        </div>
      </Section>

      <Divider />

      {/* ── Continue Learning ── */}
      <Section delay={0.48}>
        <div className="px-6 py-5">
          <SectionHeader icon={<span className="text-sm">📚</span>} label="Continue Learning" />
          <div className="space-y-2">
            {data.relatedClasses.map((c, i) => (
              <motion.a
                key={c.title}
                href="/dashboard"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 + i * 0.07 }}
                className="flex items-center gap-3 bg-[#0D0D0D] hover:bg-[#151515] border border-[#333333] hover:border-[#333333] rounded-sm px-4 py-3 group transition-all"
              >
                <div className="w-8 h-8 rounded-sm bg-[#FF3B3B]/10 flex items-center justify-center shrink-0">
                  <Play size={12} className="text-[#FF3B3B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{c.title}</p>
                  <p className="text-[#555] text-xs">{c.coach}</p>
                </div>
                <ChevronRight size={14} className="text-[#333] group-hover:text-[#FF3B3B] transition-colors shrink-0" />
              </motion.a>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ── Actions ── */}
      <Section delay={0.56}>
        <div className="px-6 py-5 flex flex-col gap-3">
          <button
            onClick={() => setSaved(v => !v)}
            className={`flex items-center justify-center gap-2 w-full border rounded-sm py-3 text-sm font-semibold transition-all
              ${saved
                ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-[#FF3B3B]'
                : 'bg-[#0D0D0D] border-[#333333] text-[#999999] hover:border-[#FF3B3B]/20 hover:text-white'}`}
          >
            <Bookmark size={15} className={saved ? 'fill-[#FF3B3B]' : ''} />
            {saved ? 'Saved to journal' : 'Save to my journal'}
          </button>
          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px] py-3 rounded-sm text-sm transition-colors"
          >
            <RotateCcw size={15} />
            Watch replay anytime
          </a>
        </div>
      </Section>

    </div>
  )
}
