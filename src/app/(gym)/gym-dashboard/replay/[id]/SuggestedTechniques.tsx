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
    <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#322f26]">
        <Bot size={13} className="text-[#7a7568]" />
        <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">AI Suggested Techniques</p>
        {unverifiedCount > 0 && (
          <span className="ml-auto font-mincho text-[11px] text-[#FFD60A]">{unverifiedCount} to review</span>
        )}
      </div>
      <div className="divide-y divide-[#242420]">
        {items.map(t => (
          <div key={t.technique_id} className="flex items-center gap-4 px-5 py-3">
            {t.timestamp_seconds != null && (
              <span className="font-mincho text-[#b3402f] text-base tracking-[1px] tabular-nums shrink-0 w-12">
                {fmtSeconds(t.timestamp_seconds)}
              </span>
            )}
            <span className="font-mincho text-sm text-[#f0eadc] flex-1 truncate">{t.name}</span>
            {t.verified ? (
              <span className="font-mincho text-[11px] text-[#00D4AA] flex items-center gap-1 shrink-0">
                <Check size={12} /> Confirmed
              </span>
            ) : busyId === t.technique_id ? (
              <Loader2 size={14} className="animate-spin text-[#7a7568] shrink-0" />
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => act(t.technique_id, 'verify')}
                  className="w-7 h-7 flex items-center justify-center border border-[#322f26] text-[#7a7568] hover:text-[#00D4AA] hover:border-[#00D4AA] rounded-sm transition-all"
                  title="Confirm — this was taught"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={() => act(t.technique_id, 'reject')}
                  className="w-7 h-7 flex items-center justify-center border border-[#322f26] text-[#7a7568] hover:text-[#b3402f] hover:border-[#b3402f] rounded-sm transition-all"
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
