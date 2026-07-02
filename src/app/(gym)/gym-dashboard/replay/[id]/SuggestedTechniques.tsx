'use client'

import { useState } from 'react'
import { Check, X, Loader2, Bot } from 'lucide-react'

interface SuggestedTechnique {
  technique_id: string
  name: string
  timestamp_seconds: number | null
  verified: boolean
}

function fmtSeconds(s: number | null) {
  if (s == null) return null
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function SuggestedTechniques({
  sessionId,
  initialTechniques,
}: {
  sessionId: string
  initialTechniques: SuggestedTechnique[]
}) {
  const [items, setItems] = useState(initialTechniques)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function act(techniqueId: string, action: 'verify' | 'reject') {
    setBusyId(techniqueId)
    const res = await fetch('/api/gym/session-techniques', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, technique_id: techniqueId, action }),
    })
    if (res.ok) {
      setItems(p => action === 'reject'
        ? p.filter(t => t.technique_id !== techniqueId)
        : p.map(t => t.technique_id === techniqueId ? { ...t, verified: true } : t))
    }
    setBusyId(null)
  }

  if (items.length === 0) return null

  const unverifiedCount = items.filter(t => !t.verified).length

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#333333]">
        <Bot size={13} className="text-[#555555]" />
        <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">AI Suggested Techniques</p>
        {unverifiedCount > 0 && (
          <span className="ml-auto font-inter text-[11px] text-[#FFD60A]">{unverifiedCount} to review</span>
        )}
      </div>
      <div className="divide-y divide-[#222222]">
        {items.map(t => (
          <div key={t.technique_id} className="flex items-center gap-4 px-5 py-3">
            {t.timestamp_seconds != null && (
              <span className="font-bebas text-[#FF3B3B] text-base tracking-[1px] tabular-nums shrink-0 w-12">
                {fmtSeconds(t.timestamp_seconds)}
              </span>
            )}
            <span className="font-inter text-sm text-white flex-1 truncate">{t.name}</span>
            {t.verified ? (
              <span className="font-inter text-[11px] text-[#00D4AA] flex items-center gap-1 shrink-0">
                <Check size={12} /> Confirmed
              </span>
            ) : busyId === t.technique_id ? (
              <Loader2 size={14} className="animate-spin text-[#555555] shrink-0" />
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => act(t.technique_id, 'verify')}
                  className="w-7 h-7 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-[#00D4AA] hover:border-[#00D4AA] rounded-sm transition-all"
                  title="Confirm — this was taught"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => act(t.technique_id, 'reject')}
                  className="w-7 h-7 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-[#FF3B3B] hover:border-[#FF3B3B] rounded-sm transition-all"
                  title="Remove — not accurate"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
