'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import MuxPlayer from '@mux/mux-player-react'
import SessionSummary, { DEMO_SUMMARY } from '@/components/ai/SessionSummary'

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = 'pre' | 'live' | 'post'

interface SessionData {
  id: string
  title: string
  discipline: string
  level: string
  description: string
  coachName: string
  coachInitials: string
}

// ─── Static session data ──────────────────────────────────────────────────────
const SESSION: SessionData = {
  id: 'demo-session',
  title: 'Advanced Guard Passing',
  discipline: 'BJJ',
  level: 'Advanced',
  description:
    'Deep-dive into guard passing mechanics covering pressure passing, knee-cut entries, and back-take sequences. Bring your gi.',
  coachName: 'Coach Rajan',
  coachInitials: 'CR',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(2, '0')
}

// ─── PRE phase ────────────────────────────────────────────────────────────────
function PrePhase({ onGoLive }: { onGoLive: () => void }) {
  const INITIAL_SECONDS = 28 * 60 + 45
  const [seconds, setSeconds] = useState(INITIAL_SECONDS)
  const [watchers, setWatchers] = useState(12)
  const [checklist, setChecklist] = useState([false, false, false])

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setWatchers(w => w + 1), 20_000)
    return () => clearInterval(t)
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  const checkItems = ['Find your gear', 'Clear your space', 'Set up your camera angle']

  const toggle = (i: number) =>
    setChecklist(prev => prev.map((v, idx) => (idx === i ? !v : v)))

  return (
    <motion.div
      key="pre"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0D0D0D] text-white flex flex-col"
    >
      {/* Back nav */}
      <div className="px-6 pt-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#999999] hover:text-white font-inter text-sm transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
      </div>

      {/* Center content */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">

        {/* Status badge */}
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
          <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Waiting for stream</span>
        </div>

        {/* Session title */}
        <h1 className="font-bebas text-5xl text-white tracking-[1px] mb-2">{SESSION.title}</h1>

        {/* Coach */}
        <p className="font-inter text-[#999999] text-sm mb-12">
          {SESSION.coachName} · {SESSION.discipline}
        </p>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Starts in</span>
          <div className="font-bebas text-7xl text-white tracking-[1px] tabular-nums">
            {pad(mins)}
            <span className="text-[#333333] mx-1">:</span>
            {pad(secs)}
          </div>
        </div>

        {/* Two panels */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4">

          {/* Session info panel */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-sm p-5 text-left"
          >
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Session</p>
            <div className="space-y-1 mb-4">
              <p className="font-bebas text-[18px] text-white tracking-[1px]">{SESSION.coachName}</p>
              <p className="font-inter text-[#999999] text-xs">{SESSION.discipline} · {SESSION.level}</p>
            </div>
            <p className="font-inter text-[#999999] text-xs leading-relaxed border-t border-[#2A2A2A] pt-4">
              {SESSION.description}
            </p>
            <div className="border-t border-[#2A2A2A] pt-4 mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
              <span className="font-inter text-[#999999] text-xs">
                <span className="text-white font-medium">{watchers}</span> members getting ready
              </span>
            </div>
          </motion.div>

          {/* Checklist */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="sm:w-64 bg-[#1A1A1A] border border-[#333333] rounded-sm p-5 text-left flex flex-col gap-4"
          >
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Get ready</p>
            <div className="space-y-3">
              {checkItems.map((item, i) => (
                <button
                  key={item}
                  onClick={() => toggle(i)}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  {checklist[i] ? (
                    <CheckCircle2 size={16} className="text-white shrink-0" />
                  ) : (
                    <Circle size={16} className="text-[#444] shrink-0 group-hover:text-[#666] transition-colors" />
                  )}
                  <span className={`font-inter text-sm transition-colors ${checklist[i] ? 'text-[#999999] line-through' : 'text-[#aaa] group-hover:text-white'}`}>
                    {item}
                  </span>
                </button>
              ))}
            </div>

            {/* Dev shortcut */}
            <div className="mt-auto pt-4 border-t border-[#2A2A2A]">
              <button
                onClick={onGoLive}
                className="w-full bg-[#FF3B3B] hover:bg-red-700 text-white font-inter font-bold py-2.5 rounded-sm text-xs tracking-[2px] uppercase transition-colors"
              >
                Go Live
              </button>
              <p className="text-center text-[#444] font-inter text-xs mt-2">Dev shortcut</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── LIVE phase ───────────────────────────────────────────────────────────────
function LivePhase({ onEndClass, playbackId }: { onEndClass: () => void; playbackId?: string }) {
  const [elapsed, setElapsed] = useState(0)
  const toggleUi = useCallback(() => {}, [])

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const elapsedMins = Math.floor(elapsed / 60)
  const elapsedSecs = elapsed % 60

  return (
    <motion.div
      key="live"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-[#0D0D0D] flex flex-col lg:flex-row"
      onClick={toggleUi}
    >
      {/* Left: video — 70% on desktop */}
      <div className="flex-1 lg:w-[70%] bg-black flex items-center min-h-[56vw] lg:min-h-screen">
        {playbackId ? (
          <MuxPlayer
            streamType="live"
            playbackId={playbackId}
            autoPlay
            accentColor="#FF3B3B"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-[#FF3B3B]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }} />
                ))}
              </div>
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Stream not started</p>
            </div>
          </div>
        )}
      </div>

      {/* Right: data panel — 30% on desktop */}
      <div className="lg:w-[30%] bg-[#1A1A1A] border-t lg:border-t-0 border-l-0 lg:border-l border-[#333333] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Nav */}
        <div className="px-5 h-12 border-b border-[#2A2A2A] flex items-center justify-between">
          <Link href="/dashboard" className="text-[#999999] hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
          {/* Dev: end class */}
          <button
            onClick={onEndClass}
            className="font-inter text-[11px] text-[#999999] hover:text-white tracking-[2px] uppercase transition-colors"
          >
            End class
          </button>
        </div>

        {/* Section 1: LIVE badge + title */}
        <div className="px-5 py-5 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-[#FF3B3B] px-2 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-inter text-white text-[11px] tracking-[4px] uppercase font-medium">Live</span>
            </span>
          </div>
          <h1 className="font-bebas text-[28px] text-white tracking-[1px] leading-tight">{SESSION.title}</h1>
        </div>

        {/* Section 2: viewer count */}
        <div className="px-5 py-5 border-b border-[#2A2A2A]">
          <div className="font-bebas text-[56px] text-[#FF3B3B] leading-none tracking-[1px]">47</div>
          <div className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mt-1">Watching now</div>
        </div>

        {/* Section 3: coach + gym */}
        <div className="px-5 py-5 border-b border-[#2A2A2A]">
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Coach</p>
          <p className="font-bebas text-[18px] text-white tracking-[1px]">{SESSION.coachName}</p>
          <p className="font-inter text-[11px] text-[#999999] mt-0.5">{SESSION.discipline}</p>
        </div>

        {/* Section 4: elapsed time */}
        <div className="px-5 py-5">
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Elapsed</p>
          <div className="font-bebas text-[40px] text-white tracking-[1px] tabular-nums leading-none">
            {pad(elapsedMins)}:{pad(elapsedSecs)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── POST phase ───────────────────────────────────────────────────────────────
const PROCESSING_MESSAGES = [
  "Reviewing today's class...",
  'Identifying techniques...',
  'Finding key moments...',
]

function PostPhase() {
  const [stage, setStage] = useState<'instant' | 'processing' | 'ready'>('instant')
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage('processing'), 1200)
    const t2 = setTimeout(() => setStage('ready'), 11000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (stage !== 'processing') return
    const t = setInterval(() => setMsgIdx(i => (i + 1) % PROCESSING_MESSAGES.length), 3000)
    return () => clearInterval(t)
  }, [stage])

  return (
    <motion.div
      key="post"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0D0D0D] px-4 py-12 overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-2"
        >
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Session complete</p>
          <h1 className="font-bebas text-5xl text-white tracking-[1px]">Class Ended</h1>
          <p className="font-inter text-[#999999] text-sm">Great work on the mat.</p>
        </motion.div>

        {/* Processing / summary */}
        <AnimatePresence mode="wait">
          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-8 flex flex-col items-center gap-5"
            >
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#FF3B3B]"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }}
                  />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="font-inter text-[#999999] text-sm"
                >
                  {PROCESSING_MESSAGES[msgIdx]}
                </motion.p>
              </AnimatePresence>
              <div className="w-full space-y-3 mt-2">
                {[80, 60, 90, 50, 70].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#222222] animate-pulse shrink-0" />
                    <div className="h-2 bg-[#222222] animate-pulse rounded-sm" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {stage === 'ready' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <SessionSummary data={DEMO_SUMMARY} />
            </motion.div>
          )}
        </AnimatePresence>

        {stage !== 'ready' && (
          <Link href="/dashboard" className="font-inter text-[#555] hover:text-[#999999] text-sm transition-colors">
            Back to dashboard
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Client ──────────────────────────────────────────────────────────────
export default function LiveClient({ playbackId }: { playbackId?: string }) {
  const [phase, setPhase] = useState<Phase>('pre')

  return (
    <div className="min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {phase === 'pre' && (
          <PrePhase key="pre" onGoLive={() => setPhase('live')} />
        )}
        {phase === 'live' && (
          <LivePhase key="live" onEndClass={() => setPhase('post')} playbackId={playbackId} />
        )}
        {phase === 'post' && (
          <PostPhase key="post" />
        )}
      </AnimatePresence>
    </div>
  )
}
