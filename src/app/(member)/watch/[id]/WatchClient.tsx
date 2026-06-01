'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Circle, Lock, Sparkles, BookOpen, Layers, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import MuxPlayer from '@mux/mux-player-react'
import SessionSummary, { DEMO_SUMMARY } from '@/components/ai/SessionSummary'

function pad(n: number) { return String(n).padStart(2, '0') }

interface SessionInfo {
  id: string
  title: string
  discipline: string
  level: string
  gym_id: string
  scheduled_at: string
  coaches: { name: string } | null
  gyms: { name: string } | null
}

// ─── Waiting room (session is scheduled) ─────────────────────────────────────
function WaitingRoom({ session, onGoLive }: { session: SessionInfo; onGoLive: () => void }) {
  const scheduledAt = new Date(session.scheduled_at)
  const getRemaining = () => Math.max(0, Math.floor((scheduledAt.getTime() - Date.now()) / 1000))
  const [seconds, setSeconds] = useState(getRemaining)
  const [checklist, setChecklist] = useState([false, false, false])
  const checkItems = ['Find your gear', 'Clear your space', 'Set up your mat']
  const router = useRouter()

  // Countdown
  useEffect(() => {
    const t = setInterval(() => setSeconds(getRemaining()), 1000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll session status every 10s — auto-transition when gym goes live
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/watch/session-status?session_id=${session.id}`)
        const data = await res.json()
        if (data.status === 'live') {
          router.refresh() // re-run server component → renders LivePhase
        }
      } catch { /* ignore */ }
    }
    const t = setInterval(poll, 10_000)
    return () => clearInterval(t)
  }, [session.id, router])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const toggle = (i: number) => setChecklist(p => p.map((v, idx) => idx === i ? !v : v))

  return (
    <motion.div
      key="waiting"
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
        <h1 className="font-bebas text-5xl text-white tracking-[1px] mb-2">{session.title}</h1>

        {/* Gym / Coach */}
        <p className="font-inter text-[#999999] text-sm mb-12">
          {session.coaches?.name ?? 'Coach'}{session.gyms?.name ? ` · ${session.gyms.name}` : ''}
        </p>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-3 mb-12">
          <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Starts in</span>
          <div className="font-bebas text-7xl text-white tracking-[1px] tabular-nums">
            {pad(Math.floor(mins / 60) > 0 ? Math.floor(mins / 60) : mins)}
            <span className="text-[#333333] mx-1">:</span>
            {pad(Math.floor(mins / 60) > 0 ? mins % 60 : secs)}
          </div>
          {seconds === 0 && (
            <p className="font-inter text-[#999999] text-sm animate-pulse">Waiting for the gym to start…</p>
          )}
        </div>

        {/* Two panels */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4">

          {/* Session info */}
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex-1 bg-[#1A1A1A] border border-[#333333] rounded-sm p-5 text-left"
          >
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Session</p>
            <div className="space-y-1 mb-4">
              <p className="font-inter text-white text-sm font-medium">{session.coaches?.name ?? 'Coach'}</p>
              <p className="font-inter text-[#999999] text-xs">{session.gyms?.name}</p>
            </div>
            <div className="border-t border-[#2A2A2A] pt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
              <span className="font-inter text-[#999999] text-xs">Waiting for stream to start</span>
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
                <button key={item} onClick={() => toggle(i)} className="w-full flex items-center gap-3 text-left group">
                  {checklist[i]
                    ? <CheckCircle2 size={16} className="text-white shrink-0" />
                    : <Circle size={16} className="text-[#444] shrink-0 group-hover:text-[#666] transition-colors" />}
                  <span className={`font-inter text-sm transition-colors ${checklist[i] ? 'text-[#999999] line-through' : 'text-[#aaa] group-hover:text-white'}`}>
                    {item}
                  </span>
                </button>
              ))}
            </div>

          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Live viewer ──────────────────────────────────────────────────────────────
function LiveViewer({ playbackId, sessionId, session, onEnded }: {
  playbackId: string | null
  sessionId: string
  session: SessionInfo
  onEnded: () => void
}) {
  const router = useRouter()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  // Poll every 15s — if session flips to 'ended', transition to post-phase
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/watch/session-status?session_id=${sessionId}`)
        const data = await res.json()
        if (data.status === 'ended') onEnded()
      } catch { /* ignore */ }
    }
    const t = setInterval(poll, 15_000)
    return () => clearInterval(t)
  }, [sessionId, router, onEnded])

  return (
    <motion.div
      key="live"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0D0D0D] flex flex-col lg:flex-row"
    >
      {/* Left: video player — 70% on desktop */}
      <div className="flex-1 lg:w-[70%] bg-black flex items-center min-h-[56vw] lg:min-h-screen">
        {playbackId ? (
          <MuxPlayer
            streamType="live"
            playbackId={playbackId}
            autoPlay
            accentColor="#FF3B3B"
            style={{ width: '100%', display: 'block' }}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center space-y-6">
              {/* Top bar nav inside player fallback */}
              <div className="flex gap-2 justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-[#FF3B3B]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }} />
                ))}
              </div>
              <p className="font-inter text-[#999999] text-sm tracking-[2px] uppercase text-[11px]">Stream starting…</p>
            </div>
          </div>
        )}
      </div>

      {/* Right: data panel — 30% on desktop */}
      <div className="lg:w-[30%] bg-[#1A1A1A] border-t lg:border-t-0 border-l-0 lg:border-l border-[#333333] flex flex-col">

        {/* Nav bar */}
        <div className="px-5 h-12 border-b border-[#2A2A2A] flex items-center">
          <Link href="/dashboard" className="text-[#999999] hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </Link>
        </div>

        {/* Section 1: LIVE badge + title */}
        <div className="px-5 py-5 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-[#FF3B3B] px-2 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="font-inter text-white text-[11px] tracking-[4px] uppercase font-medium">Live</span>
            </span>
          </div>
          <h1 className="font-bebas text-[28px] text-white tracking-[1px] leading-tight">{session.title}</h1>
        </div>

        {/* Section 2: live indicator */}
        <div className="px-5 py-5 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF3B3B] animate-pulse" />
            <span className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Streaming live</span>
          </div>
        </div>

        {/* Section 3: coach + gym */}
        <div className="px-5 py-5 border-b border-[#2A2A2A]">
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Coach</p>
          <p className="font-bebas text-[18px] text-white tracking-[1px]">{session.coaches?.name ?? 'Coach'}</p>
          {session.gyms?.name && (
            <p className="font-inter text-[11px] text-[#999999] mt-0.5">{session.gyms.name}</p>
          )}
        </div>

        {/* Section 4: elapsed time */}
        <div className="px-5 py-5 border-b border-[#2A2A2A]">
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Elapsed</p>
          <div className="font-bebas text-[40px] text-white tracking-[1px] tabular-nums leading-none">
            {pad(Math.floor(elapsed / 3600) > 0 ? Math.floor(elapsed / 3600) : Math.floor(elapsed / 60))}:{pad(Math.floor(elapsed / 3600) > 0 ? Math.floor((elapsed % 3600) / 60) : elapsed % 60)}
          </div>
        </div>

        {/* Section 5: AI Coach teaser */}
        <div className="px-5 py-5 flex-1">
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">AI Coach</p>
          <div className="space-y-2 mb-5">
            {[
              { icon: <BookOpen size={12} />, label: 'Summary + timestamps', free: true },
              { icon: <Sparkles size={12} />, label: 'Quiz this class', free: false },
              { icon: <Layers size={12} />, label: 'Flashcards', free: false },
              { icon: <MessageCircle size={12} />, label: 'Ask your coach', free: false },
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-3 px-3 py-2 rounded-sm ${item.free ? 'opacity-100' : 'opacity-40'}`}>
                <span className={item.free ? 'text-[#00D4AA]' : 'text-[#555555]'}>{item.icon}</span>
                <span className="font-inter text-sm text-white flex-1">{item.label}</span>
                {item.free
                  ? <span className="font-inter text-[10px] text-[#00D4AA] tracking-[2px] uppercase">Free</span>
                  : <Lock size={10} className="text-[#FF3B3B]" />}
              </div>
            ))}
          </div>
          <p className="font-inter text-[#555555] text-xs leading-relaxed">
            AI Coach analyses this class after it ends. Summary + timestamps are free. Quiz, flashcards and chat unlock with AI Coach.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Post-class summary ───────────────────────────────────────────────────────
const POST_MESSAGES = ['Reviewing today\'s class…', 'Identifying techniques…', 'Finding key moments…']

function PostViewer() {
  const [stage, setStage] = useState<'instant' | 'processing' | 'ready'>('instant')
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage('processing'), 1200)
    const t2 = setTimeout(() => setStage('ready'), 11000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (stage !== 'processing') return
    const t = setInterval(() => setMsgIdx(i => (i + 1) % POST_MESSAGES.length), 3000)
    return () => clearInterval(t)
  }, [stage])

  return (
    <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0D0D0D] px-4 py-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-2"
        >
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Session complete</p>
          <h1 className="font-bebas text-5xl text-white tracking-[1px]">Stream Ended</h1>
          <p className="font-inter text-[#999999] text-sm">Class has ended.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {stage === 'processing' && (
            <motion.div key="proc" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-8 flex flex-col items-center gap-5">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-[#FF3B3B]"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }} />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={msgIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} className="font-inter text-[#999999] text-sm">
                  {POST_MESSAGES[msgIdx]}
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
            <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
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

// ─── Main ─────────────────────────────────────────────────────────────────────
type Phase = 'waiting' | 'live' | 'post'

interface Props {
  session: SessionInfo
  initialPhase: Phase
  initialPlaybackId: string | null
}

export default function WatchClient({ session, initialPhase, initialPlaybackId }: Props) {
  const [phase, setPhase] = useState<Phase>(initialPhase)
  const [playbackId, setPlaybackId] = useState<string | null>(initialPlaybackId)

  // When the waiting room calls router.refresh() after the gym goes live, the
  // server component re-renders with new props. useState ignores prop changes,
  // so sync them here — otherwise the page is stuck on "waiting" forever.
  useEffect(() => { setPhase(initialPhase) }, [initialPhase])
  useEffect(() => {
    if (initialPlaybackId) setPlaybackId(initialPlaybackId)
  }, [initialPlaybackId])

  return (
    <div className="min-h-screen bg-[#0D0D0D] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <WaitingRoom key="waiting" session={session} onGoLive={() => setPhase('live')} />
        )}
        {phase === 'live' && (
          <LiveViewer key="live" playbackId={playbackId} sessionId={session.id} session={session} onEnded={() => setPhase('post')} />
        )}
        {phase === 'post' && (
          <PostViewer key="post" />
        )}
      </AnimatePresence>
    </div>
  )
}
