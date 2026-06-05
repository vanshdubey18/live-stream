'use client'

import { useState, useEffect, useCallback } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Copy, Check, Loader2, Radio, Wifi, WifiOff } from 'lucide-react'

const RTMP_SERVER = 'rtmp://live.mux.com/app'

interface Props {
  gymId: string
  streamKey: string | null
  hasStream: boolean
}

type StreamStatus = 'loading' | 'idle' | 'active' | 'disconnected'

export default function StreamSetupPageClient({ gymId, streamKey: initialKey, hasStream: initialHasStream }: Props) {
  const [streamKey, setStreamKey] = useState<string | null>(initialKey)
  const [status, setStatus] = useState<StreamStatus>('loading')
  const [provisioning, setProvisioning] = useState(!initialHasStream)
  const [copied, setCopied] = useState<'url' | 'key' | null>(null)
  const [showKey, setShowKey] = useState(false)

  function copy(text: string, which: 'url' | 'key') {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  const provision = useCallback(async () => {
    setProvisioning(true)
    try {
      const res = await fetch('/api/gym/create-stream', { method: 'POST' })
      const data = await res.json()
      if (data.stream_key) setStreamKey(data.stream_key)
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

  const isLive = status === 'active'
  const isLoading = status === 'loading' || provisioning

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Stream Setup" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#222222] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-bebas text-xl text-white tracking-[1px] leading-tight">Stream Setup</h1>
          </div>
          {/* Live status pill */}
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
              {isLoading ? 'Checking…' : isLive ? 'Live Now' : status === 'disconnected' ? 'Reconnecting' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 max-w-xl space-y-4">

          {/* Stream credentials card */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#222222]">
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-1">Stream Credentials</p>
              <p className="font-inter text-sm text-[#555555]">Paste these into OBS, Larix, or any RTMP app to go live.</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Server URL */}
              <div>
                <p className="font-inter text-[11px] text-[#999999] tracking-[3px] uppercase mb-2">Server URL</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-2.5 font-mono text-sm text-[#999999] truncate">
                    {RTMP_SERVER}
                  </div>
                  <button
                    onClick={() => copy(RTMP_SERVER, 'url')}
                    className={`shrink-0 flex items-center gap-1.5 border font-inter text-xs px-3 py-2.5 rounded-sm transition-all ${
                      copied === 'url'
                        ? 'border-[#00D4AA]/40 bg-[#00D4AA]/5 text-[#00D4AA]'
                        : 'border-[#333333] text-[#555555] hover:text-white hover:border-[#555555]'
                    }`}
                  >
                    {copied === 'url' ? <><Check size={12} /> COPIED</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>

              {/* Stream Key */}
              <div>
                <p className="font-inter text-[11px] text-[#999999] tracking-[3px] uppercase mb-2">Stream Key</p>
                {provisioning || !streamKey ? (
                  <div className="flex items-center gap-3 bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-2.5">
                    <Loader2 size={14} className="animate-spin text-[#555555]" />
                    <span className="font-inter text-sm text-[#555555]">Provisioning your stream…</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-2.5 font-mono text-sm text-[#999999] truncate">
                      {showKey ? streamKey : '••••••••••••••••••••••••••'}
                    </div>
                    <button
                      onClick={() => setShowKey(v => !v)}
                      className="shrink-0 border border-[#333333] text-[#555555] hover:text-white hover:border-[#555555] font-inter text-xs px-3 py-2.5 rounded-sm transition-all"
                    >
                      {showKey ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => copy(streamKey, 'key')}
                      className={`shrink-0 flex items-center gap-1.5 border font-inter text-xs px-3 py-2.5 rounded-sm transition-all ${
                        copied === 'key'
                          ? 'border-[#00D4AA]/40 bg-[#00D4AA]/5 text-[#00D4AA]'
                          : 'border-[#333333] text-[#555555] hover:text-white hover:border-[#555555]'
                      }`}
                    >
                      {copied === 'key' ? <><Check size={12} /> COPIED</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                )}
                <p className="font-inter text-[11px] text-[#444444] mt-2">
                  Keep this private — anyone with this key can stream to your channel.
                </p>
              </div>
            </div>
          </div>

          {/* Simple hint */}
          <p className="font-inter text-sm text-[#555555] px-1">
            Open any streaming app (OBS, Larix, etc.), paste the Server URL and Stream Key, and hit Go Live.
          </p>

        </div>
      </main>
    </div>
  )
}
