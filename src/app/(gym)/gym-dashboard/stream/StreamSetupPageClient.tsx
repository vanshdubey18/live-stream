'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Loader2, Radio, Wifi, WifiOff, AlertCircle, Camera, CameraOff } from 'lucide-react'

type StreamStatus = 'loading' | 'idle' | 'active' | 'disconnected'

interface Props {
  gymId: string
  hasCfStream: boolean
}

export default function StreamSetupPageClient({ gymId, hasCfStream: initialHasCfStream }: Props) {
  const [status, setStatus] = useState<StreamStatus>('loading')
  const [provisioning, setProvisioning] = useState(!initialHasCfStream)
  const [provisionError, setProvisionError] = useState<string | null>(null)
  const [goingLive, setGoingLive] = useState(false)
  const [endingStream, setEndingStream] = useState(false)
  const [goLiveError, setGoLiveError] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Provision Cloudflare live input on first visit
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

  // Poll stream status
  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
      if (!res.ok) return
      const data = await res.json()
      // If we have an active local RTCPeerConnection, trust it — don't let a
      // slow Cloudflare status response flip us back to idle mid-stream.
      if (pcRef.current) return
      setStatus((data.status ?? 'idle') as StreamStatus)
      if (!data.has_stream) provision()
    } catch { /* ignore */ }
  }, [gymId, provision])

  useEffect(() => {
    pollStatus()
    const t = setInterval(pollStatus, 30_000)
    return () => clearInterval(t)
  }, [pollStatus])

  // Attach local stream to video element only when going live
  useEffect(() => {
    if (isLive && videoRef.current && localStreamRef.current) {
      if (videoRef.current.srcObject !== localStreamRef.current) {
        videoRef.current.srcObject = localStreamRef.current
      }
    }
  }, [isLive])

  function startElapsedTimer() {
    setElapsed(0)
    elapsedRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
  }

  function stopElapsedTimer() {
    if (elapsedRef.current) clearInterval(elapsedRef.current)
    elapsedRef.current = null
    setElapsed(0)
  }

  function pad(n: number) { return String(n).padStart(2, '0') }

  async function handleGoLive() {
    setGoingLive(true)
    setGoLiveError(null)
    try {
      // 1. Get camera + mic
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream

      // 2. Setup RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
      })
      pcRef.current = pc

      // 3. Add tracks as sendonly
      for (const track of stream.getTracks()) {
        pc.addTransceiver(track, { direction: 'sendonly' })
      }

      // 4. Create + set local offer
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 5. Wait for ICE gathering (or 5s timeout)
      await Promise.race([
        new Promise<void>(resolve => {
          if (pc.iceGatheringState === 'complete') { resolve(); return }
          pc.addEventListener('icegatheringstatechange', () => {
            if (pc.iceGatheringState === 'complete') resolve()
          })
        }),
        new Promise<void>(resolve => setTimeout(resolve, 5000)),
      ])

      // 6. Send SDP to our WHIP proxy
      const whipRes = await fetch('/api/gym/cf-whip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/sdp' },
        body: pc.localDescription!.sdp,
      })

      if (!whipRes.ok) {
        const errText = await whipRes.text().catch(() => '')
        let msg = `WHIP error (${whipRes.status})`
        try { const j = JSON.parse(errText); msg = j.error ?? msg } catch { /* raw text */ }
        throw new Error(msg)
      }

      // 7. Set remote description (SDP answer from Cloudflare)
      const sdpAnswer = await whipRes.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: sdpAnswer })

      // 8. Notify server — creates session record
      await fetch('/api/gym/go-live', { method: 'POST' })

      setStatus('active')
      startElapsedTimer()
    } catch (err) {
      console.error('[GoLive]', err)
      // Cleanup on failure
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
      pcRef.current?.close()
      pcRef.current = null
      setGoLiveError(err instanceof Error ? err.message : 'Failed to start stream')
    } finally {
      setGoingLive(false)
    }
  }

  async function handleEndStream() {
    setEndingStream(true)
    try {
      // Stop tracks + close connection
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
      pcRef.current?.close()
      pcRef.current = null
      stopElapsedTimer()

      await fetch('/api/gym/end-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gym_id: gymId }),
      })
      setStatus('idle')
    } catch { /* poll will correct */ } finally {
      setEndingStream(false)
    }
  }

  const isLive = status === 'active'
  const isLoading = status === 'loading' || provisioning

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
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border ${
            isLive ? 'border-[#FF3B3B]/30 bg-[#FF3B3B]/10' :
            isLoading ? 'border-[#333333] bg-[#1A1A1A]' :
            status === 'disconnected' ? 'border-[#FFD60A]/30 bg-[#FFD60A]/10' :
            'border-[#333333] bg-[#1A1A1A]'
          }`}>
            {isLoading
              ? <Loader2 size={12} className="animate-spin text-[#555555]" />
              : isLive
              ? <Radio size={12} className="text-[#FF3B3B] live-pulse" />
              : status === 'disconnected'
              ? <WifiOff size={12} className="text-[#FFD60A]" />
              : <Wifi size={12} className="text-[#555555]" />
            }
            <span className={`font-bebas tracking-[2px] text-sm ${
              isLive ? 'text-[#FF3B3B]' :
              isLoading ? 'text-[#555555]' :
              status === 'disconnected' ? 'text-[#FFD60A]' :
              'text-[#555555]'
            }`}>
              {isLoading ? 'CHECKING…' : isLive ? 'LIVE NOW' : status === 'disconnected' ? 'RECONNECTING' : 'OFFLINE'}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 max-w-xl space-y-4">

          {/* Provisioning state */}
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
              <button onClick={provision} className="font-inter text-xs text-[#999999] hover:text-white underline">
                Retry
              </button>
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
              <button onClick={() => setGoLiveError(null)} className="font-inter text-xs text-[#999999] hover:text-white underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Camera preview card — shown when streaming */}
          {isLive && (
            <div className="bg-[#111111] border border-[#333333] rounded-sm overflow-hidden">
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* LIVE badge overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#FF3B3B] px-2 py-1 rounded-sm">
                  <Radio size={10} className="text-white live-pulse" />
                  <span className="font-bebas text-white text-xs tracking-[2px]">LIVE</span>
                </div>
                {/* Elapsed time */}
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-sm">
                  <span className="font-bebas text-white text-sm tracking-[1px] tabular-nums">
                    {pad(Math.floor(elapsed / 3600) > 0 ? Math.floor(elapsed / 3600) : Math.floor(elapsed / 60))}
                    :{pad(Math.floor(elapsed / 3600) > 0 ? Math.floor((elapsed % 3600) / 60) : elapsed % 60)}
                  </span>
                </div>
                {/* No camera fallback */}
                {!localStreamRef.current && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CameraOff size={32} className="text-[#333333]" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Primary action button */}
          {!provisioning && !provisionError && (
            isLive ? (
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
                disabled={goingLive || isLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#FF3B3B] hover:bg-[#e03030] text-white font-bebas tracking-[3px] text-lg py-4 rounded-sm transition-all disabled:opacity-60"
              >
                {goingLive
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Camera size={16} />
                }
                {goingLive ? 'CONNECTING…' : 'GO LIVE'}
              </button>
            )
          )}

          {/* Info text */}
          {!isLive && !provisioning && !provisionError && (
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
