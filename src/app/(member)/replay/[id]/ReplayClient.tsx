'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, Volume2, Maximize, Settings, Lock, Sparkles, BookOpen, Layers, MessageCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import MuxPlayer from '@mux/mux-player-react'

interface SessionMeta {
  title: string
  discipline: string
  duration_minutes: number
  coach: string | null
  gym: string | null
}

export interface AIData {
  summary: string
  techniques: { name: string; timestamp: string | null }[]
  moments: { timestamp: string; label: string }[]
  coachQuote: string
}

// Demo data for free summary tab
const DEMO_TECHNIQUES = [
  { name: 'Hip escape entry', timestamp: '08:14' },
  { name: 'Underhook battle', timestamp: '14:32' },
  { name: 'Old school sweep', timestamp: '28:20' },
  { name: 'Coyote half guard', timestamp: '41:15' },
  { name: 'Knee shield defense', timestamp: '52:08' },
]
const DEMO_MOMENTS = [
  { timestamp: '08:14', label: 'Hip escape entry detail' },
  { timestamp: '28:20', label: 'The sweep mechanics' },
  { timestamp: '41:15', label: 'Common mistakes' },
  { timestamp: '52:08', label: 'Live drilling demo' },
]
const DEMO_QUOTE = "The sweep doesn't work without the underhook. Drill the grip fight first."

// Locked tab blur content
const DEMO_QUIZ = [
  'What is the first step when entering half guard?',
  'Why is the underhook critical before attempting the sweep?',
  'Name two ways to create space from the bottom.',
]
const DEMO_FLASHCARDS = [
  { front: 'Old School Sweep', back: 'Underhook + hip escape → drive through' },
  { front: 'Knee Shield', back: 'Frame against knee to create distance' },
]
const DEMO_CHAT = [
  { role: 'user', text: 'How do I finish when they block my underhook?' },
  { role: 'ai', text: 'Coach covered this at 22:10 — switch to the dogfight position and take the back instead.' },
  { role: 'user', text: 'What if my hips are too flat?' },
]

type Tab = 'summary' | 'quiz' | 'flashcards' | 'ask'

// ─── Upgrade CTA overlay ──────────────────────────────────────────────────────
function UpgradeOverlay({ feature }: { feature: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center"
      style={{ background: 'linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.97) 40%)' }}>
      <div className="w-10 h-10 rounded-sm bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 flex items-center justify-center mb-4">
        <Lock size={18} className="text-[#FF3B3B]" />
      </div>
      <p className="font-bebas text-2xl text-white tracking-[1px] mb-1">AI COACH</p>
      <p className="font-inter text-[#999999] text-xs mb-5 leading-relaxed">
        {feature}
      </p>
      <a
        href="/dashboard/billing"
        className="inline-flex items-center gap-2 bg-[#FF3B3B] text-white font-bebas tracking-[3px] text-sm px-6 py-3 rounded-sm hover:bg-[#cc2f2f] transition-colors"
      >
        <Sparkles size={14} />
        UNLOCK AI COACH
      </a>
      <p className="font-inter text-[#555555] text-[10px] mt-3">Coming soon · Join the waitlist</p>
    </div>
  )
}

// ─── Summary tab (FREE) ───────────────────────────────────────────────────────
function SummaryTab({
  onTimestampClick,
  seekable = true,
  aiData,
}: {
  onTimestampClick: (ts: string) => void
  seekable?: boolean
  aiData?: AIData | null
}) {
  const techniques = aiData ? aiData.techniques : DEMO_TECHNIQUES.map(t => ({ name: t.name, timestamp: t.timestamp }))
  const moments = aiData ? aiData.moments : DEMO_MOMENTS
  const quote = aiData ? aiData.coachQuote : DEMO_QUOTE

  return (
    <div className="space-y-6 px-5 py-5">

      {/* Badge */}
      <div className="flex items-center gap-2">
        {aiData ? (
          <span className="font-inter text-[10px] text-[#FF3B3B] tracking-[3px] uppercase border border-[#FF3B3B]/20 bg-[#FF3B3B]/5 px-2 py-1 rounded-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B]" />
            AI Analysis · This Class
          </span>
        ) : (
          <span className="font-inter text-[10px] text-[#00D4AA] tracking-[3px] uppercase border border-[#00D4AA]/20 bg-[#00D4AA]/5 px-2 py-1 rounded-sm">
            ✓ Free with membership
          </span>
        )}
      </div>

      {/* Techniques */}
      <div>
        <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">Techniques Covered</p>
        <div className="space-y-1">
          {techniques.map(t => (
            <button
              key={t.name}
              onClick={() => t.timestamp && seekable && onTimestampClick(t.timestamp)}
              disabled={!seekable || !t.timestamp}
              className="w-full flex items-center justify-between group px-3 py-2.5 rounded-sm enabled:hover:bg-[#222222] disabled:cursor-default transition-colors"
            >
              <span className="font-inter text-sm text-white group-enabled:group-hover:text-[#FF3B3B] transition-colors text-left">{t.name}</span>
              {t.timestamp && (
                <span className="font-mono text-[11px] text-[#FF3B3B] bg-[#FF3B3B]/10 px-2 py-0.5 rounded-sm shrink-0 ml-2 flex items-center gap-1">
                  <Play size={8} />
                  {t.timestamp}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Key moments */}
      {moments.length > 0 && (
        <div>
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">Key Moments</p>
          <div className="space-y-1">
            {moments.map(m => (
              <button
                key={m.timestamp}
                onClick={() => seekable && onTimestampClick(m.timestamp)}
                disabled={!seekable}
                className="w-full flex items-center gap-3 group px-3 py-2.5 rounded-sm enabled:hover:bg-[#222222] disabled:cursor-default transition-colors text-left"
              >
                <span className="font-mono text-[11px] text-[#FF3B3B] shrink-0 w-10">{m.timestamp}</span>
                <span className="font-inter text-sm text-[#999999] group-hover:text-white transition-colors flex-1">{m.label}</span>
                <ChevronRight size={12} className="text-[#444] group-hover:text-[#FF3B3B] shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Coach quote */}
      {quote && (
        <div className="border-l-2 border-[#FF3B3B]/40 pl-4">
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Coach&apos;s Key Point</p>
          <p className="font-inter text-sm text-white italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
        </div>
      )}

      {/* Upsell teaser */}
      <div className="bg-[#0D0D0D] border border-[#333333] rounded-sm p-4 space-y-3">
        <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Also in AI Coach</p>
        {[
          { icon: '🧠', text: 'Quiz yourself on this class' },
          { icon: '🃏', text: 'Flashcards with spaced repetition' },
          { icon: '💬', text: 'Ask your coach anything, cited' },
        ].map(item => (
          <div key={item.text} className="flex items-center gap-2 opacity-50">
            <span>{item.icon}</span>
            <span className="font-inter text-sm text-[#999999]">{item.text}</span>
            <Lock size={10} className="text-[#555] ml-auto" />
          </div>
        ))}
        <a
          href="/dashboard/billing"
          className="block w-full text-center bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-[#FF3B3B] font-bebas tracking-[3px] text-xs py-2.5 rounded-sm hover:bg-[#FF3B3B]/20 transition-colors mt-1"
        >
          UNLOCK AI COACH
        </a>
      </div>
    </div>
  )
}

// ─── Quiz tab (LOCKED) ────────────────────────────────────────────────────────
function QuizTab() {
  return (
    <div className="relative px-5 py-5 min-h-[400px]">
      {/* Blurred preview */}
      <div className="blur-sm pointer-events-none select-none space-y-3">
        <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">5 Questions · This Class</p>
        {DEMO_QUIZ.map((q, i) => (
          <div key={i} className="bg-[#0D0D0D] border border-[#333333] rounded-sm p-4">
            <p className="font-inter text-sm text-white mb-3">Q{i + 1}. {q}</p>
            <div className="grid grid-cols-2 gap-2">
              {['A', 'B', 'C', 'D'].map(opt => (
                <div key={opt} className="border border-[#333333] rounded-sm px-3 py-2 font-inter text-xs text-[#555555]">{opt}. ···</div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <UpgradeOverlay feature="Quiz yourself after every class. Spaced repetition reminds you of techniques you're forgetting." />
    </div>
  )
}

// ─── Flashcards tab (LOCKED) ──────────────────────────────────────────────────
function FlashcardsTab() {
  return (
    <div className="relative px-5 py-5 min-h-[400px]">
      {/* Blurred preview */}
      <div className="blur-sm pointer-events-none select-none space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">{DEMO_TECHNIQUES.length} Cards · This Class</p>
          <span className="font-inter text-xs text-[#555555]">Card 1 of {DEMO_TECHNIQUES.length}</span>
        </div>
        {/* Main card */}
        <div className="bg-[#0D0D0D] border border-[#FF3B3B]/20 rounded-sm p-8 text-center min-h-[160px] flex flex-col items-center justify-center gap-3">
          <p className="font-inter text-[10px] text-[#999999] tracking-[3px] uppercase">Technique</p>
          <p className="font-bebas text-2xl text-white tracking-[1px]">{DEMO_FLASHCARDS[0].front}</p>
          <p className="font-inter text-[11px] text-[#FF3B3B]">Tap to flip →</p>
        </div>
        {/* Mini cards */}
        <div className="grid grid-cols-3 gap-2">
          {DEMO_TECHNIQUES.slice(0, 3).map(t => (
            <div key={t.name} className="bg-[#0D0D0D] border border-[#333333] rounded-sm p-2 text-center">
              <p className="font-inter text-[10px] text-[#555555] truncate">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
      <UpgradeOverlay feature="Flip-card drills for every technique. AI surfaces cards you're forgetting before your next class." />
    </div>
  )
}

// ─── Ask Coach tab (LOCKED) ───────────────────────────────────────────────────
function AskCoachTab() {
  return (
    <div className="relative flex flex-col min-h-[400px]">
      {/* Blurred chat preview */}
      <div className="blur-sm pointer-events-none select-none flex-1 px-5 py-5 space-y-4">
        {DEMO_CHAT.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-sm text-sm font-inter ${
              msg.role === 'user'
                ? 'bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 text-white'
                : 'bg-[#0D0D0D] border border-[#333333] text-[#999999]'
            }`}>
              {msg.role === 'ai' && (
                <p className="text-[10px] text-[#FF3B3B] tracking-[2px] uppercase mb-1">AI Coach · 22:10 ▶</p>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="bg-[#0D0D0D] border border-[#333333] px-4 py-3 rounded-sm flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#555555]" />
            ))}
          </div>
        </div>
        {/* Input */}
        <div className="border border-[#333333] rounded-sm px-4 py-3 flex items-center gap-2">
          <span className="font-inter text-sm text-[#444444] flex-1">Ask about this class…</span>
        </div>
      </div>
      <UpgradeOverlay feature="Chat with an AI that watched every class with you. Every answer cites the exact timestamp from your coach." />
    </div>
  )
}

// ─── Main tabbed sidebar ──────────────────────────────────────────────────────
function AISidebar({
  onTimestampClick,
  seekable = true,
  aiData,
}: {
  onTimestampClick: (ts: string) => void
  seekable?: boolean
  aiData?: AIData | null
}) {
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  const tabs: { id: Tab; label: string; icon: React.ReactNode; locked: boolean }[] = [
    { id: 'summary', label: 'Summary', icon: <BookOpen size={12} />, locked: false },
    { id: 'quiz', label: 'Quiz', icon: <Sparkles size={12} />, locked: true },
    { id: 'flashcards', label: 'Cards', icon: <Layers size={12} />, locked: true },
    { id: 'ask', label: 'Ask Coach', icon: <MessageCircle size={12} />, locked: true },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-[#2A2A2A] shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 font-inter text-[11px] tracking-[2px] uppercase transition-colors relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-[#555555] hover:text-[#999999]'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.locked && <Lock size={8} className="text-[#FF3B3B]" />}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-px bg-white" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'summary' && <SummaryTab onTimestampClick={onTimestampClick} seekable={seekable} aiData={aiData} />}
            {activeTab === 'quiz' && <QuizTab />}
            {activeTab === 'flashcards' && <FlashcardsTab />}
            {activeTab === 'ask' && <AskCoachTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Chapter {
  id: string
  timestamp_seconds: number
  label: string
}

export default function ReplayClient({
  playbackId,
  session,
  aiData,
  chapters = [],
}: {
  playbackId?: string
  session?: SessionMeta
  aiData?: AIData | null
  chapters?: Chapter[]
}) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [jumpTo, setJumpTo] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)

  function handleTimestamp(ts: string) {
    const [m, s] = ts.split(':').map(Number)
    const seekSeconds = m * 60 + s
    if (playbackId && playerRef.current) {
      playerRef.current.currentTime = seekSeconds
    } else {
      const totalSeconds = (session?.duration_minutes ?? 60) * 60
      setProgress(seekSeconds / totalSeconds)
    }
    setJumpTo(ts)
    setPlaying(true)
    setTimeout(() => setJumpTo(null), 2000)
  }

  function handleChapterSeek(seconds: number) {
    if (playerRef.current) {
      playerRef.current.currentTime = seconds
    }
    const ts = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
    setJumpTo(ts)
    setTimeout(() => setJumpTo(null), 2000)
  }

  function fmtSeconds(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const displayTitle = session?.title ?? 'Replay'
  const displayCoach = session?.coach ?? 'Coach'
  const displayGym = session?.gym ?? ''
  const displayDuration = session ? `${session.duration_minutes}m` : '—'

  return (
    <div className="min-h-screen bg-[#0D0D0D]">

      {/* Top nav */}
      <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] h-12 flex items-center px-6 gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#999999] hover:text-white font-inter text-sm transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <div className="h-4 w-px bg-[#333333]" />
        <h1 className="font-bebas text-[18px] text-white tracking-[1px] truncate">{displayTitle}</h1>
        <span className="ml-auto font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Replay</span>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">

        {/* ── Left: Video player ── */}
        <div className="flex-1 lg:w-[70%] min-w-0">
          <div className="relative bg-black">
            {playbackId ? (
              <>
                <MuxPlayer
                  ref={playerRef}
                  streamType="on-demand"
                  playbackId={playbackId}
                  accentColor="#FF3B3B"
                  style={{ width: '100%', display: 'block' }}
                />
                {jumpTo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[#333333] rounded-sm px-4 py-2 font-inter text-white text-sm z-10"
                  >
                    Jumped to {jumpTo}
                  </motion.div>
                )}
              </>
            ) : (
              <div className="aspect-video relative bg-black">
                {jumpTo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[#333333] rounded-sm px-4 py-2 font-inter text-white text-sm z-10"
                  >
                    Jumped to {jumpTo}
                  </motion.div>
                )}
                <button onClick={() => setPlaying(v => !v)} className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-14 h-14 bg-[#1A1A1A] border border-[#333333] rounded-sm flex items-center justify-center transition-colors group-hover:border-[#555555]">
                    {playing ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white ml-0.5" />}
                  </div>
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                  <div className="relative h-px bg-[#333333] mb-3 cursor-pointer group"
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setProgress((e.clientX - rect.left) / rect.width)
                    }}>
                    <div className="h-full bg-[#FF3B3B] transition-all" style={{ width: `${progress * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPlaying(v => !v)} className="text-white hover:text-[#FF3B3B] transition-colors">
                        {playing ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button className="text-[#999999] hover:text-white transition-colors"><Volume2 size={14} /></button>
                      <span className="font-inter text-[#999999] text-xs tabular-nums">
                        {(() => { const dur = session?.duration_minutes ?? 60; const cur = progress * dur; return `${String(Math.floor(cur)).padStart(2,'0')}:${String(Math.floor((cur*60)%60)).padStart(2,'0')} / ${String(dur).padStart(2,'0')}:00` })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-[#999999] hover:text-white transition-colors"><Settings size={14} /></button>
                      <button className="text-[#999999] hover:text-white transition-colors"><Maximize size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="border-b border-[#2A2A2A] px-5 py-3 flex items-center gap-3">
            <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase shrink-0">Watched</span>
            <div className="flex-1 h-px bg-[#333333] relative">
              <div className="h-full bg-white transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <span className="font-bebas text-[18px] text-white tracking-[1px] shrink-0 tabular-nums">{Math.round(progress * 100)}%</span>
          </div>

          {/* Chapters */}
          {chapters.length > 0 && (
            <div className="border-b border-[#2A2A2A] px-5 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-px bg-[#FF3B3B]" />
                <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Chapters</p>
              </div>
              <div className="space-y-1">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterSeek(ch.timestamp_seconds)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-[#1A1A1A] transition-colors text-left group"
                  >
                    <span className="font-bebas text-[#FF3B3B] text-sm tracking-[1px] tabular-nums shrink-0 w-10">
                      {fmtSeconds(ch.timestamp_seconds)}
                    </span>
                    <span className="font-inter text-sm text-[#999999] group-hover:text-white transition-colors truncate">
                      {ch.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session meta — mobile */}
          <div className="lg:hidden border-b border-[#2A2A2A] px-5 py-5">
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">Class Info</p>
            <h2 className="font-bebas text-[28px] text-white tracking-[1px] mb-1">{displayTitle}</h2>
            <p className="font-inter text-[#999999] text-xs">{displayCoach}{displayGym ? ` · ${displayGym}` : ''} · {displayDuration}</p>
          </div>

          {/* Mobile AI sidebar */}
          <div className="lg:hidden border-t border-[#333333]">
            <AISidebar onTimestampClick={handleTimestamp} seekable={Boolean(playbackId)} aiData={aiData} />
          </div>
        </div>

        {/* ── Right: AI sidebar — 30% desktop ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex lg:w-[30%] shrink-0 flex-col bg-[#1A1A1A] border-l border-[#333333] min-h-screen"
        >
          {/* Class info header */}
          <div className="px-5 py-5 border-b border-[#2A2A2A] shrink-0">
            <h2 className="font-bebas text-[22px] text-white tracking-[1px] leading-tight">{displayTitle}</h2>
            <p className="font-inter text-[#999999] text-xs mt-0.5">{displayCoach}{displayGym ? ` · ${displayGym}` : ''} · {displayDuration}</p>
          </div>

          {/* Tabbed AI panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <AISidebar onTimestampClick={handleTimestamp} seekable={Boolean(playbackId)} aiData={aiData} />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
