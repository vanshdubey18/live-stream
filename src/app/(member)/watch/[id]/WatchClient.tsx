'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react'
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
  const [watchers, setWatchers] = useState(12)
  const [checklist, setChecklist] = useState([false, false, false])
  const checkItems = ['Find your gear', 'Clear your space', 'Set up your mat']
  const router = useRouter()

  // Countdown
  useEffect(() => {
    const t = setInterval(() => setSeconds(getRemaining()), 1000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Watcher count creep
  useEffect(() => {
    const t = setInterval(() => setWatchers(w => w + 1), 20_000)
    return () => clearInterval(t)
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
      className="min-h-screen bg-[#050505] text-white flex flex-col"
    >
      {/* Back nav */}
      <div className="px-4 pt-5">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#888888] hover:text-white text-sm transition-colors">
          <ArrowLeft size={15} /> Dashboard
        </Link>
      </div>

      {/* Countdown */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <span className="text-[#888888] text-sm font-medium mb-3">⏱ Class starts in</span>
        <div className="text-7xl sm:text-8xl font-black tracking-tighter tabular-nums text-white">
          {pad(Math.floor(mins / 60) > 0 ? Math.floor(mins / 60) : mins)}
          <span className="text-[#DC2626] mx-1">:</span>
          {pad(Math.floor(mins / 60) > 0 ? mins % 60 : secs)}
        </div>
        {seconds === 0 && (
          <p className="text-[#888888] text-sm mt-3 animate-pulse">Waiting for the gym to start the stream…</p>
        )}
      </div>

      <div className="flex-1 px-4 pb-8 max-w-4xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        {/* Session card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#DC2626]/20 flex items-center justify-center shrink-0">
              <span className="text-[#DC2626] text-xl font-black">
                {(session.coaches?.name ?? 'C').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-bold">{session.coaches?.name ?? 'Coach'}</p>
              <p className="text-[#888888] text-xs mt-0.5">{session.gyms?.name}</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 mr-2">{session.discipline}</span>
            <span className="text-[#555] text-xs">{session.level}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">{session.title}</h1>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
            <span className="text-[#888888] text-sm">
              <span className="text-white font-bold">{watchers}</span> members getting ready
            </span>
          </div>
        </motion.div>

        {/* Checklist */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="lg:w-72 bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
        >
          <h2 className="text-white font-bold">Get Ready Checklist</h2>
          <div className="space-y-3">
            {checkItems.map((item, i) => (
              <button key={item} onClick={() => toggle(i)} className="w-full flex items-center gap-3 text-left group">
                {checklist[i]
                  ? <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                  : <Circle size={20} className="text-[#444] shrink-0 group-hover:text-[#666] transition-colors" />}
                <span className={`text-sm transition-colors ${checklist[i] ? 'text-green-400 line-through' : 'text-[#aaa] group-hover:text-white'}`}>
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
              Skip to stream
            </button>
            <p className="text-center text-[#444] text-xs mt-2">Dev shortcut</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Live viewer ──────────────────────────────────────────────────────────────
function LiveViewer({ playbackId, sessionId, onEnded }: { playbackId: string | null; sessionId: string; onEnded: () => void }) {
  const router = useRouter()

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
      className="min-h-screen bg-black flex flex-col"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 h-14 bg-black/80 backdrop-blur-sm border-b border-white/5">
        <Link href="/dashboard" className="text-[#888888] hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
          <span className="text-[#DC2626] text-xs font-bold">LIVE</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Player */}
      <div className="flex-1 flex items-center bg-black">
        {playbackId ? (
          <MuxPlayer
            streamType="live"
            playbackId={playbackId}
            autoPlay
            accentColor="#DC2626"
            style={{ width: '100%', display: 'block' }}
          />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="flex gap-2 justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }} />
                ))}
              </div>
              <p className="text-[#888888] text-sm">Stream starting…</p>
            </div>
          </div>
        )}
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
    <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#050505] px-4 py-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="text-center space-y-3">
          <div className="text-7xl">🥋</div>
          <h1 className="text-4xl font-black text-white tracking-tight">Great session!</h1>
          <p className="text-[#888888] text-base">Class has ended.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {stage === 'processing' && (
            <motion.div key="proc" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full bg-[#111] border border-[#1f1f1f] rounded-2xl px-6 py-8 flex flex-col items-center gap-5">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2.5 h-2.5 rounded-full bg-[#DC2626]"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }} />
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={msgIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }} className="text-[#888888] text-sm font-medium">
                  {POST_MESSAGES[msgIdx]}
                </motion.p>
              </AnimatePresence>
              <div className="w-full space-y-3 mt-2">
                {[80, 60, 90, 50, 70].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#1a1a1a] animate-pulse shrink-0" />
                    <div className="h-3 bg-[#1a1a1a] rounded-full animate-pulse" style={{ width: `${w}%` }} />
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
          <Link href="/dashboard" className="text-[#555] hover:text-[#888] text-sm transition-colors">
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
  const [playbackId] = useState<string | null>(initialPlaybackId)

  return (
    <div className="min-h-screen bg-[#050505] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {phase === 'waiting' && (
          <WaitingRoom key="waiting" session={session} onGoLive={() => setPhase('live')} />
        )}
        {phase === 'live' && (
          <LiveViewer key="live" playbackId={playbackId} sessionId={session.id} onEnded={() => setPhase('post')} />
        )}
        {phase === 'post' && (
          <PostViewer key="post" />
        )}
      </AnimatePresence>
    </div>
  )
}
