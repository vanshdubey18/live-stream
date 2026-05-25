'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, Volume2, Maximize, Settings } from 'lucide-react'
import Link from 'next/link'
import MuxPlayer from '@mux/mux-player-react'
import SessionSummary, { DEMO_SUMMARY } from '@/components/ai/SessionSummary'

const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
}

export default function ReplayClient({ playbackId }: { playbackId?: string }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0.28) // 28% into video (mock only)
  const [jumpTo, setJumpTo] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null)

  function handleTimestamp(ts: string) {
    const [m, s] = ts.split(':').map(Number)
    const seekSeconds = m * 60 + s
    if (playbackId && playerRef.current) {
      playerRef.current.currentTime = seekSeconds
    } else {
      // Update mock scrubber
      const totalSeconds = 58 * 60
      setProgress(seekSeconds / totalSeconds)
    }
    setJumpTo(ts)
    setPlaying(true)
    setTimeout(() => setJumpTo(null), 2000)
  }

  const session = DEMO_SUMMARY

  return (
    <div className="min-h-screen bg-[#0D0D0D]">

      {/* Top nav */}
      <div className="sticky top-0 z-20 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#333333] h-14 flex items-center px-6 gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#999999] hover:text-white text-sm transition-colors">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="h-4 w-px bg-[#333333]" />
        <h1 className="text-white font-bold text-sm truncate">{session.title}</h1>
        <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${DISCIPLINE_COLORS[session.discipline] ?? 'bg-white/5 text-white/60'}`}>
          {session.discipline}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 flex flex-col lg:flex-row gap-6">

        {/* ── Left: Video player ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Video area */}
          <div className="relative bg-black rounded-2xl overflow-hidden">
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
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-bold z-10"
                  >
                    ▶ Jumped to {jumpTo}
                  </motion.div>
                )}
              </>
            ) : (
              /* Mock video fallback */
              <div className="aspect-video">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #0D0D0D 0%, #1a0505 30%, #050a0a 70%, #0D0D0D 100%)',
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                    <span className="text-white text-6xl font-black tracking-tighter">MATPEAK</span>
                  </div>

                  {jumpTo && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 text-white text-sm font-bold"
                    >
                      ▶ Jumped to {jumpTo}
                    </motion.div>
                  )}

                  <button
                    onClick={() => setPlaying(v => !v)}
                    className="absolute inset-0 flex items-center justify-center group"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all">
                      {playing
                        ? <Pause size={24} className="text-white" />
                        : <Play size={24} className="text-white ml-1" />}
                    </div>
                  </button>
                </div>

                {/* Mock controls bar */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
                  <div className="relative h-1 bg-white/20 rounded-full mb-3 cursor-pointer group"
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setProgress((e.clientX - rect.left) / rect.width)
                    }}>
                    <div className="h-full bg-[#FF3B3B] rounded-full transition-all" style={{ width: `${progress * 100}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${progress * 100}% - 6px)` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPlaying(v => !v)} className="text-white hover:text-[#FF3B3B] transition-colors">
                        {playing ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button className="text-white/60 hover:text-white transition-colors">
                        <Volume2 size={16} />
                      </button>
                      <span className="text-white/60 text-xs tabular-nums">
                        {String(Math.floor(progress * 58)).padStart(2, '0')}:{String(Math.floor((progress * 58 * 60) % 60)).padStart(2, '0')} / 58:00
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-white/60 hover:text-white transition-colors">
                        <Settings size={15} />
                      </button>
                      <button className="text-white/60 hover:text-white transition-colors">
                        <Maximize size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Session meta below player */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#1A1A1A] border border-[#333333] rounded-2xl px-6 py-5"
          >
            <h2 className="text-white font-black text-xl mb-1">{session.title}</h2>
            <p className="text-[#999999] text-sm">{session.coach} · {session.gym} · {session.duration}</p>
          </motion.div>

          {/* Mobile: summary below video */}
          <div className="lg:hidden">
            <SessionSummary data={session} onTimestampClick={handleTimestamp} />
          </div>
        </div>

        {/* ── Right: Summary sidebar (desktop only) ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:block w-96 shrink-0"
        >
          <div className="sticky top-20">
            <SessionSummary data={session} onTimestampClick={handleTimestamp} />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
