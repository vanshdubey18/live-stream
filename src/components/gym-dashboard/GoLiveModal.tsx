'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, X, Loader2, StopCircle, ChevronDown, ChevronUp } from 'lucide-react'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCredentials, setShowCredentials] = useState(false)
  const [copied, setCopied] = useState<'url' | 'key' | null>(null)

  function copy(text: string, which: 'url' | 'key') {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

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
          {stage === 'live'
            ? <span className="font-bebas text-[#FF3B3B] text-2xl tracking-[1px]">● LIVE NOW</span>
            : <span className="font-bebas text-white text-2xl tracking-[1px]">GO LIVE</span>
          }
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
                className="space-y-5"
              >
                <p className="font-inter text-[#555555] text-sm leading-relaxed">
                  Make sure your camera and microphone are ready, then click <span className="text-white">Go Live</span>.
                  Members will see your stream when they open the app.
                </p>

                {error && <p className="font-inter text-[#FF3B3B] text-xs">{error}</p>}

                <button
                  onClick={handleGoLive}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bebas tracking-[3px] py-3 rounded-sm text-sm transition-colors"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  {loading ? 'STARTING…' : 'GO LIVE'}
                </button>

                {/* Streaming software credentials — collapsed by default */}
                {streamKey && (
                  <div>
                    <button
                      onClick={() => setShowCredentials(p => !p)}
                      className="flex items-center gap-1.5 font-inter text-[11px] text-[#555555] hover:text-white tracking-[2px] uppercase transition-colors"
                    >
                      Using streaming software?
                      {showCredentials ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>

                    {showCredentials && (
                      <div className="mt-4 space-y-3">
                        <p className="font-inter text-[#555555] text-xs leading-relaxed">
                          Paste these into OBS or Streamlabs under{' '}
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
                  </div>
                )}
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
                    Members can now join. End the stream when your class is finished.
                  </p>
                </div>

                {error && <p className="font-inter text-[#FF3B3B] text-xs">{error}</p>}

                <button
                  onClick={handleEndStream}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF3B3B] hover:bg-[#cc2f2f] text-white font-bebas tracking-[3px] py-3 rounded-sm text-sm transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <StopCircle size={14} />}
                  {loading ? 'ENDING…' : 'END STREAM'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
