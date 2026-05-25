'use client'

import { useState, useEffect, useCallback } from 'react'
import { Copy, Eye, EyeOff, ExternalLink, Check, Loader2 } from 'lucide-react'

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
  const [createError, setCreateError] = useState('')

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
    setCreateError('')
    try {
      const res = await fetch('/api/gym/create-stream', { method: 'POST' })
      let data: Record<string, unknown> = {}
      try {
        data = await res.json()
      } catch {
        setCreateError(`Server error (${res.status}) — check your MUX_TOKEN_ID and MUX_TOKEN_SECRET in .env.local`)
        return
      }
      if (data.stream_key || data.already_exists) {
        setStreamKey(data.stream_key as string)
        setStatus('idle')
      } else {
        setCreateError((data.error as string) ?? 'Failed to create stream. Check your Mux API keys.')
      }
    } catch {
      setCreateError('Could not reach the server. Is npm run dev running?')
    } finally {
      setCreating(false)
    }
  }

  /* ── Status display ── */
  const statusDisplay = (() => {
    switch (status) {
      case 'active':
        return <span className="font-bebas text-[#FF3B3B] text-5xl tracking-[1px]">● LIVE NOW</span>
      case 'disconnected':
        return <span className="font-bebas text-[#FFD60A] text-5xl tracking-[1px]">⟳ RECONNECTING</span>
      case 'loading':
        return (
          <span className="font-bebas text-[#555555] text-5xl tracking-[1px] flex items-center gap-3">
            <Loader2 size={28} className="animate-spin" /> CHECKING
          </span>
        )
      case 'idle':
      default:
        return <span className="font-bebas text-white text-5xl tracking-[1px]">READY</span>
    }
  })()

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6">

      {/* Header row: status left, copy controls right */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
        <div>
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Stream Status</p>
          {statusDisplay}
        </div>

        {streamKey && (
          <div className="flex flex-col gap-2 sm:items-end">
            {/* Server URL */}
            <div className="flex items-center gap-2">
              <span className="font-inter text-[11px] text-[#555555] tracking-[2px] uppercase">Server URL</span>
              <div className="bg-[#0D0D0D] border border-[#333333] rounded-sm px-3 py-1.5 font-mono text-xs text-[#999999] truncate max-w-[180px]">
                {SERVER_URL}
              </div>
              <button
                onClick={() => copy(SERVER_URL, 'url')}
                className="w-8 h-8 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:bg-[#222222] rounded-sm transition-all"
              >
                {copiedUrl ? <Check size={13} className="text-[#00D4AA]" /> : <Copy size={13} />}
              </button>
            </div>

            {/* Stream Key */}
            <div className="flex items-center gap-2">
              <span className="font-inter text-[11px] text-[#555555] tracking-[2px] uppercase">Stream Key</span>
              <div className="bg-[#0D0D0D] border border-[#333333] rounded-sm px-3 py-1.5 font-mono text-xs text-[#999999] truncate max-w-[180px]">
                {showKey ? streamKey : '••••••••••••••••'}
              </div>
              <button
                onClick={() => setShowKey(!showKey)}
                className="w-8 h-8 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:bg-[#222222] rounded-sm transition-all"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                onClick={() => copy(streamKey, 'key')}
                className="w-8 h-8 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:bg-[#222222] rounded-sm transition-all"
              >
                {copiedKey ? <Check size={13} className="text-[#00D4AA]" /> : <Copy size={13} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!streamKey ? (
        <div className="border-t border-[#222222] pt-6 flex flex-col items-start gap-3">
          <p className="font-inter text-[#555555] text-sm">
            No stream configured yet. Create your Mux live stream to get your credentials.
          </p>
          <button
            onClick={createStream}
            disabled={creating}
            className="flex items-center gap-2 bg-white hover:bg-[#E5E5E5] disabled:opacity-50 text-black font-bebas tracking-[3px] px-6 py-2.5 rounded-sm transition-colors text-sm"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : null}
            {creating ? 'CREATING...' : 'CREATE LIVE STREAM'}
          </button>
          {createError && (
            <p className="font-inter text-[#FF3B3B] text-xs mt-1 max-w-sm">{createError}</p>
          )}
        </div>
      ) : (
        <div className="border-t border-[#222222] pt-4 flex items-center gap-4">
          <span className="font-inter text-[11px] text-[#555555]">Auto-refreshes every 30s</span>
          <a
            href="https://obsproject.com/wiki/OBS-Studio-Quickstart"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-inter text-[11px] text-[#999999] hover:text-white transition-colors tracking-[2px] uppercase"
          >
            OBS Setup Guide <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  )
}
