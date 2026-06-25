'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Loader2, Radio, Wifi, WifiOff, AlertCircle, Camera } from 'lucide-react'

interface Props {
  gymId: string
  hasCfStream: boolean
}

type ConnState = 'idle' | 'connecting' | 'live' | 'reconnecting'

function pad(n: number) { return String(n).padStart(2, '0') }

export default function StreamSetupPageClient({ gymId, hasCfStream: initialHasCfStream }: Props) {
  // ── State ───────────────────────────────────────────────────────────────────
  // `conn` is the SINGLE source of truth for the live UI, driven by the local
  // RTCPeerConnection — never by the server poll.
  const [conn, setConn] = useState<ConnState>('idle')
  const [provisioning, setProvisioning] = useState(!initialHasCfStream)
  const [provisionError, setProvisionError] = useState<string | null>(null)
  const [goLiveError, setGoLiveError] = useState<string | null>(null)
  const [endingStream, setEndingStream] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  // Mirror of `conn` readable from inside stable callbacks without stale closures.
  const connRef = useRef<ConnState>('idle')
  connRef.current = conn

  const isLive = conn === 'live'
  const isConnecting = conn === 'connecting'
  const isReconnecting = conn === 'reconnecting'
  const broadcasting = conn !== 'idle' // any non-idle state means we hold a pc

  // ── Provisioning ──────────────────────────────────────────────────────────────
  const provision = useCallback(async () => {
    setProvisioning(true)
    setProvisionError(null)
    try {
      const res = await fetch('/api/gym/create-stream', { method: 'POST' })
      const data = await res.json()
      if (data.error) setProvisionError(data.error)
    } catch {
      setProvisionError('Network error — could not reach the server')
    } finally {
      setProvisioning(false)
    }
  }, [])

  // ── Status poll — ONLY runs when we are not broadcasting ───────────────────────
  const pollStatus = useCallback(async () => {
    // Local connection is the source of truth while broadcasting.
    if (connRef.current !== 'idle') return
    try {
      const res = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
      if (!res.ok) return
      const data = await res.json()
      if (!data.has_stream) provision()
    } catch { /* ignore */ }
  }, [gymId, provision])

  useEffect(() => {
    pollStatus()
    const t = setInterval(pollStatus, 30_000)
    return () => clearInterval(t)
  }, [pollStatus])

  // ── Elapsed timer — driven purely off live state ───────────────────────────────
  useEffect(() => {
    if (conn !== 'live') return
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [conn])

  // ── Teardown helper ────────────────────────────────────────────────────────────
  const teardown = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
    if (pcRef.current) {
      pcRef.current.onconnectionstatechange = null
      pcRef.current.close()
      pcRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  // Clean up on unmount.
  useEffect(() => () => teardown(), [teardown])

  // ── GO LIVE ─────────────────────────────────────────────────────────────────────
  async function handleGoLive() {
    setGoLiveError(null)
    setConn('connecting')
    try {
      // 1. Camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      // Attach to the always-mounted <video> immediately. Set ONCE — never blinks.
      if (videoRef.current) videoRef.current.srcObject = stream

      // 2. Peer connection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
      })
      pcRef.current = pc

      // 3. Connection-state monitoring — drives the live UI.
      pc.onconnectionstatechange = () => {
        if (pcRef.current !== pc) return // stale
        switch (pc.connectionState) {
          case 'connected':
            setConn('live')
            setGoLiveError(null)
            // Poll Cloudflare via stream-status until it confirms the stream is
            // distributable (status: 'active'), then create the Supabase session.
            // This prevents members from seeing a live session before Cloudflare
            // has registered the broadcaster — which causes WHEP 409 errors.
            ;(async () => {
              for (let i = 0; i < 10; i++) {
                try {
                  const r = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
                  const d = await r.json()
                  if (d.status === 'active') break
                } catch { /* ignore network errors, keep polling */ }
                await new Promise<void>(res => setTimeout(res, 2000))
              }
              fetch('/api/gym/go-live', { method: 'POST' }).catch(console.error)
            })()
            break
          case 'disconnected':
            // Transient — WebRTC often self-heals. Show reconnecting, don't tear down.
            setConn('reconnecting')
            break
          case 'failed':
            // Try a single ICE restart before giving up.
            try { pc.restartIce() } catch { /* ignore */ }
            setConn('reconnecting')
            break
          case 'closed':
            setConn('idle')
            break
        }
      }

      // 4. Send tracks
      for (const track of stream.getTracks()) {
        pc.addTransceiver(track, { direction: 'sendonly' })
      }

      // 5. Offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 6. Wait for ICE gathering (non-trickle WHIP) — cap at 5s
      await Promise.race([
        new Promise<void>(resolve => {
          if (pc.iceGatheringState === 'complete') return resolve()
          pc.addEventListener('icegatheringstatechange', () => {
            if (pc.iceGatheringState === 'complete') resolve()
          })
        }),
        new Promise<void>(resolve => setTimeout(resolve, 5000)),
      ])

      // 7. WHIP exchange via our proxy
      const whipRes = await fetch('/api/gym/cf-whip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription!.sdp,
      })
      if (!whipRes.ok) {
        const errText = await whipRes.text().catch(() => '')
        let msg = `WHIP error (${whipRes.status})`
        try { const j = JSON.parse(errText); msg = j.error ?? msg } catch { /* raw */ }
        throw new Error(msg)
      }
      const sdpAnswer = await whipRes.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: sdpAnswer })

      // ICE negotiation continues in the background; onconnectionstatechange
      // fires 'connected' once video is flowing — that's when we create the session.
      // Fallback: if already connected by now, set it directly.
      if (pc.connectionState === 'connected') setConn('live')
    } catch (err) {
      console.error('[GoLive]', err)
      teardown()
      setConn('idle')
      setGoLiveError(err instanceof Error ? err.message : 'Failed to start stream')
    }
  }

  // ── END STREAM ───────────────────────────────────────────────────────────────────
  async function handleEndStream() {
    setEndingStream(true)
    teardown()
    setConn('idle')
    setElapsed(0)
    try {
      await fetch('/api/gym/end-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: gymId }),
      })
    } catch { /* best effort */ } finally {
      setEndingStream(false)
    }
  }

  // ── Badge styling ─────────────────────────────────────────────────────────────────
  const badge = isLive
    ? { border: 'border-[#FF3B3B]/30 bg-[#FF3B3B]/10', text: 'text-[#FF3B3B]', label: 'LIVE NOW', icon: <Radio size={12} className="text-[#FF3B3B] live-pulse" /> }
    : isReconnecting
    ? { border: 'border-[#FFD60A]/30 bg-[#FFD60A]/10', text: 'text-[#FFD60A]', label: 'RECONNECTING', icon: <WifiOff size={12} className="text-[#FFD60A]" /> }
    : isConnecting || provisioning
    ? { border: 'border-[#333333] bg-[#1A1A1A]', text: 'text-[#555555]', label: isConnecting ? 'CONNECTING…' : 'CHECKING…', icon: <Loader2 size={12} className="animate-spin text-[#555555]" /> }
    : { border: 'border-[#333333] bg-[#1A1A1A]', text: 'text-[#555555]', label: 'OFFLINE', icon: <Wifi size={12} className="text-[#555555]" /> }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Stream Setup" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Header bar */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#222222] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-bebas text-xl text-white tracking-[1px] leading-tight">Go Live</h1>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border ${badge.border}`}>
            {badge.icon}
            <span className={`font-bebas tracking-[2px] text-sm ${badge.text}`}>{badge.label}</span>
          </div>
        </div>

        <div className="px-6 py-8 max-w-xl space-y-4">

          {/* Provisioning */}
          {provisioning && (
            <div className="flex items-center gap-3 bg-[#1A1A1A] border border-[#333333] rounded-sm px-5 py-4">
              <Loader2 size={14} className="animate-spin text-[#555555] shrink-0" />
              <span className="font-inter text-sm text-[#555555]">Setting up your stream…</span>
            </div>
          )}

          {/* Provision error */}
          {provisionError && (
            <div className="bg-[#1A1A1A] border border-[#FF3B3B]/30 rounded-sm px-5 py-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-[#FF3B3B] shrink-0" />
                <p className="font-inter text-xs text-[#FF3B3B]">Failed to set up stream</p>
              </div>
              <p className="font-mono text-xs text-[#555555] break-all">{provisionError}</p>
              <button onClick={provision} className="font-inter text-xs text-[#999999] hover:text-white underline">Retry</button>
            </div>
          )}

          {/* GO LIVE error */}
          {goLiveError && (
            <div className="bg-[#1A1A1A] border border-[#FF3B3B]/30 rounded-sm px-5 py-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-[#FF3B3B] shrink-0" />
                <p className="font-inter text-xs text-[#FF3B3B]">Could not start stream</p>
              </div>
              <p className="font-mono text-xs text-[#555555] break-all">{goLiveError}</p>
              <button onClick={() => setGoLiveError(null)} className="font-inter text-xs text-[#999999] hover:text-white underline">Dismiss</button>
            </div>
          )}

          {/* Camera preview — ALWAYS mounted; visibility toggled with CSS so the
              MediaStream is never dropped/re-acquired (no blinking). */}
          <div className={`bg-[#111111] border border-[#333333] rounded-sm overflow-hidden ${broadcasting ? '' : 'hidden'}`}>
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {/* LIVE badge overlay */}
              {isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#FF3B3B] px-2 py-1 rounded-sm">
                  <Radio size={10} className="text-white live-pulse" />
                  <span className="font-bebas text-white text-xs tracking-[2px]">LIVE</span>
                </div>
              )}
              {/* Connecting / reconnecting overlay */}
              {(isConnecting || isReconnecting) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-white" />
                    <span className="font-bebas text-white text-sm tracking-[2px]">
                      {isReconnecting ? 'RECONNECTING…' : 'CONNECTING…'}
                    </span>
                  </div>
                </div>
              )}
              {/* Elapsed time */}
              {isLive && (
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-sm">
                  <span className="font-bebas text-white text-sm tracking-[1px] tabular-nums">
                    {pad(Math.floor(elapsed / 3600) > 0 ? Math.floor(elapsed / 3600) : Math.floor(elapsed / 60))}
                    :{pad(Math.floor(elapsed / 3600) > 0 ? Math.floor((elapsed % 3600) / 60) : elapsed % 60)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Primary action */}
          {!provisioning && !provisionError && (
            broadcasting ? (
              <button
                onClick={handleEndStream}
                disabled={endingStream}
                className="w-full flex items-center justify-center gap-3 bg-[#FF3B3B]/10 border border-[#FF3B3B]/40 hover:bg-[#FF3B3B]/20 text-[#FF3B3B] font-bebas tracking-[3px] text-lg py-4 rounded-sm transition-all disabled:opacity-50"
              >
                {endingStream ? <Loader2 size={16} className="animate-spin" /> : <Radio size={16} className="live-pulse" />}
                {endingStream ? 'ENDING…' : 'END STREAM'}
              </button>
            ) : (
              <button
                onClick={handleGoLive}
                className="w-full flex items-center justify-center gap-3 bg-[#FF3B3B] hover:bg-[#e03030] text-white font-bebas tracking-[3px] text-lg py-4 rounded-sm transition-all disabled:opacity-60"
              >
                <Camera size={16} />
                GO LIVE
              </button>
            )
          )}

          {/* Info text */}
          {!broadcasting && !provisioning && !provisionError && (
            <p className="font-inter text-xs text-[#444444] px-1">
              Click GO LIVE — your browser will ask for camera and microphone access, then start streaming instantly.
              Members will be notified and can join right away.
            </p>
          )}

        </div>
      </main>
    </div>
  )
}
