'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, Eye, EyeOff, ExternalLink, Check, RefreshCw, Loader2 } from 'lucide-react'

const SERVER_URL = 'rtmp://live.mux.com/app'

type StreamStatus = 'idle' | 'active' | 'disconnected' | 'no_stream' | 'loading' | 'error'

interface Props {
  gymId: string
  streamKey?: string | null
}

export default function StreamSetupCard({ gymId, streamKey: initialKey }: Props) {
  const [showKey, setShowKey] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [streamKey, setStreamKey] = useState<string | null>(initialKey ?? null)
  const [status, setStatus] = useState<StreamStatus>('loading')
  const [creating, setCreating] = useState(false)

  function copy(text: string, which: 'url' | 'key') {
    navigator.clipboard.writeText(text)
    if (which === 'url') { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }
    else { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000) }
  }

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
      if (!res.ok) { setStatus('error'); return }
      const data = await res.json()
      if (!data.has_stream) { setStatus('no_stream'); return }
      setStatus(data.status as StreamStatus)
    } catch {
      setStatus('error')
    }
  }, [gymId])

  useEffect(() => {
    pollStatus()
    const id = setInterval(pollStatus, 30_000)
    return () => clearInterval(id)
  }, [pollStatus])

  async function createStream() {
    setCreating(true)
    try {
      const res = await fetch('/api/gym/create-stream', { method: 'POST' })
      const data = await res.json()
      if (data.stream_key) {
        setStreamKey(data.stream_key)
        setStatus('idle')
      }
    } catch {
      // ignore
    } finally {
      setCreating(false)
    }
  }

  const statusBadge = (() => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" /> LIVE NOW
          </span>
        )
      case 'disconnected':
        return (
          <span className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <RefreshCw size={11} className="animate-spin" /> Reconnecting...
          </span>
        )
      case 'loading':
        return (
          <span className="flex items-center gap-2 bg-white/5 border border-white/10 text-[#888888] text-xs font-bold px-3 py-1.5 rounded-full">
            <Loader2 size={11} className="animate-spin" /> Checking...
          </span>
        )
      case 'idle':
      default:
        return (
          <span className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Ready to stream
          </span>
        )
    }
  })()

  return (
    <div className="bg-[#111111] border border-[#DC2626]/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-lg">🎥 Stream Setup</h2>
        {statusBadge}
      </div>

      {!streamKey ? (
        /* No stream yet — prompt to create */
        <div className="text-center py-6 space-y-4">
          <p className="text-[#888888] text-sm">No stream configured yet. Create your Mux live stream to get your credentials.</p>
          <button
            onClick={createStream}
            disabled={creating}
            className="flex items-center gap-2 mx-auto bg-[#DC2626] hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
            {creating ? <Loader2 size={15} className="animate-spin" /> : null}
            {creating ? 'Creating stream…' : 'Create Live Stream'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-3">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3">
              <p className="text-[#888888] text-xs mb-1">Status</p>
              <p className="text-white text-sm font-medium">
                {status === 'active' ? '🔴 Streaming live'
                  : status === 'disconnected' ? '⟳ Reconnecting…'
                  : 'Offline'}
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3">
              <p className="text-[#888888] text-xs mb-1">Auto-refreshes</p>
              <p className="text-white text-sm font-medium">Every 30 seconds</p>
            </div>
            <a
              href="https://obsproject.com/wiki/OBS-Studio-Quickstart"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#DC2626] text-sm font-medium hover:underline">
              How to set up OBS <ExternalLink size={13} />
            </a>
          </div>

          {/* Right */}
          <div className="space-y-3">
            {/* Server URL */}
            <div>
              <p className="text-[#888888] text-xs mb-1.5">Server URL</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs font-mono truncate">
                  {SERVER_URL}
                </div>
                <button onClick={() => copy(SERVER_URL, 'url')}
                  className="shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[#888888] hover:text-white transition-all">
                  {copiedUrl ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Stream Key */}
            <div>
              <p className="text-[#888888] text-xs mb-1.5">Stream Key</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs font-mono truncate">
                  {showKey ? streamKey : '••••••••••••••••••••'}
                </div>
                <button onClick={() => setShowKey(!showKey)}
                  className="shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[#888888] hover:text-white transition-all">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => copy(streamKey, 'key')}
                  className="shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[#888888] hover:text-white transition-all">
                  {copiedKey ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
