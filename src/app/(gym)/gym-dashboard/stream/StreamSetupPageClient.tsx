'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Loader2, Radio, Wifi, WifiOff, AlertCircle, Camera, Mic, Monitor, Users, SwitchCamera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  gymId: string
  hasCfStream: boolean
}

type ConnState = 'idle' | 'connecting' | 'live' | 'reconnecting'
type Health = 'good' | 'fair' | 'poor'
interface Viewer { user_id: string; name: string; joined_at: number }

function pad(n: number) { return String(n).padStart(2, '0') }

export default function StreamSetupPageClient({ gymId, hasCfStream: initialHasCfStream }: Props) {
  // ── State ─────────────────────────────────────────────────────────────────────
  const [conn, setConn] = useState<ConnState>('idle')
  const [provisioning, setProvisioning] = useState(!initialHasCfStream)
  const [provisionError, setProvisionError] = useState<string | null>(null)
  const [goLiveError, setGoLiveError] = useState<string | null>(null)
  const [endingStream, setEndingStream] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  // Device selection
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedVideoId, setSelectedVideoId] = useState('')
  const [selectedAudioId, setSelectedAudioId] = useState('')
  // Which way the (phone) camera faces. Default to the rear camera so gym owners
  // film the mat/class, not themselves. Overridden if a specific device is picked.
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  // Viewer tracking
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [viewers, setViewers] = useState<Viewer[]>([])

  // Stream health
  const [health, setHealth] = useState<Health | null>(null)
  const lastBytesRef = useRef(0)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const connRef = useRef<ConnState>('idle')
  connRef.current = conn

  const isLive = conn === 'live'
  const isConnecting = conn === 'connecting'
  const isReconnecting = conn === 'reconnecting'
  const broadcasting = conn !== 'idle'

  // ── Device enumeration ────────────────────────────────────────────────────────
  const enumerateDevices = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      setVideoDevices(all.filter(d => d.kind === 'videoinput'))
      setAudioDevices(all.filter(d => d.kind === 'audioinput'))
    } catch { /* no permission yet — labels populate after first getUserMedia */ }
  }, [])

  useEffect(() => { enumerateDevices() }, [enumerateDevices])

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

  // ── Status poll — only when idle ──────────────────────────────────────────────
  const pollStatus = useCallback(async () => {
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

  // ── Elapsed timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (conn !== 'live') return
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [conn])

  // ── Stream health (poll getStats every 3s while live) ─────────────────────────
  useEffect(() => {
    if (!isLive) { setHealth(null); lastBytesRef.current = 0; return }
    const t = setInterval(async () => {
      const pc = pcRef.current
      if (!pc) return
      try {
        const stats = await pc.getStats()
        stats.forEach(report => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const r = report as any
          if (r.type === 'outbound-rtp' && r.kind === 'video') {
            const bytes: number = r.bytesSent ?? 0
            const prev = lastBytesRef.current
            lastBytesRef.current = bytes
            if (prev === 0) return // skip first tick — no delta yet
            const kbps = ((bytes - prev) * 8) / 3000
            if (kbps > 400) setHealth('good')
            else if (kbps > 100) setHealth('fair')
            else setHealth('poor')
          }
        })
      } catch { /* ignore */ }
    }, 3000)
    return () => clearInterval(t)
  }, [isLive])

  // ── Viewer presence subscription ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeSessionId) return
    const supabase = createClient()
    const channel = supabase.channel(`session-${activeSessionId}`)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<Viewer>()
      setViewers(Object.values(state).flat())
    })
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [activeSessionId])

  // ── Teardown ──────────────────────────────────────────────────────────────────
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

  useEffect(() => () => teardown(), [teardown])

  // ── GO LIVE ───────────────────────────────────────────────────────────────────
  async function handleGoLive() {
    setGoLiveError(null)
    setConn('connecting')
    try {
      // 1. Camera + mic — a specific picked device wins; otherwise use the chosen
      //    facing direction (rear by default) so phones don't default to the selfie cam.
      const videoConstraint = selectedVideoId
        ? { deviceId: { exact: selectedVideoId } }
        : { facingMode: { ideal: facingMode } }
      const audioConstraint = selectedAudioId ? { deviceId: { exact: selectedAudioId } } : true
      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: audioConstraint })
      localStreamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream

      // Re-enumerate with permission so labels appear in dropdowns
      enumerateDevices()

      // 2. Peer connection
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }] })
      pcRef.current = pc

      // 3. Connection-state monitoring
      pc.onconnectionstatechange = () => {
        if (pcRef.current !== pc) return
        switch (pc.connectionState) {
          case 'connected':
            setConn('live')
            setGoLiveError(null)
            // Poll Cloudflare until the stream is distributable, then create the session.
            // This prevents WHEP 409 errors for members who join immediately.
            ;(async () => {
              for (let i = 0; i < 10; i++) {
                try {
                  const r = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
                  const d = await r.json()
                  if (d.status === 'active') break
                } catch { /* ignore */ }
                await new Promise<void>(res => setTimeout(res, 2000))
              }
              try {
                const goRes = await fetch('/api/gym/go-live', { method: 'POST' })
                if (goRes.ok) {
                  const { sessionId } = await goRes.json()
                  setActiveSessionId(sessionId)
                }
              } catch (e) { console.error(e) }
            })()
            break
          case 'disconnected':
            setConn('reconnecting')
            break
          case 'failed':
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

      // 6. Wait for ICE gathering — cap at 5s
      await Promise.race([
        new Promise<void>(resolve => {
          if (pc.iceGatheringState === 'complete') return resolve()
          pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') resolve() })
        }),
        new Promise<void>(resolve => setTimeout(resolve, 5000)),
      ])

      // 7. WHIP exchange via proxy
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

      if (pc.connectionState === 'connected') setConn('live')
    } catch (err) {
      console.error('[GoLive]', err)
      teardown()
      setConn('idle')
      setGoLiveError(err instanceof Error ? err.message : 'Failed to start stream')
    }
  }

  // ── END STREAM ────────────────────────────────────────────────────────────────
  async function handleEndStream() {
    setEndingStream(true)
    teardown()
    setConn('idle')
    setElapsed(0)
    setActiveSessionId(null)
    setViewers([])
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

  // ── Flip camera (front ⇄ rear) — works live via replaceTrack ─────────────────────
  async function flipCamera() {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: next } },
        audio: false,
      })
      const newTrack = newStream.getVideoTracks()[0]
      if (!newTrack) return

      // Swap the outgoing track on the live peer connection without renegotiating
      const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video')
      if (sender) await sender.replaceTrack(newTrack)

      // Swap the track in the local preview stream and stop the old camera
      const local = localStreamRef.current
      const oldVideo = local?.getVideoTracks()[0]
      if (local && oldVideo) { local.removeTrack(oldVideo); oldVideo.stop() }
      local?.addTrack(newTrack)
      if (videoRef.current && local) videoRef.current.srcObject = local

      setFacingMode(next)
      setSelectedVideoId('') // we're now driving by facing direction, not a fixed device
    } catch (e) {
      console.error('[flipCamera]', e)
    }
  }

  // ── Badge styling ─────────────────────────────────────────────────────────────
  const badge = isLive
    ? { border: 'border-[#FF3B3B]/30 bg-[#FF3B3B]/10', text: 'text-[#FF3B3B]', label: 'LIVE NOW', icon: <Radio size={12} className="text-[#FF3B3B] live-pulse" /> }
    : isReconnecting
    ? { border: 'border-[#FFD60A]/30 bg-[#FFD60A]/10', text: 'text-[#FFD60A]', label: 'RECONNECTING', icon: <WifiOff size={12} className="text-[#FFD60A]" /> }
    : isConnecting || provisioning
    ? { border: 'border-[#333333] bg-[#1A1A1A]', text: 'text-[#555555]', label: isConnecting ? 'CONNECTING…' : 'CHECKING…', icon: <Loader2 size={12} className="animate-spin text-[#555555]" /> }
    : { border: 'border-[#333333] bg-[#1A1A1A]', text: 'text-[#555555]', label: 'OFFLINE', icon: <Wifi size={12} className="text-[#555555]" /> }

  const healthDot = health === 'good' ? 'bg-[#00D4AA]' : health === 'fair' ? 'bg-[#FFD60A]' : 'bg-[#FF3B3B]'
  const healthText = health === 'good' ? 'text-[#00D4AA]' : health === 'fair' ? 'text-[#FFD60A]' : 'text-[#FF3B3B]'

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
          <div className="flex items-center gap-3">
            {/* Signal health — only when live */}
            {isLive && health && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-[#333333] bg-[#1A1A1A]">
                <span className={`w-1.5 h-1.5 rounded-full ${healthDot}`} />
                <span className={`font-inter text-[10px] tracking-[2px] uppercase ${healthText}`}>
                  {health === 'good' ? 'Good signal' : health === 'fair' ? 'Fair' : 'Poor signal'}
                </span>
              </div>
            )}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border ${badge.border}`}>
              {badge.icon}
              <span className={`font-bebas tracking-[2px] text-sm ${badge.text}`}>{badge.label}</span>
            </div>
          </div>
        </div>

        <div className="px-6 py-8 max-w-xl space-y-4">

          {/* Provisioning spinner */}
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

          {/* Device selector — only shown when offline */}
          {!provisioning && !provisionError && !broadcasting && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-5 py-4 space-y-3">
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Camera &amp; Mic</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Monitor size={11} className="text-[#555555]" />
                  <span className="font-inter text-[11px] text-[#555555]">Camera</span>
                </div>
                <select
                  value={selectedVideoId}
                  onChange={e => setSelectedVideoId(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-sm px-3 py-2 font-inter text-xs text-[#999999] focus:outline-none focus:border-[#555555] appearance-none cursor-pointer"
                >
                  <option value="">Rear camera (default)</option>
                  {videoDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 6)}`}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mic size={11} className="text-[#555555]" />
                  <span className="font-inter text-[11px] text-[#555555]">Microphone</span>
                </div>
                <select
                  value={selectedAudioId}
                  onChange={e => setSelectedAudioId(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-sm px-3 py-2 font-inter text-xs text-[#999999] focus:outline-none focus:border-[#555555] appearance-none cursor-pointer"
                >
                  <option value="">Default microphone</option>
                  {audioDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 6)}`}</option>
                  ))}
                </select>
              </div>
              <p className="font-inter text-[10px] text-[#444444]">
                Device labels populate after your first GO LIVE grants camera permission.
              </p>
            </div>
          )}

          {/* Camera preview — always mounted; toggled with CSS */}
          <div className={`bg-[#111111] border border-[#333333] rounded-sm overflow-hidden ${broadcasting ? '' : 'hidden'}`}>
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#FF3B3B] px-2 py-1 rounded-sm">
                  <Radio size={10} className="text-white live-pulse" />
                  <span className="font-bebas text-white text-xs tracking-[2px]">LIVE</span>
                </div>
              )}
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
              {isLive && (
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-sm">
                  <span className="font-bebas text-white text-sm tracking-[1px] tabular-nums">
                    {pad(Math.floor(elapsed / 3600) > 0 ? Math.floor(elapsed / 3600) : Math.floor(elapsed / 60))}
                    :{pad(Math.floor(elapsed / 3600) > 0 ? Math.floor((elapsed % 3600) / 60) : elapsed % 60)}
                  </span>
                </div>
              )}
              {broadcasting && (
                <button
                  onClick={flipCamera}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 hover:bg-black/90 px-3 py-1.5 rounded-sm transition-colors"
                >
                  <SwitchCamera size={13} className="text-white" />
                  <span className="font-bebas text-white text-xs tracking-[2px]">FLIP</span>
                </button>
              )}
            </div>
          </div>

          {/* Viewer panel — shown when live with an active session */}
          {isLive && activeSessionId && (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2A2A2A] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-[#555555]" />
                  <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Watching now</span>
                </div>
                <span className="font-bebas text-[22px] text-[#FF3B3B] tracking-[1px] leading-none">{viewers.length}</span>
              </div>
              {viewers.length === 0 ? (
                <div className="px-5 py-6 text-center relative overflow-hidden">
                  <span className="absolute inset-0 flex items-center justify-center font-bebas text-[80px] text-white/[0.03] leading-none select-none pointer-events-none">0</span>
                  <p className="relative font-inter text-[#555555] text-xs">No members watching yet</p>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-[#2A2A2A]">
                  {viewers
                    .slice()
                    .sort((a, b) => a.joined_at - b.joined_at)
                    .map(v => (
                      <div key={v.user_id} className="px-5 py-3 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-sm bg-[#222222] flex items-center justify-center shrink-0">
                          <span className="font-bebas text-[#555555] text-xs leading-none">{v.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-inter text-sm text-[#999999] truncate">{v.name}</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D4AA] shrink-0" title="Watching" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

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
                className="w-full flex items-center justify-center gap-3 bg-[#FF3B3B] hover:bg-[#e03030] text-white font-bebas tracking-[3px] text-lg py-4 rounded-sm transition-all"
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
