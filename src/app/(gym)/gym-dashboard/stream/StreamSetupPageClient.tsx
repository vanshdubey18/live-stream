'use client'

import { useState, useEffect, useCallback } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Copy, Check, Loader2, Radio, Wifi, WifiOff, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const RTMP_SERVER = 'rtmp://live.mux.com/app'

const OBS_STEPS = [
  {
    n: 1,
    title: 'Open OBS Studio',
    body: 'Download OBS from obsproject.com if you haven\'t already. It\'s free and works on Windows, Mac, and Linux.',
    link: { label: 'Download OBS', href: 'https://obsproject.com' },
  },
  {
    n: 2,
    title: 'Go to Settings → Stream',
    body: 'In OBS, click Settings in the bottom-right. Go to the Stream tab. Set Service to "Custom…".',
  },
  {
    n: 3,
    title: 'Paste your credentials',
    body: 'Copy the Server URL and Stream Key from the box above. Paste them into the Server and Stream Key fields in OBS.',
  },
  {
    n: 4,
    title: 'Set up your scene',
    body: 'Add a Video Capture Device source (your camera) and an Audio Input Capture source (your mic). Arrange them on the canvas.',
  },
  {
    n: 5,
    title: 'Click Start Streaming in OBS',
    body: 'Once you click Start Streaming, your stream will go live. Then click GO LIVE on your scheduled class in Matpeak to notify your members.',
  },
]

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
  const [obsOpen, setObsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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

        <div className="px-6 py-8 max-w-3xl space-y-6">

          {/* Stream credentials card */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#222222]">
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-1">Your Stream Credentials</p>
              <p className="font-inter text-sm text-[#555555]">Paste these into OBS Studio or any RTMP streaming app.</p>
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
                    className="shrink-0 flex items-center gap-1.5 border border-[#333333] text-[#555555] hover:text-white hover:border-[#555555] font-inter text-xs px-3 py-2.5 rounded-sm transition-all"
                  >
                    {copied === 'url' ? <><Check size={12} className="text-[#00D4AA]" /> Copied</> : <><Copy size={12} /> Copy</>}
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
                      className="shrink-0 flex items-center gap-1.5 border border-[#333333] text-[#555555] hover:text-white hover:border-[#555555] font-inter text-xs px-3 py-2.5 rounded-sm transition-all"
                    >
                      {copied === 'key' ? <><Check size={12} className="text-[#00D4AA]" /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                )}
                <p className="font-inter text-[11px] text-[#444444] mt-2">
                  Keep this private — anyone with this key can stream to your channel.
                </p>
              </div>
            </div>
          </div>

          {/* Stream status info */}
          <div className={`rounded-sm border px-5 py-4 flex items-start gap-3 ${
            isLive ? 'border-[#FF3B3B]/30 bg-[#FF3B3B]/5' :
            status === 'disconnected' ? 'border-[#FFD60A]/20 bg-[#FFD60A]/5' :
            'border-[#333333] bg-[#1A1A1A]'
          }`}>
            <div className="mt-0.5">
              {isLive ? <Radio size={16} className="text-[#FF3B3B]" /> :
               status === 'disconnected' ? <WifiOff size={16} className="text-[#FFD60A]" /> :
               <Wifi size={16} className="text-[#555555]" />}
            </div>
            <div>
              <p className={`font-bebas tracking-[1px] text-lg ${isLive ? 'text-[#FF3B3B]' : status === 'disconnected' ? 'text-[#FFD60A]' : 'text-[#555555]'}`}>
                {isLive ? 'Stream is Live' : status === 'disconnected' ? 'Stream Disconnected' : isLoading ? 'Checking stream…' : 'Stream is Offline'}
              </p>
              <p className="font-inter text-xs text-[#555555] mt-0.5">
                {isLive ? 'OBS is connected and broadcasting. Go to Schedule Classes to manage your live session.' :
                 status === 'disconnected' ? 'OBS disconnected unexpectedly. Check your internet and restart streaming.' :
                 isLoading ? 'Connecting to Mux…' :
                 'OBS is not connected. Start streaming in OBS to go live.'}
              </p>
            </div>
          </div>

          {/* OBS guide */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
            <button
              onClick={() => setObsOpen(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#222222] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-sm bg-[#6B4FBB]/20 border border-[#6B4FBB]/30 flex items-center justify-center">
                  <Radio size={12} className="text-[#9B7FEB]" />
                </div>
                <div className="text-left">
                  <p className="font-bebas text-white tracking-[1px]">OBS Studio Setup Guide</p>
                  <p className="font-inter text-[11px] text-[#555555]">Step-by-step for Windows, Mac & Linux</p>
                </div>
              </div>
              {obsOpen ? <ChevronUp size={16} className="text-[#555555]" /> : <ChevronDown size={16} className="text-[#555555]" />}
            </button>

            {obsOpen && (
              <div className="border-t border-[#222222] px-6 py-5 space-y-5">
                {OBS_STEPS.map(step => (
                  <div key={step.n} className="flex gap-4">
                    <div className="w-6 h-6 rounded-sm bg-[#333333] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-bebas text-sm text-white">{step.n}</span>
                    </div>
                    <div>
                      <p className="font-inter text-sm text-white font-medium mb-1">{step.title}</p>
                      <p className="font-inter text-sm text-[#777777] leading-relaxed">{step.body}</p>
                      {step.link && (
                        <a
                          href={step.link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-inter text-xs text-[#FF3B3B] hover:text-white mt-2 transition-colors"
                        >
                          {step.link.label} <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile streaming guide */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#222222] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-sm bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center justify-center">
                  <Radio size={12} className="text-[#00D4AA]" />
                </div>
                <div className="text-left">
                  <p className="font-bebas text-white tracking-[1px]">Stream from Your Phone</p>
                  <p className="font-inter text-[11px] text-[#555555]">Using Larix Broadcaster (iOS & Android)</p>
                </div>
              </div>
              {mobileOpen ? <ChevronUp size={16} className="text-[#555555]" /> : <ChevronDown size={16} className="text-[#555555]" />}
            </button>

            {mobileOpen && (
              <div className="border-t border-[#222222] px-6 py-5 space-y-5">
                {[
                  { n: 1, title: 'Download Larix Broadcaster', body: 'Free app available on iOS and Android. Search "Larix Broadcaster" in the App Store or Play Store.' },
                  { n: 2, title: 'Open Settings → Connections → Add', body: 'Tap the gear icon → Connections → the + button to add a new stream connection.' },
                  { n: 3, title: 'Set the URL', body: `Paste your full stream URL: ${RTMP_SERVER}/${streamKey ?? '<your-stream-key>'}` },
                  { n: 4, title: 'Tap the record button to go live', body: 'Point your phone at the class and tap the red record button. Your stream will connect within a few seconds.' },
                ].map(step => (
                  <div key={step.n} className="flex gap-4">
                    <div className="w-6 h-6 rounded-sm bg-[#333333] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="font-bebas text-sm text-white">{step.n}</span>
                    </div>
                    <div>
                      <p className="font-inter text-sm text-white font-medium mb-1">{step.title}</p>
                      <p className="font-inter text-sm text-[#777777] leading-relaxed">{step.body}</p>
                    </div>
                  </div>
                ))}
                <div className="bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3">
                  <p className="font-inter text-[11px] text-[#555555] mb-2 uppercase tracking-[2px]">Full stream URL for Larix</p>
                  <p className="font-mono text-xs text-[#999999] break-all">
                    {RTMP_SERVER}/{streamKey ?? '••••••••••••••••••••••'}
                  </p>
                  {streamKey && (
                    <button
                      onClick={() => copy(`${RTMP_SERVER}/${streamKey}`, 'key')}
                      className="mt-2 flex items-center gap-1.5 font-inter text-xs text-[#555555] hover:text-white transition-colors"
                    >
                      {copied === 'key' ? <><Check size={11} className="text-[#00D4AA]" /> Copied</> : <><Copy size={11} /> Copy full URL</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <p className="font-inter text-[11px] text-[#444444]">
            Stream status refreshes automatically every 30 seconds.
          </p>

        </div>
      </main>
    </div>
  )
}
