'use client'

import { useState, useRef, useCallback } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Video, Loader2, Square, Users, Copy, Check } from 'lucide-react'

type LiveState = 'idle' | 'preview' | 'connecting' | 'live' | 'ending'

interface Props {
  gymId: string
}

export default function StreamSetupPageClient({ gymId }: Props) {
  const [liveState, setLiveState] = useState<LiveState>('idle')
  const [className, setClassName] = useState('')
  const [duration, setDuration] = useState(0)
  const [viewerCount, setViewerCount] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [watchUrl, setWatchUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startPreview = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
        audio: true,
      })
      localStreamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setLiveState('preview')
    } catch {
      setError('Allow camera and microphone access to go live.')
    }
  }, [])

  async function goLive() {
    if (!localStreamRef.current) return
    setLiveState('connecting')
    setError(null)

    try {
      // Create the live session record first
      const title = className.trim() ||
        `Live Class — ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
      const res = await fetch('/api/gym/go-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to start class')
      setSessionId(data.sessionId)
      setWatchUrl(`${window.location.origin}/watch/${data.sessionId}`)

      // RTCPeerConnection — max-bundle required for WHIP
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        bundlePolicy: 'max-bundle',
      })
      pcRef.current = pc

      // Use sendonly transceivers (WHIP requires sendonly, not sendrecv)
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      const videoTx = pc.addTransceiver(videoTrack, { direction: 'sendonly' })
      pc.addTransceiver(audioTrack, { direction: 'sendonly' })

      // Prefer H.264 — Mux WHIP ingest requires H.264 + Opus
      const caps = RTCRtpSender.getCapabilities('video')
      if (caps) {
        const h264 = caps.codecs.filter(c => c.mimeType === 'video/H264')
        if (h264.length) videoTx.setCodecPreferences(h264)
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Wait for ICE gathering (max 5s) before sending — non-trickle mode
      await new Promise<void>(resolve => {
        if (pc.iceGatheringState === 'complete') { resolve(); return }
        const timeout = setTimeout(resolve, 5000)
        pc.addEventListener('icegatheringstatechange', () => {
          if (pc.iceGatheringState === 'complete') { clearTimeout(timeout); resolve() }
        })
      })

      // Proxy WHIP through our backend — avoids CORS, keeps stream_key server-side
      const whipRes = await fetch('/api/gym/whip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: pc.localDescription!.sdp }),
      })
      const whipData = await whipRes.json()
      if (!whipRes.ok) throw new Error(whipData.error ?? `Stream connection failed (${whipRes.status})`)

      await pc.setRemoteDescription({ type: 'answer', sdp: whipData.answer })

      setLiveState('live')

      let secs = 0
      timerRef.current = setInterval(() => setDuration(++secs), 1000)

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
          if (r.ok) {
            const d = await r.json()
            setViewerCount(d.viewer_count ?? 0)
          }
        } catch { /* ignore */ }
      }, 15_000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to go live')
      setLiveState('preview')
      if (sessionId) {
        await fetch('/api/gym/end-class', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(() => {})
      }
    }
  }

  async function endClass() {
    setLiveState('ending')

    if (timerRef.current) clearInterval(timerRef.current)
    if (pollRef.current) clearInterval(pollRef.current)

    if (pcRef.current) { pcRef.current.close(); pcRef.current = null }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }

    await fetch('/api/gym/end-class', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {})

    setLiveState('idle')
    setDuration(0)
    setViewerCount(0)
    setSessionId(null)
    setWatchUrl(null)
    setClassName('')
    if (videoRef.current) videoRef.current.srcObject = null
  }

  function copyLink() {
    if (!watchUrl) return
    navigator.clipboard.writeText(watchUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function fmt(secs: number) {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const isLive = liveState === 'live'

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Stream Setup" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#222222] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-bebas text-xl text-white tracking-[1px] leading-tight">Go Live</h1>
          </div>
          {isLive && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[#555555]">
                <Users size={13} />
                <span className="font-inter text-xs">{viewerCount} watching</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#FF3B3B]/40 bg-[#FF3B3B]/10">
                <div className="w-2 h-2 rounded-full bg-[#FF3B3B] live-pulse" />
                <span className="font-bebas tracking-[2px] text-sm text-[#FF3B3B]">LIVE · {fmt(duration)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-8 max-w-xl">

          {/* Camera / Video area */}
          <div className="relative bg-[#111111] border border-[#2A2A2A] rounded-sm overflow-hidden aspect-video mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${liveState === 'idle' ? 'hidden' : ''}`}
            />

            {liveState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                <span className="absolute inset-0 flex items-center justify-center font-bebas text-[100px] text-white/[0.03] leading-none select-none pointer-events-none">LIVE</span>
                <Video size={28} className="text-[#444444]" />
                <button
                  onClick={startPreview}
                  className="px-8 py-3 bg-[#FF3B3B] rounded-sm font-bebas text-white text-base tracking-[3px] hover:bg-[#cc2f2f] transition-colors"
                >
                  TURN ON CAMERA
                </button>
              </div>
            )}

            {/* LIVE badge overlay */}
            {isLive && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#FF3B3B] px-2.5 py-1 rounded-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="font-bebas text-white text-xs tracking-[2px]">LIVE</span>
              </div>
            )}
          </div>

          {/* Class name — only in preview */}
          {liveState === 'preview' && (
            <input
              value={className}
              onChange={e => setClassName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && goLive()}
              placeholder="Class name  (e.g. Intermediate BJJ)"
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-sm px-4 py-3 font-inter text-sm text-white placeholder-[#444444] focus:outline-none focus:border-[#555555] transition-colors mb-4"
            />
          )}

          {/* Error */}
          {error && (
            <p className="font-inter text-xs text-[#FF3B3B] mb-4 px-1">{error}</p>
          )}

          {/* Watch link — when live */}
          {isLive && watchUrl && (
            <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#333333] rounded-sm px-4 py-3 mb-4">
              <div className="flex-1 min-w-0">
                <p className="font-inter text-[10px] text-[#555555] tracking-[3px] uppercase mb-0.5">Share with members</p>
                <p className="font-inter text-xs text-[#999999] truncate">{watchUrl}</p>
              </div>
              <button
                onClick={copyLink}
                className={`shrink-0 flex items-center gap-1.5 font-inter text-xs px-3 py-2 rounded-sm border transition-colors ${
                  copied
                    ? 'border-[#00D4AA]/40 bg-[#00D4AA]/5 text-[#00D4AA]'
                    : 'border-[#333333] text-[#555555] hover:text-white hover:border-[#555555]'
                }`}
              >
                {copied ? <><Check size={11} /> COPIED</> : <><Copy size={11} /> COPY</>}
              </button>
            </div>
          )}

          {/* CTA button */}
          {liveState === 'preview' && (
            <button
              onClick={goLive}
              className="w-full py-5 bg-[#FF3B3B] rounded-sm font-bebas text-white text-2xl tracking-[4px] hover:bg-[#cc2f2f] transition-colors"
            >
              GO LIVE
            </button>
          )}

          {liveState === 'connecting' && (
            <div className="w-full py-5 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-sm flex items-center justify-center gap-3">
              <Loader2 size={18} className="animate-spin text-[#FF3B3B]" />
              <span className="font-bebas text-[#FF3B3B] text-xl tracking-[3px]">CONNECTING…</span>
            </div>
          )}

          {isLive && (
            <button
              onClick={endClass}
              className="w-full py-5 bg-[#1A1A1A] border border-[#FF3B3B]/30 rounded-sm font-bebas text-[#FF3B3B] text-2xl tracking-[4px] hover:bg-[#FF3B3B]/10 transition-colors flex items-center justify-center gap-3"
            >
              <Square size={18} fill="currentColor" />
              END CLASS
            </button>
          )}

          {liveState === 'ending' && (
            <div className="w-full py-5 bg-[#1A1A1A] border border-[#333333] rounded-sm flex items-center justify-center gap-3">
              <Loader2 size={18} className="animate-spin text-[#555555]" />
              <span className="font-bebas text-[#555555] text-xl tracking-[3px]">SAVING REPLAY…</span>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
