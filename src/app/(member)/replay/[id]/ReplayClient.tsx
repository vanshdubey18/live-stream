'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, Volume2, Maximize, Settings } from 'lucide-react'
import Link from 'next/link'
import MuxPlayer from '@mux/mux-player-react'
import SessionSummary, { DEMO_SUMMARY } from '@/components/ai/SessionSummary'

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
      <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] h-12 flex items-center px-6 gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#999999] hover:text-white font-inter text-sm transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <div className="h-4 w-px bg-[#333333]" />
        <h1 className="font-bebas text-[18px] text-white tracking-[1px] truncate">{session.title}</h1>
        <span className="ml-auto font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Replay</span>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">

        {/* ── Left: Video player — 70% ── */}
        <div className="flex-1 lg:w-[70%] min-w-0">

          {/* Video area */}
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
              /* Mock video fallback */
              <div className="aspect-video relative bg-black">
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

                <button
                  onClick={() => setPlaying(v => !v)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-14 h-14 bg-[#1A1A1A] border border-[#333333] rounded-sm flex items-center justify-center transition-colors group-hover:border-[#555555]">
                    {playing
                      ? <Pause size={20} className="text-white" />
                      : <Play size={20} className="text-white ml-0.5" />}
                  </div>
                </button>

                {/* Progress bar + controls */}
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                  {/* 1px progress bar */}
                  <div className="relative h-px bg-[#333333] mb-3 cursor-pointer group"
                    onClick={e => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setProgress((e.clientX - rect.left) / rect.width)
                    }}>
                    <div className="h-full bg-[#FF3B3B] transition-all" style={{ width: `${progress * 100}%` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${progress * 100}% - 4px)` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPlaying(v => !v)} className="text-white hover:text-[#FF3B3B] transition-colors">
                        {playing ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button className="text-[#999999] hover:text-white transition-colors">
                        <Volume2 size={14} />
                      </button>
                      <span className="font-inter text-[#999999] text-xs tabular-nums">
                        {String(Math.floor(progress * 58)).padStart(2, '0')}:{String(Math.floor((progress * 58 * 60) % 60)).padStart(2, '0')} / 58:00
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-[#999999] hover:text-white transition-colors">
                        <Settings size={14} />
                      </button>
                      <button className="text-[#999999] hover:text-white transition-colors">
                        <Maximize size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress tracking below player */}
          <div className="border-b border-[#2A2A2A] px-5 py-3 flex items-center gap-3">
            <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase shrink-0">Watched</span>
            <div className="flex-1 h-px bg-[#333333] relative">
              <div className="h-full bg-white transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <span className="font-bebas text-[18px] text-white tracking-[1px] shrink-0 tabular-nums">
              {Math.round(progress * 100)}%
            </span>
          </div>

          {/* Session meta below player — mobile only shows here */}
          <div className="lg:hidden border-b border-[#2A2A2A] px-5 py-5">
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">Class Info</p>
            <h2 className="font-bebas text-[28px] text-white tracking-[1px] mb-1">{session.title}</h2>
            <p className="font-inter text-[#999999] text-xs">{session.coach} · {session.gym} · {session.duration}</p>
          </div>

          {/* Mobile: AI summary below video */}
          <div className="lg:hidden px-4 py-6">
            <ReplaySidebar session={session} onTimestampClick={handleTimestamp} />
          </div>
        </div>

        {/* ── Right: Info + AI summary sidebar — 30% desktop ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:flex lg:w-[30%] shrink-0 flex-col bg-[#1A1A1A] border-l border-[#333333] min-h-screen"
        >
          <div className="sticky top-12 flex flex-col">
            {/* Section: class info */}
            <div className="px-5 py-5 border-b border-[#2A2A2A]">
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">Class Info</p>
              <h2 className="font-bebas text-[28px] text-white tracking-[1px] leading-tight mb-2">{session.title}</h2>
              <p className="font-inter text-[#999999] text-xs">{session.coach}</p>
              {session.gym && <p className="font-inter text-[#999999] text-xs">{session.gym}</p>}
            </div>

            {/* Section: duration */}
            <div className="px-5 py-5 border-b border-[#2A2A2A]">
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Duration</p>
              <p className="font-bebas text-[28px] text-white tracking-[1px]">{session.duration}</p>
            </div>

            {/* Section: AI summary */}
            <div className="px-5 py-5 overflow-y-auto">
              <ReplaySidebar session={session} onTimestampClick={handleTimestamp} />
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

// ─── Sidebar AI notes component ───────────────────────────────────────────────
function ReplaySidebar({
  session,
  onTimestampClick,
}: {
  session: typeof DEMO_SUMMARY
  onTimestampClick: (ts: string) => void
}) {
  return (
    <div className="space-y-4">
      <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">AI Notes</p>

      {/* AI notes card */}
      <div className="border-l-4 border-[#FF3B3B] bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
        <div className="px-4 py-4">
          <SessionSummary data={session} onTimestampClick={onTimestampClick} />
        </div>
      </div>
    </div>
  )
}
