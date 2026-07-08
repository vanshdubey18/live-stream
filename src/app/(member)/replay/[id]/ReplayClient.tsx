'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Pause, Volume2, Maximize, Settings, Lock, Sparkles, BookOpen, Layers, MessageCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Hls from 'hls.js'
import LiveChat from '@/components/live/LiveChat'

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

type Tab = 'summary' | 'chat' | 'quiz' | 'flashcards' | 'ask'

// ─── Upgrade CTA overlay ──────────────────────────────────────────────────────
function UpgradeOverlay({ feature }: { feature: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center"
      style={{ background: 'linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.97) 40%)' }}>
      <div className="w-10 h-10 rounded-sm bg-[#b3402f]/10 border border-[#b3402f]/20 flex items-center justify-center mb-4">
        <Lock size={18} className="text-[#b3402f]" />
      </div>
      <p className="font-mincho text-2xl text-[#f0eadc] tracking-[1px] mb-1">AI COACH</p>
      <p className="font-mincho text-[#a29c8c] text-xs mb-5 leading-relaxed">
        {feature}
      </p>
      <a
        href="/dashboard/billing"
        className="inline-flex items-center gap-2 bg-[#b3402f] text-[#f0eadc] font-mincho tracking-[3px] text-sm px-6 py-3 rounded-sm hover:bg-[#942f22] transition-colors"
      >
        <Sparkles size={14} />
        UNLOCK AI COACH
      </a>
      <p className="font-mincho text-[#7a7568] text-[10px] mt-3">Coming soon · Join the waitlist</p>
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
          <span className="font-mincho text-[10px] text-[#b3402f] tracking-[3px] uppercase border border-[#b3402f]/20 bg-[#b3402f]/5 px-2 py-1 rounded-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b3402f]" />
            AI Analysis · This Class
          </span>
        ) : (
          <span className="font-mincho text-[10px] text-[#00D4AA] tracking-[3px] uppercase border border-[#00D4AA]/20 bg-[#00D4AA]/5 px-2 py-1 rounded-sm">
            ✓ Free with membership
          </span>
        )}
      </div>

      {/* Techniques */}
      <div>
        <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-3">Techniques Covered</p>
        <div className="space-y-1">
          {techniques.map(t => (
            <button
              key={t.name}
              onClick={() => t.timestamp && seekable && onTimestampClick(t.timestamp)}
              disabled={!seekable || !t.timestamp}
              className="w-full flex items-center justify-between group px-3 py-2.5 rounded-sm enabled:hover:bg-[#242420] disabled:cursor-default transition-colors"
            >
              <span className="font-mincho text-sm text-[#f0eadc] group-enabled:group-hover:text-[#b3402f] transition-colors text-left">{t.name}</span>
              {t.timestamp && (
                <span className="font-mono text-[11px] text-[#b3402f] bg-[#b3402f]/10 px-2 py-0.5 rounded-sm shrink-0 ml-2 flex items-center gap-1">
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
          <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-3">Key Moments</p>
          <div className="space-y-1">
            {moments.map(m => (
              <button
                key={m.timestamp}
                onClick={() => seekable && onTimestampClick(m.timestamp)}
                disabled={!seekable}
                className="w-full flex items-center gap-3 group px-3 py-2.5 rounded-sm enabled:hover:bg-[#242420] disabled:cursor-default transition-colors text-left"
              >
                <span className="font-mono text-[11px] text-[#b3402f] shrink-0 w-10">{m.timestamp}</span>
                <span className="font-mincho text-sm text-[#a29c8c] group-hover:text-[#f0eadc] transition-colors flex-1">{m.label}</span>
                <ChevronRight size={12} className="text-[#444] group-hover:text-[#b3402f] shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Coach quote */}
      {quote && (
        <div className="border-l-2 border-[#b3402f]/40 pl-4">
          <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-2">Coach&apos;s Key Point</p>
          <p className="font-mincho text-sm text-[#f0eadc] italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
        </div>
      )}

      {/* Upsell teaser */}
      <div className="bg-[#141410] border border-[#322f26] rounded-sm p-4 space-y-3">
        <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Also in AI Coach</p>
        {[
          { icon: '🧠', text: 'Quiz yourself on this class' },
          { icon: '🃏', text: 'Flashcards with spaced repetition' },
          { icon: '💬', text: 'Ask your coach anything, cited' },
        ].map(item => (
          <div key={item.text} className="flex items-center gap-2 opacity-50">
            <span>{item.icon}</span>
            <span className="font-mincho text-sm text-[#a29c8c]">{item.text}</span>
            <Lock size={10} className="text-[#555] ml-auto" />
          </div>
        ))}
        <a
          href="/dashboard/billing"
          className="block w-full text-center bg-[#b3402f]/10 border border-[#b3402f]/20 text-[#b3402f] font-mincho tracking-[3px] text-xs py-2.5 rounded-sm hover:bg-[#b3402f]/20 transition-colors mt-1"
        >
          UNLOCK AI COACH
        </a>
      </div>
    </div>
  )
}

// ─── Chat tab (FREE) — the live class chat log, optional to view ─────────────
function ChatReplayTab({ sessionId, userId }: { sessionId: string; userId: string }) {
  return (
    <div className="px-5 py-5">
      <LiveChat sessionId={sessionId} userId={userId} readOnly />
    </div>
  )
}

// ─── Quiz tab (LOCKED) ────────────────────────────────────────────────────────
function QuizTab() {
  return (
    <div className="relative px-5 py-5 min-h-[400px]">
      {/* Blurred preview */}
      <div className="blur-sm pointer-events-none select-none space-y-3">
        <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-4">5 Questions · This Class</p>
        {DEMO_QUIZ.map((q, i) => (
          <div key={i} className="bg-[#141410] border border-[#322f26] rounded-sm p-4">
            <p className="font-mincho text-sm text-[#f0eadc] mb-3">Q{i + 1}. {q}</p>
            <div className="grid grid-cols-2 gap-2">
              {['A', 'B', 'C', 'D'].map(opt => (
                <div key={opt} className="border border-[#322f26] rounded-sm px-3 py-2 font-mincho text-xs text-[#7a7568]">{opt}. ···</div>
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
          <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">{DEMO_TECHNIQUES.length} Cards · This Class</p>
          <span className="font-mincho text-xs text-[#7a7568]">Card 1 of {DEMO_TECHNIQUES.length}</span>
        </div>
        {/* Main card */}
        <div className="bg-[#141410] border border-[#b3402f]/20 rounded-sm p-8 text-center min-h-[160px] flex flex-col items-center justify-center gap-3">
          <p className="font-mincho text-[10px] text-[#a29c8c] tracking-[3px] uppercase">Technique</p>
          <p className="font-mincho text-2xl text-[#f0eadc] tracking-[1px]">{DEMO_FLASHCARDS[0].front}</p>
          <p className="font-mincho text-[11px] text-[#b3402f]">Tap to flip →</p>
        </div>
        {/* Mini cards */}
        <div className="grid grid-cols-3 gap-2">
          {DEMO_TECHNIQUES.slice(0, 3).map(t => (
            <div key={t.name} className="bg-[#141410] border border-[#322f26] rounded-sm p-2 text-center">
              <p className="font-mincho text-[10px] text-[#7a7568] truncate">{t.name}</p>
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
            <div className={`max-w-[85%] px-4 py-3 rounded-sm text-sm font-mincho ${
              msg.role === 'user'
                ? 'bg-[#b3402f]/10 border border-[#b3402f]/20 text-[#f0eadc]'
                : 'bg-[#141410] border border-[#322f26] text-[#a29c8c]'
            }`}>
              {msg.role === 'ai' && (
                <p className="text-[10px] text-[#b3402f] tracking-[2px] uppercase mb-1">AI Coach · 22:10 ▶</p>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {/* Typing indicator */}
        <div className="flex justify-start">
          <div className="bg-[#141410] border border-[#322f26] px-4 py-3 rounded-sm flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#7a7568]" />
            ))}
          </div>
        </div>
        {/* Input */}
        <div className="border border-[#322f26] rounded-sm px-4 py-3 flex items-center gap-2">
          <span className="font-mincho text-sm text-[#635f54] flex-1">Ask about this class…</span>
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
  sessionId,
  userId,
}: {
  onTimestampClick: (ts: string) => void
  seekable?: boolean
  aiData?: AIData | null
  sessionId: string
  userId: string
}) {
  const [activeTab, setActiveTab] = useState<Tab>('summary')

  const tabs: { id: Tab; label: string; icon: React.ReactNode; locked: boolean }[] = [
    { id: 'summary', label: 'Summary', icon: <BookOpen size={12} />, locked: false },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={12} />, locked: false },
    { id: 'quiz', label: 'Quiz', icon: <Sparkles size={12} />, locked: true },
    { id: 'flashcards', label: 'Cards', icon: <Layers size={12} />, locked: true },
    { id: 'ask', label: 'Coach', icon: <MessageCircle size={12} />, locked: true },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar — horizontally scrollable so 5 tabs never wrap/collide on narrow screens */}
      <div className="flex overflow-x-auto border-b border-[#2a2a20] shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 flex items-center justify-center gap-1 px-3.5 py-3 font-mincho text-[10px] tracking-[1.5px] uppercase transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-[#f0eadc]'
                : 'text-[#7a7568] hover:text-[#a29c8c]'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.locked && <Lock size={8} className="text-[#b3402f]" />}
            {activeTab === tab.id && (
              <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-px bg-[#f0eadc]" />
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
            {activeTab === 'chat' && <ChatReplayTab sessionId={sessionId} userId={userId} />}
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
  sessionId,
  userId,
  replayUrl,
  session,
  aiData,
  chapters = [],
}: {
  sessionId: string
  userId: string
  replayUrl?: string
  session?: SessionMeta
  aiData?: AIData | null
  chapters?: Chapter[]
}) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [jumpTo, setJumpTo] = useState<string | null>(null)
  const playerRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = playerRef.current
    if (!video || !replayUrl) return

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = replayUrl
      return
    }
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(replayUrl)
      hls.attachMedia(video)
      return () => hls.destroy()
    }
  }, [replayUrl])

  function handleTimestamp(ts: string) {
    const [m, s] = ts.split(':').map(Number)
    const seekSeconds = m * 60 + s
    if (replayUrl && playerRef.current) {
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
    <div className="min-h-screen bg-[#141410]">

      {/* Top nav */}
      <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#322f26] h-12 flex items-center px-6 gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#a29c8c] hover:text-[#f0eadc] font-mincho text-sm transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <div className="h-4 w-px bg-[#322f26]" />
        <h1 className="font-mincho text-[18px] text-[#f0eadc] tracking-[1px] truncate">{displayTitle}</h1>
        <span className="ml-auto font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Replay</span>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">

        {/* ── Left: Video player ── */}
        <div className="flex-1 lg:w-[70%] min-w-0">
          <div className="relative bg-black">
            {replayUrl ? (
              <>
                <video
                  ref={playerRef}
                  controls
                  playsInline
                  className="w-full block"
                  style={{ background: '#000' }}
                />
                {jumpTo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1c1c16] border border-[#322f26] rounded-sm px-4 py-2 font-mincho text-[#f0eadc] text-sm z-10"
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
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1c1c16] border border-[#322f26] rounded-sm px-4 py-2 font-mincho text-[#f0eadc] text-sm z-10"
                  >
                    Jumped to {jumpTo}
                  </motion.div>
                )}
                <button onClick={() => setPlaying(v => !v)} className="absolute inset-0 flex items-center justify-center group">
                  <div className="w-14 h-14 bg-[#1c1c16] border border-[#322f26] rounded-sm flex items-center justify-center transition-colors group-hover:border-[#7a7568]">
                    {playing ? <Pause size={20} className="text-[#f0eadc]" /> : <Play size={20} className="text-[#f0eadc] ml-0.5" />}
                  </div>
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                  <div className="relative h-px bg-[#322f26] mb-3 cursor-pointer group"
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setProgress((e.clientX - rect.left) / rect.width)
                    }}>
                    <div className="h-full bg-[#b3402f] transition-all" style={{ width: `${progress * 100}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPlaying(v => !v)} className="text-[#f0eadc] hover:text-[#b3402f] transition-colors">
                        {playing ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button className="text-[#a29c8c] hover:text-[#f0eadc] transition-colors"><Volume2 size={14} /></button>
                      <span className="font-mincho text-[#a29c8c] text-xs tabular-nums">
                        {(() => { const dur = session?.duration_minutes ?? 60; const cur = progress * dur; return `${String(Math.floor(cur)).padStart(2,'0')}:${String(Math.floor((cur*60)%60)).padStart(2,'0')} / ${String(dur).padStart(2,'0')}:00` })()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-[#a29c8c] hover:text-[#f0eadc] transition-colors"><Settings size={14} /></button>
                      <button className="text-[#a29c8c] hover:text-[#f0eadc] transition-colors"><Maximize size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="border-b border-[#2a2a20] px-5 py-3 flex items-center gap-3">
            <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase shrink-0">Watched</span>
            <div className="flex-1 h-px bg-[#322f26] relative">
              <div className="h-full bg-[#f0eadc] transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <span className="font-mincho text-[18px] text-[#f0eadc] tracking-[1px] shrink-0 tabular-nums">{Math.round(progress * 100)}%</span>
          </div>

          {/* Chapters */}
          {chapters.length > 0 && (
            <div className="border-b border-[#2a2a20] px-5 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-5 h-px bg-[#b3402f]" />
                <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Chapters</p>
              </div>
              <div className="space-y-1">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterSeek(ch.timestamp_seconds)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-[#1c1c16] transition-colors text-left group"
                  >
                    <span className="font-mincho text-[#b3402f] text-sm tracking-[1px] tabular-nums shrink-0 w-10">
                      {fmtSeconds(ch.timestamp_seconds)}
                    </span>
                    <span className="font-mincho text-sm text-[#a29c8c] group-hover:text-[#f0eadc] transition-colors truncate">
                      {ch.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Session meta — mobile */}
          <div className="lg:hidden border-b border-[#2a2a20] px-5 py-5">
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-3">Class Info</p>
            <h2 className="font-mincho text-[28px] text-[#f0eadc] tracking-[1px] mb-1">{displayTitle}</h2>
            <p className="font-mincho text-[#a29c8c] text-xs">{displayCoach}{displayGym ? ` · ${displayGym}` : ''} · {displayDuration}</p>
          </div>

          {/* Mobile AI sidebar */}
          <div className="lg:hidden border-t border-[#322f26]">
            <AISidebar onTimestampClick={handleTimestamp} seekable={Boolean(replayUrl)} aiData={aiData} sessionId={sessionId} userId={userId} />
          </div>
        </div>

        {/* ── Right: AI sidebar — 30% desktop ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex lg:w-[30%] shrink-0 flex-col bg-[#1c1c16] border-l border-[#322f26] min-h-screen"
        >
          {/* Class info header */}
          <div className="px-5 py-5 border-b border-[#2a2a20] shrink-0">
            <h2 className="font-mincho text-[22px] text-[#f0eadc] tracking-[1px] leading-tight">{displayTitle}</h2>
            <p className="font-mincho text-[#a29c8c] text-xs mt-0.5">{displayCoach}{displayGym ? ` · ${displayGym}` : ''} · {displayDuration}</p>
          </div>

          {/* Tabbed AI panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <AISidebar onTimestampClick={handleTimestamp} seekable={Boolean(replayUrl)} aiData={aiData} sessionId={sessionId} userId={userId} />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
