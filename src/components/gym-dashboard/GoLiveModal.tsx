'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, X, Radio, StopCircle, ExternalLink, Loader2 } from 'lucide-react'

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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="relative bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 border-b border-white/5 flex items-center justify-between ${stage === 'live' ? 'bg-[#FF3B3B]/10' : ''}`}>
          <div className="flex items-center gap-3">
            {stage === 'live' ? (
              <span className="flex items-center gap-2 text-[#FF3B3B] font-black text-base">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B3B] animate-pulse" />
                LIVE NOW
              </span>
            ) : (
              <span className="text-white font-bold text-base flex items-center gap-2">
                <Radio size={17} className="text-[#FF3B3B]" /> Go Live
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Session title */}
          <p className="text-[#999999] text-sm">
            Session: <span className="text-white font-medium">{sessionTitle}</span>
          </p>

          <AnimatePresence mode="wait">
            {stage === 'setup' ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-[#999999] text-sm">
                  Copy these into OBS → Settings → Stream, then click <strong className="text-white">Start Streaming</strong>.
                </p>

                {/* Server URL */}
                <div>
                  <p className="text-[#999999] text-xs mb-1.5">Server URL</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#0D0D0D] border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs font-mono truncate">
                      {SERVER_URL}
                    </div>
                    <button
                      onClick={() => copy(SERVER_URL, 'url')}
                      className="shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[#999999] hover:text-white transition-all"
                    >
                      {copiedUrl ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Stream Key */}
                <div>
                  <p className="text-[#999999] text-xs mb-1.5">Stream Key</p>
                  {streamKey ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#0D0D0D] border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs font-mono truncate">
                        {streamKey}
                      </div>
                      <button
                        onClick={() => copy(streamKey, 'key')}
                        className="shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[#999999] hover:text-white transition-all"
                      >
                        {copiedKey ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                  ) : (
                    <p className="text-yellow-400 text-xs bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-3 py-2.5">
                      No stream configured. Go to Stream Setup and create a stream first.
                    </p>
                  )}
                </div>

                <a
                  href="https://obsproject.com/wiki/OBS-Studio-Quickstart"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#FF3B3B] text-xs font-medium hover:underline"
                >
                  OBS setup guide <ExternalLink size={11} />
                </a>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  onClick={handleGoLive}
                  disabled={loading || !streamKey}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF3B3B] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors"
                >
                  {loading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  {loading ? 'Starting…' : "I'm live in OBS — Go Live"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-[#FF3B3B]/5 border border-[#FF3B3B]/20 rounded-xl px-4 py-4 text-center space-y-1">
                  <p className="text-white font-bold text-sm">Your class is live!</p>
                  <p className="text-[#999999] text-xs">Members can now watch at your gym page. Stop OBS when you finish.</p>
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  onClick={handleEndStream}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#111] hover:bg-white/5 border border-red-500/30 text-red-400 hover:text-red-300 font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {loading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <StopCircle size={15} />}
                  {loading ? 'Ending stream…' : 'End Stream'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
