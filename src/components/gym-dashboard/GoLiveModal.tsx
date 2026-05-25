'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, X, ExternalLink, Loader2, StopCircle } from 'lucide-react'

const SERVER_URL = 'rtmp://live.mux.com/app'

interface Props {
  sessionId: string
  sessionTitle: string
  streamKey: string | null
  onClose: () => void
  onWentLive: (sessionId: string) => void
  onEnded: (sessionId: string) => void
}

type Stage = 'setup' | 'live'

export default function GoLiveModal({
  sessionId,
  sessionTitle,
  streamKey,
  onClose,
  onWentLive,
  onEnded,
}: Props) {
  const [stage, setStage] = useState<Stage>('setup')
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function copy(text: string, which: 'url' | 'key') {
    navigator.clipboard.writeText(text)
    if (which === 'url') { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }
    else { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000) }
  }

  async function handleGoLive() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/gym/session/go-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to go live')
        return
      }
      setStage('live')
      onWentLive(sessionId)
    } finally {
      setLoading(false)
    }
  }

  async function handleEndStream() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/gym/session/end-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to end stream')
        return
      }
      onEnded(sessionId)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#333333] flex items-center justify-between">
          <div>
            {stage === 'live' ? (
              <span className="font-bebas text-[#FF3B3B] text-2xl tracking-[1px]">● LIVE NOW</span>
            ) : (
              <span className="font-bebas text-white text-2xl tracking-[1px]">GO LIVE</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:bg-[#222222] rounded-sm transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Session title */}
          <div className="border-b border-[#222222] pb-4">
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-1">Session</p>
            <p className="font-inter text-white text-sm font-medium">{sessionTitle}</p>
          </div>

          <AnimatePresence mode="wait">
            {stage === 'setup' ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="font-inter text-[#555555] text-xs leading-relaxed">
                  Copy these into OBS → Settings → Stream, then click{' '}
                  <span className="text-white">Start Streaming</span>.
                </p>

                {/* Server URL */}
                <div>
                  <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Server URL</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#0D0D0D] border border-[#333333] rounded-sm px-3 py-2.5 font-mono text-xs text-[#999999] truncate">
                      {SERVER_URL}
                    </div>
                    <button
                      onClick={() => copy(SERVER_URL, 'url')}
                      className="shrink-0 w-9 h-9 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:bg-[#222222] rounded-sm transition-all"
                    >
                      {copiedUrl ? <Check size={13} className="text-[#00D4AA]" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Stream Key */}
                <div>
                  <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Stream Key</p>
                  {streamKey ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#0D0D0D] border border-[#333333] rounded-sm px-3 py-2.5 font-mono text-xs text-[#999999] truncate">
                        {streamKey}
                      </div>
                      <button
                        onClick={() => copy(streamKey, 'key')}
                        className="shrink-0 w-9 h-9 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:bg-[#222222] rounded-sm transition-all"
                      >
                        {copiedKey ? <Check size={13} className="text-[#00D4AA]" /> : <Copy size={13} />}
                      </button>
                    </div>
                  ) : (
                    <p className="font-inter text-[#FFD60A] text-xs bg-[#FFD60A]/5 border border-[#FFD60A]/20 rounded-sm px-3 py-2.5">
                      No stream configured. Go to Stream Setup and create a stream first.
                    </p>
                  )}
                </div>

                <a
                  href="https://obsproject.com/wiki/OBS-Studio-Quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-inter text-[11px] text-[#555555] hover:text-white transition-colors tracking-[2px] uppercase"
                >
                  OBS Setup Guide <ExternalLink size={10} />
                </a>

                {error && <p className="font-inter text-[#FF3B3B] text-xs">{error}</p>}

                <button
                  onClick={handleGoLive}
                  disabled={loading || !streamKey}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bebas tracking-[3px] py-3 rounded-sm text-sm transition-colors"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  {loading ? 'STARTING...' : "I'M LIVE IN OBS — GO LIVE"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-4 space-y-1">
                  <p className="font-bebas text-white text-lg tracking-[1px]">YOUR CLASS IS LIVE</p>
                  <p className="font-inter text-[#555555] text-xs">
                    Members can now watch at your gym page. Stop OBS when you finish.
                  </p>
                </div>

                {error && <p className="font-inter text-[#FF3B3B] text-xs">{error}</p>}

                <button
                  onClick={handleEndStream}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF3B3B] hover:bg-[#cc2f2f] text-white font-bebas tracking-[3px] py-3 rounded-sm text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <StopCircle size={14} />}
                  {loading ? 'ENDING...' : 'END STREAM'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
