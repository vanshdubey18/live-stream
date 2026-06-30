'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, StopCircle } from 'lucide-react'


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
