'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Circle, Lock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LiveChat from '@/components/live/LiveChat'

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
function WaitingRoom({ session }: { session: SessionInfo }) {
  const scheduledAt = new Date(session.scheduled_at)
  const getRemaining = () => Math.max(0, Math.floor((scheduledAt.getTime() - Date.now()) / 1000))
  const [seconds, setSeconds] = useState(getRemaining)
  const [checklist, setChecklist] = useState([false, false, false])
  const checkItems = ['Find your gear', 'Clear your space', 'Set up your mat']

  useEffect(() => {
    const t = setInterval(() => setSeconds(getRemaining()), 1000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const toggle = (i: number) => setChecklist(p => p.map((v, idx) => idx === i ? !v : v))

  return (
    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }} className="min-h-screen bg-[#141410] text-[#f0eadc] flex flex-col">
      <div className="px-6 pt-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#a29c8c] hover:text-[#f0eadc] font-mincho text-sm transition-colors">
          <ArrowLeft size={14} /> Dashboard
        </Link>
      </div>
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 text-center">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b3402f] animate-pulse" />
          <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Waiting for stream</span>
        </div>
        <h1 className="font-mincho text-5xl text-[#f0eadc] tracking-[1px] mb-2">{session.title}</h1>
        <p className="font-mincho text-[#a29c8c] text-sm mb-12">
          {session.coaches?.name ?? 'Coach'}{session.gyms?.name ? ` · ${session.gyms.name}` : ''}
        </p>
        <div className="flex flex-col items-center gap-3 mb-12">
          <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Starts in</span>
          <div className="font-mincho text-7xl text-[#f0eadc] tracking-[1px] tabular-nums">
            {pad(Math.floor(mins / 60) > 0 ? Math.floor(mins / 60) : mins)}
            <span className="text-[#322f26] mx-1">:</span>
            {pad(Math.floor(mins / 60) > 0 ? mins % 60 : secs)}
          </div>
          {seconds === 0 && <p className="font-mincho text-[#a29c8c] text-sm animate-pulse">Waiting for the gym to start…</p>}
        </div>
        <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4">
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
            className="flex-1 bg-[#1c1c16] border border-[#322f26] rounded-sm p-5 text-left">
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-4">Session</p>
            <div className="space-y-1 mb-4">
              <p className="font-mincho text-[#f0eadc] text-sm font-medium">{session.coaches?.name ?? 'Coach'}</p>
              <p className="font-mincho text-[#a29c8c] text-xs">{session.gyms?.name}</p>
            </div>
            <div className="border-t border-[#2a2a20] pt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b3402f] animate-pulse" />
              <span className="font-mincho text-[#a29c8c] text-xs">Waiting for stream to start</span>
            </div>
          </motion.div>
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
            className="sm:w-64 bg-[#1c1c16] border border-[#322f26] rounded-sm p-5 text-left flex flex-col gap-4">
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Get ready</p>
            <div className="space-y-3">
              {checkItems.map((item, i) => (
                <button key={item} onClick={() => toggle(i)} className="w-full flex items-center gap-3 text-left group">
                  {checklist[i]
                    ? <CheckCircle2 size={16} className="text-[#f0eadc] shrink-0" />
                    : <Circle size={16} className="text-[#444] shrink-0 group-hover:text-[#666] transition-colors" />}
                  <span className={`font-mincho text-sm transition-colors ${checklist[i] ? 'text-[#a29c8c] line-through' : 'text-[#aaa] group-hover:text-[#f0eadc]'}`}>{item}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── WHEP (WebRTC) live player ────────────────────────────────────────────────
function WhepPlayer({ playbackUrl, attempt, onRetry }: { playbackUrl: string | null; attempt: number; onRetry: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [connecting, setConnecting] = useState(true)
  const [timedOut, setTimedOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!playbackUrl) return
    const whepUrl = playbackUrl.replace('/manifest/video.m3u8', '/webRTC/play')
    let cancelled = false
    setConnecting(true)
    setTimedOut(false)
    setError(null)

    // After 30s still connecting, show a retry hint
    const timeoutTimer = setTimeout(() => { if (!cancelled) setTimedOut(true) }, 30_000)

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] })
    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })

    const stream = new MediaStream()
    const videoEl = videoRef.current
    if (videoEl) { videoEl.srcObject = stream; videoEl.muted = true }

    pc.ontrack = (e) => {
      if (cancelled) return
      stream.addTrack(e.track)
      const video = videoRef.current
      if (!video) return
      if (video.paused) video.play().catch(() => {})
      if (e.track.kind === 'video') { setConnecting(false); clearTimeout(timeoutTimer) }
    }
    pc.onconnectionstatechange = () => {
      if (cancelled) return
      if (pc.connectionState === 'failed') setError('Could not connect to the stream')
    }

    ;(async () => {
      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        await Promise.race([
          new Promise<void>(resolve => {
            if (pc.iceGatheringState === 'complete') return resolve()
            pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') resolve() })
          }),
          new Promise<void>(resolve => setTimeout(resolve, 3000)),
        ])
        let retriesLeft = 10
        while (true) {
          const res = await fetch(whepUrl, { method: 'POST', headers: { 'Content-Type': 'application/sdp' }, body: pc.localDescription!.sdp })
          if (res.ok) {
            const answer = await res.text()
            if (cancelled) return
            await pc.setRemoteDescription({ type: 'answer', sdp: answer })
            break
          }
          if (res.status === 409 && retriesLeft > 0) {
            retriesLeft--
            await new Promise<void>(r => setTimeout(r, 3000))
            if (cancelled) return
            continue
          }
          throw new Error(`Playback error (${res.status})`)
        }
      } catch (err) {
        if (!cancelled) { console.error('[WhepPlayer]', err); setError(err instanceof Error ? err.message : 'Playback failed') }
      }
    })()

    return () => { cancelled = true; clearTimeout(timeoutTimer); pc.close() }
  }, [playbackUrl, attempt])

  function unmute() {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.play().catch(() => {})
    setMuted(false)
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-center space-y-3 px-6">
          <p className="font-mincho text-[#b3402f] text-xs tracking-[2px] uppercase">Stream error</p>
          <p className="font-mincho text-[#7a7568] text-xs">{error}</p>
          <button onClick={onRetry} className="font-mincho text-xs text-[#a29c8c] hover:text-[#f0eadc] underline">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <video ref={videoRef} autoPlay muted controls playsInline className="w-full h-full object-contain" style={{ background: '#000' }} />
      {connecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <div className="text-center space-y-4">
            <div className="flex gap-2 justify-center">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-[#b3402f]"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }} />
              ))}
            </div>
            <p className="font-mincho text-[#a29c8c] text-[11px] tracking-[2px] uppercase">Connecting to stream…</p>
            {timedOut && (
              <button onClick={onRetry} className="pointer-events-auto font-mincho text-xs text-[#7a7568] hover:text-[#f0eadc] underline transition-colors">
                Taking longer than usual — tap to retry
              </button>
            )}
          </div>
        </div>
      )}
      {!connecting && muted && (
        <button onClick={unmute} className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 border border-[#f0eadc]/20 text-[#f0eadc] font-mincho text-xs px-3 py-1.5 rounded-sm transition-all">
          <span>🔇</span> TAP TO UNMUTE
        </button>
      )}
    </div>
  )
}

// ─── Live viewer ──────────────────────────────────────────────────────────────
function LiveViewer({ playbackId, sessionId, session, userId, userName }: {
  playbackId: string | null
  sessionId: string
  session: SessionInfo
  userId: string
  userName: string
}) {
  const getElapsedSecs = () => Math.max(0, Math.floor((Date.now() - new Date(session.scheduled_at).getTime()) / 1000))
  const [elapsed, setElapsed] = useState(getElapsedSecs)
  const [attempt, setAttempt] = useState(0)
  const [startedMinsAgo, setStartedMinsAgo] = useState(0)

  // Elapsed counts from the class's actual go-live time, not from when this
  // member's browser opened the page — a member joining late should see the
  // real elapsed time, not a timer that restarts at 0:00.
  useEffect(() => {
    const t = setInterval(() => setElapsed(getElapsedSecs()), 1000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.scheduled_at])

  // How many minutes ago the session started (updates every minute)
  useEffect(() => {
    const update = () => setStartedMinsAgo(Math.max(0, Math.floor((Date.now() - new Date(session.scheduled_at).getTime()) / 60000)))
    update()
    const t = setInterval(update, 60_000)
    return () => clearInterval(t)
  }, [session.scheduled_at])

  // Join Supabase Realtime Presence so the gym owner can see who's watching
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`session-${sessionId}`, { config: { presence: { key: userId } } })
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') await channel.track({ user_id: userId, name: userName, joined_at: Date.now() })
    })
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, userId, userName])

  return (
    <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#141410] flex flex-col lg:flex-row">
      {/* Video — 70% on desktop */}
      <div className="flex-1 lg:w-[70%] bg-black flex items-center min-h-[56vw] lg:min-h-screen">
        {playbackId ? (
          <WhepPlayer playbackUrl={playbackId} attempt={attempt} onRetry={() => setAttempt(a => a + 1)} />
        ) : (
          <div className="w-full aspect-video flex items-center justify-center">
            <div className="text-center space-y-6">
              <div className="flex gap-2 justify-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-[#b3402f]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }} />
                ))}
              </div>
              <p className="font-mincho text-[#a29c8c] text-[11px] tracking-[2px] uppercase">Stream starting…</p>
            </div>
          </div>
        )}
      </div>

      {/* Data panel — 30% on desktop */}
      <div className="lg:w-[30%] bg-[#1c1c16] border-t lg:border-t-0 lg:border-l border-[#322f26] flex flex-col">
        <div className="px-5 h-12 border-b border-[#2a2a20] flex items-center">
          <Link href="/dashboard" className="text-[#a29c8c] hover:text-[#f0eadc] transition-colors"><ArrowLeft size={16} /></Link>
        </div>

        <div className="px-5 py-5 border-b border-[#2a2a20]">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 bg-[#b3402f] px-2 py-0.5 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f0eadc] animate-pulse" />
              <span className="font-mincho text-[#f0eadc] text-[11px] tracking-[4px] uppercase font-medium">Live</span>
            </span>
          </div>
          <h1 className="font-mincho text-[28px] text-[#f0eadc] tracking-[1px] leading-tight">{session.title}</h1>
        </div>

        <div className="px-5 py-4 border-b border-[#2a2a20] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#b3402f] animate-pulse" />
            <span className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Streaming live</span>
          </div>
          <span className="font-mincho text-[11px] text-[#7a7568]">
            {startedMinsAgo === 0 ? 'Just started' : `Started ${startedMinsAgo}m ago`}
          </span>
        </div>

        <div className="px-5 py-5 border-b border-[#2a2a20]">
          <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-2">Coach</p>
          <p className="font-mincho text-[18px] text-[#f0eadc] tracking-[1px]">{session.coaches?.name ?? 'Coach'}</p>
          {session.gyms?.name && <p className="font-mincho text-[11px] text-[#a29c8c] mt-0.5">{session.gyms.name}</p>}
        </div>

        <div className="px-5 py-5 border-b border-[#2a2a20]">
          <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-2">Elapsed</p>
          <div className="font-mincho text-[40px] text-[#f0eadc] tracking-[1px] tabular-nums leading-none">
            {pad(Math.floor(elapsed / 3600) > 0 ? Math.floor(elapsed / 3600) : Math.floor(elapsed / 60))}:{pad(Math.floor(elapsed / 3600) > 0 ? Math.floor((elapsed % 3600) / 60) : elapsed % 60)}
          </div>
        </div>

        <div className="px-5 py-5 flex-1 min-h-0 flex flex-col">
          <LiveChat sessionId={sessionId} userId={userId} fill />
        </div>

        <div className="px-5 py-4 border-t border-[#2a2a20]">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">AI Coach</p>
            <Lock size={10} className="text-[#b3402f]" />
          </div>
          <p className="font-mincho text-[#7a7568] text-xs leading-relaxed">
            Summary + timestamps are free after class. Quiz, flashcards and chat unlock with AI Coach.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Post-class summary ───────────────────────────────────────────────────────
function PostViewer({ sessionId }: { sessionId: string }) {
  return (
    <motion.div key="post" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#141410] px-4 py-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center space-y-2">
          <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Session complete</p>
          <h1 className="font-mincho text-5xl text-[#f0eadc] tracking-[1px]">Stream Ended</h1>
          <p className="font-mincho text-[#a29c8c] text-sm">
            Your replay and AI summary are being processed. This can take a few minutes — check the replay page to see progress.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="w-full bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-8 flex flex-col items-center gap-5">
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-[#b3402f]"
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.9, delay: i * 0.25, repeat: Infinity }} />
            ))}
          </div>
          <p className="font-mincho text-[#a29c8c] text-sm">Processing your class…</p>
        </motion.div>
        <Link href={`/replay/${sessionId}`} className="font-mincho text-[#f0eadc] hover:text-[#e4dcc8] text-sm transition-colors underline underline-offset-4">
          View replay
        </Link>
        <Link href="/dashboard" className="font-mincho text-[#555] hover:text-[#a29c8c] text-sm transition-colors">Back to dashboard</Link>
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
  userId: string
  userName: string
}

export default function WatchClient({ session, initialPhase, initialPlaybackId, userId, userName }: Props) {
  const [phase, setPhase] = useState<Phase>(initialPhase)
  const [playbackId, setPlaybackId] = useState<string | null>(initialPlaybackId)
  // Ref to avoid stale closure in async Realtime handler
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => { setPhase(initialPhase) }, [initialPhase])
  useEffect(() => { if (initialPlaybackId) setPlaybackId(initialPlaybackId) }, [initialPlaybackId])

  // Supabase Realtime — instant live/ended detection for this session
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`watch-session-${session.id}`)
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${session.id}` },
      async (payload) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = payload.new as any
        if (s.status === 'live' && phaseRef.current !== 'live') {
          try {
            const res = await fetch(`/api/watch/session-status?session_id=${session.id}`)
            const data = await res.json()
            setPlaybackId(data.cf_hls_url ?? null)
          } catch { /* ignore — show connecting spinner */ }
          setPhase('live')
        } else if (s.status === 'ended' && phaseRef.current !== 'post') {
          setPhase('post')
        }
      }
    )
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [session.id])

  // Fallback poll — catches transitions if Realtime WebSocket drops or isn't
  // enabled on this table. Tight interval while live so "stream ended" is
  // caught within a few seconds instead of freezing on the last frame.
  useEffect(() => {
    if (phase === 'post') return
    const poll = async () => {
      try {
        const res = await fetch(`/api/watch/session-status?session_id=${session.id}`)
        const data = await res.json()
        if (data.status === 'live' && phaseRef.current !== 'live') {
          setPlaybackId(data.cf_hls_url ?? null)
          setPhase('live')
        } else if (data.status === 'ended' && phaseRef.current !== 'post') {
          setPhase('post')
        }
      } catch { /* ignore */ }
    }
    const t = setInterval(poll, phase === 'live' ? 3_000 : 30_000)
    return () => clearInterval(t)
  }, [session.id, phase])

  return (
    <div className="min-h-screen bg-[#141410] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {phase === 'waiting' && <WaitingRoom key="waiting" session={session} />}
        {phase === 'live' && (
          <LiveViewer key="live" playbackId={playbackId} sessionId={session.id} session={session}
            userId={userId} userName={userName} />
        )}
        {phase === 'post' && <PostViewer key="post" sessionId={session.id} />}
      </AnimatePresence>
    </div>
  )
}
