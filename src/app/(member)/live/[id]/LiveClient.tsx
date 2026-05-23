'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, PictureInPicture2, Settings, MessageCircle, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
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
      className="min-h-screen bg-[#050505] text-white flex flex-col"
    >
      {/* Top countdown */}
      <div className="flex flex-col items-center pt-12 pb-6 px-4">
        <span className="text-[#888888] text-sm font-medium mb-3 flex items-center gap-2">
          <span>⏱</span> Class starts in
        </span>
        <div className="text-7xl sm:text-8xl font-black tracking-tighter tabular-nums text-white">
          {pad(mins)}
          <span className="text-[#DC2626] mx-1">:</span>
          {pad(secs)}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 pb-8 max-w-4xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        {/* Session card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
        >
          {/* Coach avatar + info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#DC2626]/20 flex items-center justify-center shrink-0">
              <span className="text-[#DC2626] text-xl font-black">{SESSION.coachInitials}</span>
            </div>
            <div>
              <p className="text-white font-bold text-base">{SESSION.coachName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                  {SESSION.discipline}
                </span>
                <span className="text-[#555] text-xs">{SESSION.level}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {SESSION.title}
          </h1>

          {/* Description */}
          <p className="text-[#888888] text-sm leading-relaxed">{SESSION.description}</p>

          {/* Watcher count */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
            <span className="text-[#888888] text-sm">
              <span className="text-white font-bold">{watchers}</span> members getting ready
            </span>
          </div>
        </motion.div>

        {/* Right panel */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="lg:w-72 bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
        >
          <h2 className="text-white font-bold text-base">Get Ready Checklist</h2>
          <div className="space-y-3">
            {checkItems.map((item, i) => (
              <button
                key={item}
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 text-left group"
              >
                {checklist[i] ? (
                  <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                ) : (
                  <Circle size={20} className="text-[#444] shrink-0 group-hover:text-[#666] transition-colors" />
                )}
                <span
                  className={`text-sm transition-colors ${
                    checklist[i] ? 'text-green-400 line-through decoration-green-400/50' : 'text-[#aaa] group-hover:text-white'
                  }`}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>

          {/* Dev shortcut */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <button
              onClick={onGoLive}
              className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Go Live
            </button>
            <p className="text-center text-[#444] text-xs mt-2">Dev shortcut</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── LIVE phase ───────────────────────────────────────────────────────────────
function LivePhase({ onEndClass }: { onEndClass: () => void }) {
  const [uiVisible, setUiVisible] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  const toggleUi = useCallback(() => setUiVisible(v => !v), [])

  return (
    <motion.div
      key="live"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-black relative overflow-hidden select-none"
    >
      {/* Mock video area */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={toggleUi}
        style={{
          background:
            'linear-gradient(135deg, #0a0a0a 0%, #1a0505 25%, #050a0a 50%, #0a0510 75%, #0a0a0a 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 30% 70%, rgba(220,38,38,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(59,130,246,0.1) 0%, transparent 60%)',
          }}
        />
        {/* MATPEAK watermark */}
        <div className="absolute bottom-1/2 right-8 translate-y-1/2 opacity-10 pointer-events-none">
          <span className="text-white text-4xl font-black tracking-tighter">MATPEAK</span>
        </div>
        {/* Center indicator */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 opacity-40">
            <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/10" />
            </div>
            <span className="text-white/60 text-xs">Tap to toggle UI</span>
          </div>
        </div>
      </div>

      {/* UI overlay */}
      <AnimatePresence>
        {uiVisible && (
          <>
            {/* Top bar */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="absolute top-0 left-0 right-0 z-10 px-4 h-16 flex items-center justify-between"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}
            >
              <Link href="/dashboard">
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <ArrowLeft size={18} className="text-white" />
                </button>
              </Link>

              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                <span className="text-white text-sm font-bold">LIVE</span>
                <span className="text-white/60 text-sm">·</span>
                <span className="text-white/80 text-sm">47 watching</span>
              </div>
            </motion.div>

            {/* Bottom bar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 z-10 px-4 py-4 flex items-end justify-between"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}
            >
              {/* Left: Coach info */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm">{SESSION.coachName}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 w-fit mt-0.5">
                    {SESSION.discipline}
                  </span>
                </div>
              </div>

              {/* Right: controls */}
              <div className="flex items-center gap-2">
                {/* Chat */}
                <button
                  onClick={e => { e.stopPropagation(); setChatOpen(v => !v) }}
                  className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <MessageCircle size={16} className="text-white" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center">
                    12
                  </span>
                </button>

                {/* PiP */}
                <button
                  onClick={e => e.stopPropagation()}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <PictureInPicture2 size={16} className="text-white" />
                </button>

                {/* Quality */}
                <button
                  onClick={e => e.stopPropagation()}
                  className="h-10 px-3 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 transition-colors"
                >
                  <Settings size={14} className="text-white" />
                  <span className="text-white text-xs font-bold">HD</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Dev: End Class */}
      <div className="absolute top-4 right-4 z-20" onClick={e => e.stopPropagation()}>
        <AnimatePresence>
          {uiVisible && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onEndClass}
              className="bg-[#DC2626]/80 hover:bg-[#DC2626] border border-red-500/40 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm"
            >
              End Class
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 bottom-0 w-80 bg-[#0a0a0a]/95 backdrop-blur-md border-l border-white/10 z-20 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 h-16 flex items-center justify-between border-b border-white/5">
              <span className="text-white font-bold text-sm">Live Chat</span>
              <button onClick={() => setChatOpen(false)} className="text-[#888] hover:text-white transition-colors text-xs">
                Close
              </button>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {['Alex: Great technique! 🔥', 'Priya: When does he cover the back take?', 'Sam: Loving this class', 'Ravi: 🥋🥋', 'Neha: Finally understand the pressure pass'].map((msg, i) => (
                <div key={i} className="text-[#aaa] text-sm">{msg}</div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5">
              <input
                type="text"
                placeholder="Say something..."
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder:text-[#555] focus:outline-none focus:border-white/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient animation style */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
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
  // 'instant' → show congrats; after 1s → 'processing'; after 10s → 'ready'
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
      className="min-h-screen bg-[#050505] px-4 py-12 overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">

        {/* ── STEP 1: congrats (always visible) ── */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="text-center space-y-3"
        >
          <div className="text-7xl">🥋</div>
          <h1 className="text-4xl font-black text-white tracking-tight">Great session!</h1>
          <p className="text-[#888888] text-base">You trained for 58 minutes.</p>
        </motion.div>

        {/* ── STEP 2 / 3: processing → summary ── */}
        <AnimatePresence mode="wait">
          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl px-6 py-8 flex flex-col items-center gap-5"
            >
              {/* Animated dots */}
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }}
                  />
                ))}
              </div>

              {/* Cycling message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#888888] text-sm font-medium"
                >
                  {PROCESSING_MESSAGES[msgIdx]}
                </motion.p>
              </AnimatePresence>

              {/* Skeleton preview */}
              <div className="w-full space-y-3 mt-2">
                {[80, 60, 90, 50, 70].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1a1a1a] animate-pulse shrink-0" />
                    <div className={`h-3 bg-[#1a1a1a] rounded-full animate-pulse`} style={{ width: `${w}%` }} />
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

        {/* Back link always visible */}
        {stage !== 'ready' && (
          <Link href="/dashboard" className="text-[#555] hover:text-[#888] text-sm transition-colors">
            Back to dashboard
          </Link>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Client ──────────────────────────────────────────────────────────────
export default function LiveClient() {
  const [phase, setPhase] = useState<Phase>('pre')

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {phase === 'pre' && (
          <PrePhase key="pre" onGoLive={() => setPhase('live')} />
        )}
        {phase === 'live' && (
          <LivePhase key="live" onEndClass={() => setPhase('post')} />
        )}
        {phase === 'post' && (
          <PostPhase key="post" />
        )}
      </AnimatePresence>
    </div>
  )
}
