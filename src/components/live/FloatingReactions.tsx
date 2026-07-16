'use client'

import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface Burst { id: number; emoji: string; x: number }

// Renders floating emoji reactions rising over whatever it's absolutely
// positioned inside (the video container) — mirrors Twitch/YouTube's
// on-screen reaction bursts. Purely ephemeral: broadcast-only Realtime
// channel, nothing persisted to the database.
export default function FloatingReactions({ sessionId }: { sessionId: string }) {
  const [bursts, setBursts] = useState<Burst[]>([])
  const idRef = useRef(0)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`live-reactions-${sessionId}`)
    channel.on('broadcast', { event: 'reaction' }, (payload) => {
      const emoji = payload.payload?.emoji
      if (!emoji) return
      const id = idRef.current++
      setBursts(p => [...p, { id, emoji, x: 10 + Math.random() * 80 }])
      setTimeout(() => setBursts(p => p.filter(b => b.id !== id)), 2200)
    })
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      <AnimatePresence>
        {bursts.map(b => (
          <motion.span
            key={b.id}
            initial={{ opacity: 0, y: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -180, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.1, ease: 'easeOut' }}
            className="absolute bottom-10 text-3xl select-none"
            style={{ left: `${b.x}%` }}
          >
            {b.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
