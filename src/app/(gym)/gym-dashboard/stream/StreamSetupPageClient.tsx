'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Loader2, Radio, AlertCircle, Camera, Mic, Monitor, Users, SwitchCamera, Tag, Pencil, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LiveChat from '@/components/live/LiveChat'

interface Props {
  gymId: string
  ownerId: string
  hasCfStream: boolean
  sessionId?: string | null
  gymDisciplines?: string[]
  scheduledTitle?: string | null
  scheduledDiscipline?: string | null
  scheduledAt?: string | null
}

type ConnState = 'idle' | 'connecting' | 'live' | 'reconnecting'
interface Viewer { user_id: string; name: string; joined_at: number }

function pad(n: number) { return String(n).padStart(2, '0') }

// Countdown to a scheduled class: "Xh Ym" while far out, a live ticking
// MM:SS once under an hour away, or "Starting now" once past start time.
function formatCountdown(scheduledAt: string, nowMs: number) {
  const diffMs = new Date(scheduledAt).getTime() - nowMs
  if (diffMs <= 0) return 'Starting now'
  const totalSeconds = Math.floor(diffMs / 1000)
  if (totalSeconds >= 3600) {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.round((totalSeconds % 3600) / 60)
    return `${hrs}h ${mins}m`
  }
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${pad(mins)}:${pad(secs)}`
}

export default function StreamSetupPageClient({
  gymId,
  ownerId,
  hasCfStream: initialHasCfStream,
  sessionId: scheduledSessionId,
  gymDisciplines = [],
  scheduledTitle,
  scheduledDiscipline,
  scheduledAt,
}: Props) {
  // ── State ─────────────────────────────────────────────────────────────────────
  const [conn, setConn] = useState<ConnState>('idle')
  const [provisioning, setProvisioning] = useState(!initialHasCfStream)
  const [provisionError, setProvisionError] = useState<string | null>(null)
  const [goLiveError, setGoLiveError] = useState<string | null>(null)
  const [endingStream, setEndingStream] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  // Class details — only relevant for an ad-hoc go-live (no scheduled session).
  // A scheduled class already carries its own title/discipline through.
  const [classTitle, setClassTitle] = useState('')
  const [classDiscipline, setClassDiscipline] = useState(gymDisciplines[0] ?? 'BJJ')

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

  // Countdown to a scheduled class — only ticks while not yet broadcasting
  const [now, setNow] = useState(() => Date.now())

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

  // ── Countdown tick — only while a scheduled class hasn't gone live yet ────────
  useEffect(() => {
    if (broadcasting || !scheduledAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [broadcasting, scheduledAt])

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
                const goRes = await fetch('/api/gym/go-live', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(
                    scheduledSessionId
                      ? { session_id: scheduledSessionId }
                      : { title: classTitle, discipline: classDiscipline }
                  ),
                })
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

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <GymSidebar active="Stream Setup" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#242420] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-mincho text-xl text-[#f0eadc] tracking-[1px] leading-tight">Go Live</h1>
          </div>
        </div>

        <div className="px-6 py-8 max-w-xl space-y-4">

          {/* Provisioning spinner */}
          {provisioning && (
            <div className="flex items-center gap-3 bg-[#1c1c16] border border-[#322f26] rounded-sm px-5 py-4">
              <Loader2 size={14} className="animate-spin text-[#7a7568] shrink-0" />
              <span className="font-mincho text-sm text-[#7a7568]">Setting up your stream…</span>
            </div>
          )}

          {/* Provision error */}
          {provisionError && (
            <div className="bg-[#1c1c16] border border-[#b3402f]/30 rounded-sm px-5 py-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-[#b3402f] shrink-0" />
                <p className="font-mincho text-xs text-[#b3402f]">Failed to set up stream</p>
              </div>
              <p className="font-mono text-xs text-[#7a7568] break-all">{provisionError}</p>
              <button onClick={provision} className="font-mincho text-xs text-[#a29c8c] hover:text-[#f0eadc] underline">Retry</button>
            </div>
          )}

          {/* GO LIVE error */}
          {goLiveError && (
            <div className="bg-[#1c1c16] border border-[#b3402f]/30 rounded-sm px-5 py-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} className="text-[#b3402f] shrink-0" />
                <p className="font-mincho text-xs text-[#b3402f]">Could not start stream</p>
              </div>
              <p className="font-mono text-xs text-[#7a7568] break-all">{goLiveError}</p>
              <button onClick={() => setGoLiveError(null)} className="font-mincho text-xs text-[#a29c8c] hover:text-[#f0eadc] underline">Dismiss</button>
            </div>
          )}

          {/* Class details — scheduled classes already know their title/discipline;
              ad-hoc streams need to ask, otherwise every class silently defaults to BJJ */}
          {!provisioning && !provisionError && !broadcasting && (
            scheduledSessionId ? (
              <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm px-5 py-4 flex items-center gap-3">
                <Tag size={13} className="text-[#a29c8c] shrink-0" />
                <div className="min-w-0">
                  <p className="font-mincho text-[#f0eadc] text-sm font-medium truncate">{scheduledTitle ?? 'Scheduled class'}</p>
                  <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[2px] uppercase">{scheduledDiscipline ?? 'BJJ'}</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm px-5 py-4 space-y-3">
                <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Class Details</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Tag size={11} className="text-[#a29c8c]" />
                    <span className="font-mincho text-[11px] text-[#a29c8c]">Discipline</span>
                  </div>
                  <select
                    value={classDiscipline}
                    onChange={e => setClassDiscipline(e.target.value)}
                    className="w-full bg-[#18180f] border border-[#322f26] rounded-sm px-3 py-2 font-mincho text-xs text-[#a29c8c] focus:outline-none focus:border-[#7a7568] appearance-none cursor-pointer"
                  >
                    {(gymDisciplines.length ? gymDisciplines : ['BJJ']).map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Pencil size={11} className="text-[#a29c8c]" />
                    <span className="font-mincho text-[11px] text-[#a29c8c]">What&apos;s the class? (e.g. Guard Passing, Clinch Work)</span>
                  </div>
                  <input
                    value={classTitle}
                    onChange={e => setClassTitle(e.target.value)}
                    placeholder="Class title or technique focus"
                    className="w-full bg-[#18180f] border border-[#322f26] rounded-sm px-3 py-2 font-mincho text-xs text-[#f0eadc] placeholder-[#7a7568] focus:outline-none focus:border-[#7a7568]"
                  />
                </div>
              </div>
            )
          )}

          {/* Device selector — only shown when offline */}
          {!provisioning && !provisionError && !broadcasting && (
            <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm px-5 py-4 space-y-3">
              <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Camera &amp; Mic</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Monitor size={11} className="text-[#a29c8c]" />
                  <span className="font-mincho text-[11px] text-[#a29c8c]">Camera</span>
                </div>
                <select
                  value={selectedVideoId}
                  onChange={e => setSelectedVideoId(e.target.value)}
                  className="w-full bg-[#18180f] border border-[#322f26] rounded-sm px-3 py-2 font-mincho text-xs text-[#a29c8c] focus:outline-none focus:border-[#7a7568] appearance-none cursor-pointer"
                >
                  <option value="">Rear camera (default)</option>
                  {videoDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 6)}`}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mic size={11} className="text-[#a29c8c]" />
                  <span className="font-mincho text-[11px] text-[#a29c8c]">Microphone</span>
                </div>
                <select
                  value={selectedAudioId}
                  onChange={e => setSelectedAudioId(e.target.value)}
                  className="w-full bg-[#18180f] border border-[#322f26] rounded-sm px-3 py-2 font-mincho text-xs text-[#a29c8c] focus:outline-none focus:border-[#7a7568] appearance-none cursor-pointer"
                >
                  <option value="">Default microphone</option>
                  {audioDevices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 6)}`}</option>
                  ))}
                </select>
              </div>
              <p className="font-mincho text-[10px] text-[#635f54]">
                Defaults to your rear camera. Tap FLIP on the preview to switch to the selfie camera, or pick a specific device above. Labels appear after your first GO LIVE grants camera permission.
              </p>
            </div>
          )}

          {/* Camera preview — always mounted; toggled with CSS */}
          <div className={`bg-[#18180f] border border-[#322f26] rounded-sm overflow-hidden ${broadcasting ? '' : 'hidden'}`}>
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {isLive && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#b3402f] px-2 py-1 rounded-sm">
                  <Radio size={10} className="text-[#f0eadc] live-pulse" />
                  <span className="font-mincho text-[#f0eadc] text-xs tracking-[2px]">LIVE</span>
                </div>
              )}
              {(isConnecting || isReconnecting) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-[#f0eadc]" />
                    <span className="font-mincho text-[#f0eadc] text-sm tracking-[2px]">
                      {isReconnecting ? 'RECONNECTING…' : 'CONNECTING…'}
                    </span>
                  </div>
                </div>
              )}
              {isLive && (
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-sm">
                  <span className="font-mincho text-[#f0eadc] text-sm tracking-[1px] tabular-nums">
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
                  <SwitchCamera size={13} className="text-[#f0eadc]" />
                  <span className="font-mincho text-[#f0eadc] text-xs tracking-[2px]">FLIP</span>
                </button>
              )}
            </div>
          </div>

          {/* Viewer panel — shown when live with an active session */}
          {isLive && activeSessionId && (
            <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-[#2a2a20] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-[#7a7568]" />
                  <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Watching now</span>
                </div>
                <span className="font-mincho text-[22px] text-[#b3402f] tracking-[1px] leading-none">{viewers.length}</span>
              </div>
              {viewers.length === 0 ? (
                <div className="px-5 py-6 text-center relative overflow-hidden">
                  <span className="absolute inset-0 flex items-center justify-center font-mincho text-[80px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">0</span>
                  <p className="relative font-mincho text-[#7a7568] text-xs">No members watching yet</p>
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-[#2a2a20]">
                  {viewers
                    .slice()
                    .sort((a, b) => a.joined_at - b.joined_at)
                    .map(v => (
                      <div key={v.user_id} className="px-5 py-3 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-sm bg-[#242420] flex items-center justify-center shrink-0">
                          <span className="font-mincho text-[#7a7568] text-xs leading-none">{v.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-mincho text-sm text-[#a29c8c] truncate">{v.name}</span>
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D4AA] shrink-0" title="Watching" />
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Live chat — moderatable, same feed members see on the watch page */}
          {isLive && activeSessionId && (
            <LiveChat sessionId={activeSessionId} userId={ownerId} canModerate />
          )}

          {/* Countdown to a scheduled class — informational only, never gates GO LIVE */}
          {!broadcasting && !provisioning && !provisionError && scheduledSessionId && scheduledAt && (
            <div className="flex items-center justify-center gap-2 font-mincho">
              <Clock size={13} className="text-[#a29c8c]" />
              <span className="text-sm text-[#a29c8c]">
                Class starts in{' '}
                <span className={`tabular-nums tracking-[1px] ${formatCountdown(scheduledAt, now) === 'Starting now' ? 'text-[#b3402f]' : 'text-[#f0eadc]'}`}>
                  {formatCountdown(scheduledAt, now)}
                </span>
              </span>
            </div>
          )}

          {/* Primary action */}
          {!provisioning && !provisionError && (
            broadcasting ? (
              <button
                onClick={handleEndStream}
                disabled={endingStream}
                className="w-full flex items-center justify-center gap-3 bg-[#b3402f]/10 border border-[#b3402f]/40 hover:bg-[#b3402f]/20 text-[#b3402f] font-mincho tracking-[3px] text-lg py-4 rounded-sm transition-all disabled:opacity-50"
              >
                {endingStream ? <Loader2 size={16} className="animate-spin" /> : <Radio size={16} className="live-pulse" />}
                {endingStream ? 'ENDING…' : 'END STREAM'}
              </button>
            ) : (
              <button
                onClick={handleGoLive}
                disabled={!scheduledSessionId && !classTitle.trim()}
                className="w-full flex items-center justify-center gap-3 bg-[#b3402f] hover:bg-[#942f22] disabled:opacity-40 disabled:cursor-not-allowed text-[#f0eadc] font-mincho tracking-[3px] text-lg py-4 rounded-sm transition-all"
              >
                <Camera size={16} />
                GO LIVE
              </button>
            )
          )}
          {!scheduledSessionId && !broadcasting && !classTitle.trim() && !provisioning && !provisionError && (
            <p className="font-mincho text-[11px] text-[#7a7568] px-1">Enter what the class is about above to go live.</p>
          )}

          {/* Info text */}
          {!broadcasting && !provisioning && !provisionError && (
            <p className="font-mincho text-xs text-[#635f54] px-1">
              Click GO LIVE — your browser will ask for camera and microphone access, then start streaming instantly.
              Members will be notified and can join right away.
            </p>
          )}

        </div>
      </main>
    </div>
  )
}
