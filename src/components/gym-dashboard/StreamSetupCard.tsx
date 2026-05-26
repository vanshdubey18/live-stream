'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

const SERVER_URL = 'rtmp://live.mux.com/app'

type StreamStatus = 'idle' | 'active' | 'disconnected' | 'no_stream' | 'loading' | 'error' | 'provisioning'

interface Props {
  gymId: string
  streamKey?: string | null
}

export default function StreamSetupCard({ gymId, streamKey: initialKey }: Props) {
  const [streamKey, setStreamKey] = useState<string | null>(initialKey ?? null)
  const [status, setStatus] = useState<StreamStatus>(initialKey ? 'loading' : 'provisioning')
  const [showCredentials, setShowCredentials] = useState(false)
  const [copied, setCopied] = useState<'url' | 'key' | null>(null)

  function copy(text: string, which: 'url' | 'key') {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  const provision = useCallback(async () => {
    try {
      const res = await fetch('/api/gym/create-stream', { method: 'POST' })
      const data = await res.json()
      if (data.stream_key || data.already_exists) {
        setStreamKey(data.stream_key as string)
        setStatus('idle')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }, [])

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
      if (!res.ok) { setStatus('error'); return }
      const data = await res.json()
      if (!data.has_stream) {
        await provision()
        return
      }
      setStatus(data.status as StreamStatus)
    } catch {
      setStatus('error')
    }
  }, [gymId, provision])

  useEffect(() => {
    if (!streamKey) {
      provision()
    } else {
      pollStatus()
    }
    const id = setInterval(pollStatus, 30_000)
    return () => clearInterval(id)
  }, [streamKey, pollStatus, provision])

  const statusDisplay = (() => {
    switch (status) {
      case 'active':
        return { label: '● LIVE NOW', color: 'text-[#FF3B3B]' }
      case 'disconnected':
        return { label: '⟳ RECONNECTING', color: 'text-[#FFD60A]' }
      case 'provisioning':
        return { label: 'SETTING UP…', color: 'text-[#555555]' }
      case 'loading':
        return { label: 'CHECKING…', color: 'text-[#555555]' }
      case 'error':
        return { label: 'UNAVAILABLE', color: 'text-[#FF3B3B]' }
      default:
        return { label: 'READY', color: 'text-white' }
    }
  })()

  const isProvisioning = status === 'provisioning' || status === 'loading'

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Stream Status</p>
          <span className={`font-bebas text-5xl tracking-[1px] flex items-center gap-3 ${statusDisplay.color}`}>
            {isProvisioning && <Loader2 size={28} className="animate-spin" />}
            {statusDisplay.label}
          </span>
        </div>

        {streamKey && (
          <button
            onClick={() => setShowCredentials(p => !p)}
            className="flex items-center gap-1.5 font-inter text-[11px] text-[#555555] hover:text-white tracking-[2px] uppercase transition-colors"
          >
            Streaming Setup {showCredentials ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Credentials — collapsed by default, for OBS/streaming software */}
      {streamKey && showCredentials && (
        <div className="border-t border-[#222222] pt-5 space-y-3">
          <p className="font-inter text-[#555555] text-xs leading-relaxed">
            Open your streaming software (OBS, Streamlabs, etc.) and paste these under{' '}
            <span className="text-white">Settings → Stream → Custom RTMP</span>.
          </p>

          {[
            { label: 'Server URL', value: SERVER_URL, which: 'url' as const },
            { label: 'Stream Key', value: streamKey, which: 'key' as const },
          ].map(({ label, value, which }) => (
            <div key={label}>
              <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-1.5">{label}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#0D0D0D] border border-[#333333] rounded-sm px-3 py-2 font-mono text-xs text-[#999999] truncate">
                  {value}
                </div>
                <button
                  onClick={() => copy(value, which)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:bg-[#222222] rounded-sm transition-all"
                >
                  {copied === which ? <Check size={12} className="text-[#00D4AA]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto-refresh hint */}
      {streamKey && !showCredentials && (
        <div className="border-t border-[#222222] pt-4">
          <p className="font-inter text-[11px] text-[#555555]">Status refreshes every 30s automatically.</p>
        </div>
      )}
    </div>
  )
}
