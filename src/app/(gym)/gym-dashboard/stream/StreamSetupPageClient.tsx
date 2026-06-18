'use client'

import { useState, useEffect, useCallback } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Copy, Check, Loader2, Radio, Wifi, WifiOff, Smartphone } from 'lucide-react'

const RTMP_SERVER = 'rtmps://global-live.mux.com:443/app'

interface Props {
  gymId: string
  streamKey: string | null
  hasStream: boolean
}

type StreamStatus = 'loading' | 'idle' | 'active' | 'disconnected'

type CopiedField = 'combined' | 'url' | 'key' | null

export default function StreamSetupPageClient({ gymId, streamKey: initialKey, hasStream: initialHasStream }: Props) {
  const [streamKey, setStreamKey] = useState<string | null>(initialKey)
  const [status, setStatus] = useState<StreamStatus>('loading')
  const [provisioning, setProvisioning] = useState(!initialHasStream)
  const [provisionError, setProvisionError] = useState<string | null>(null)
  const [copied, setCopied] = useState<CopiedField>(null)
  const [showKey, setShowKey] = useState(false)
  const [goingLive, setGoingLive] = useState(false)
  const [endingStream, setEndingStream] = useState(false)

  function copy(text: string, which: CopiedField) {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  const provision = useCallback(async () => {
    setProvisioning(true)
    setProvisionError(null)
    try {
      const res = await fetch('/api/gym/create-stream', { method: 'POST' })
      const data = await res.json()
      if (data.stream_key) {
        setStreamKey(data.stream_key)
      } else if (data.error) {
        setProvisionError(data.error)
      }
    } catch {
      setProvisionError('Network error — could not reach the server')
    } finally {
      setProvisioning(false)
    }
  }, [])

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
      if (!res.ok) return
      const data = await res.json()
      setStatus((data.status ?? 'idle') as StreamStatus)
      if (!data.has_stream) provision()
    } catch { /* ignore */ }
  }, [gymId, provision])

  useEffect(() => {
    pollStatus()
    const t = setInterval(pollStatus, 30_000)
    return () => clearInterval(t)
  }, [pollStatus])

  async function handleGoLive() {
    setGoingLive(true)
    try {
      await fetch('/api/gym/go-live', { method: 'POST' })
      setStatus('active')
    } catch { /* poll will correct */ } finally {
      setGoingLive(false)
    }
  }

  async function handleEndStream() {
    setEndingStream(true)
    try {
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
  const combinedUrl = streamKey ? `${RTMP_SERVER}/${streamKey}` : null
  const larixUrl = streamKey
    ? `larix://app?action=openStream&server=${encodeURIComponent(RTMP_SERVER)}&streamKey=${encodeURIComponent(streamKey)}`
    : null

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Stream Setup" />

      <main className="flex-1 lg:ml-64 min-w-0">
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

          {/* GO LIVE / END STREAM action */}
          {streamKey && !provisionError && (
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
                {goingLive ? <Loader2 size={16} className="animate-spin" /> : <Radio size={16} />}
                {goingLive ? 'STARTING…' : 'GO LIVE'}
              </button>
            )
          )}

          {/* Credentials card */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#222222]">
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Stream Credentials</p>
              <p className="font-inter text-xs text-[#555555] mt-0.5">Open your streaming app and paste these in.</p>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* Stream key state */}
              {provisionError ? (
                <div className="bg-[#0D0D0D] border border-[#FF3B3B]/30 rounded-sm px-4 py-3 space-y-1.5">
                  <p className="font-inter text-xs text-[#FF3B3B]">Failed to provision stream</p>
                  <p className="font-mono text-xs text-[#555555] break-all">{provisionError}</p>
                  <button onClick={provision} className="font-inter text-xs text-[#999999] hover:text-white underline">
                    Retry
                  </button>
                </div>
              ) : provisioning || !streamKey ? (
                <div className="flex items-center gap-3 bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3">
                  <Loader2 size={14} className="animate-spin text-[#555555] shrink-0" />
                  <span className="font-inter text-sm text-[#555555]">Provisioning your stream…</span>
                </div>
              ) : (
                <>
                  {/* Combined URL — for Larix / Streamlabs mobile */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-inter text-[11px] text-[#999999] tracking-[3px] uppercase">Stream URL (Larix / Streamlabs)</p>
                      {larixUrl && (
                        <a
                          href={larixUrl}
                          className="flex items-center gap-1 font-inter text-[11px] text-[#555555] hover:text-white transition-colors"
                        >
                          <Smartphone size={11} />
                          Open in Larix
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-2.5 font-mono text-xs text-[#999999] truncate">
                        {combinedUrl}
                      </div>
                      <button
                        onClick={() => copy(combinedUrl!, 'combined')}
                        className={`shrink-0 flex items-center gap-1.5 border font-inter text-xs px-3 py-2.5 rounded-sm transition-all ${
                          copied === 'combined'
                            ? 'border-[#00D4AA]/40 bg-[#00D4AA]/5 text-[#00D4AA]'
                            : 'border-[#333333] text-[#555555] hover:text-white hover:border-[#555555]'
                        }`}
                      >
                        {copied === 'combined' ? <><Check size={12} /> COPIED</> : <><Copy size={12} /> COPY</>}
                      </button>
                    </div>
                    <p className="font-inter text-[10px] text-[#444444] mt-1.5">
                      Paste as a single URL in Larix → Connections → New connection → Server URL
                    </p>
                  </div>

                  {/* Separate fields for OBS */}
                  <div className="border-t border-[#222222] pt-4 space-y-3">
                    <p className="font-inter text-[11px] text-[#555555] tracking-[3px] uppercase">OBS / Split fields</p>
                    <div>
                      <p className="font-inter text-[10px] text-[#666666] mb-1.5">Server</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded-sm px-3 py-2 font-mono text-xs text-[#777777] truncate">
                          {RTMP_SERVER}
                        </div>
                        <button
                          onClick={() => copy(RTMP_SERVER, 'url')}
                          className={`shrink-0 flex items-center gap-1 border font-inter text-xs px-2.5 py-2 rounded-sm transition-all ${
                            copied === 'url'
                              ? 'border-[#00D4AA]/40 bg-[#00D4AA]/5 text-[#00D4AA]'
                              : 'border-[#2A2A2A] text-[#444444] hover:text-white hover:border-[#555555]'
                          }`}
                        >
                          {copied === 'url' ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="font-inter text-[10px] text-[#666666] mb-1.5">Stream Key</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded-sm px-3 py-2 font-mono text-xs text-[#777777] truncate">
                          {showKey ? streamKey : '••••••••••••••••••••••'}
                        </div>
                        <button
                          onClick={() => setShowKey(v => !v)}
                          className="shrink-0 border border-[#2A2A2A] text-[#444444] hover:text-white hover:border-[#555555] font-inter text-xs px-2.5 py-2 rounded-sm transition-all"
                        >
                          {showKey ? 'HIDE' : 'SHOW'}
                        </button>
                        <button
                          onClick={() => copy(streamKey!, 'key')}
                          className={`shrink-0 flex items-center gap-1 border font-inter text-xs px-2.5 py-2 rounded-sm transition-all ${
                            copied === 'key'
                              ? 'border-[#00D4AA]/40 bg-[#00D4AA]/5 text-[#00D4AA]'
                              : 'border-[#2A2A2A] text-[#444444] hover:text-white hover:border-[#555555]'
                          }`}
                        >
                          {copied === 'key' ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <p className="font-inter text-xs text-[#444444] px-1">
            Click GO LIVE to notify members a stream is starting, then open your streaming app and paste the credentials.
            Status updates automatically every 30 seconds.
          </p>

        </div>
      </main>
    </div>
  )
}
