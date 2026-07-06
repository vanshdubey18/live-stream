'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Loader2, Radio, Camera } from 'lucide-react'

type StreamStatus = 'idle' | 'active' | 'disconnected' | 'loading'

interface Props {
  gymId: string
}

export default function StreamSetupCard({ gymId }: Props) {
  const [status, setStatus] = useState<StreamStatus>('loading')

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
      if (!res.ok) return
      const data = await res.json()
      setStatus((data.status ?? 'idle') as StreamStatus)
    } catch {
      // network error — leave status unchanged
    }
  }, [gymId])

  useEffect(() => {
    pollStatus()
    const id = setInterval(pollStatus, 30_000)
    return () => clearInterval(id)
  }, [pollStatus])

  const display = (() => {
    if (status === 'loading') return { label: 'CHECKING…', color: 'text-[#7a7568]', spinner: true }
    switch (status) {
      case 'active':       return { label: '● LIVE NOW', color: 'text-[#b3402f]', spinner: false }
      case 'disconnected': return { label: '⟳ RECONNECTING', color: 'text-[#FFD60A]', spinner: false }
      default:             return { label: 'OFFLINE', color: 'text-[#f0eadc]', spinner: false }
    }
  })()

  const isLive = status === 'active'

  return (
    <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-2">Stream Status</p>
          <span className={`font-mincho text-5xl tracking-[1px] flex items-center gap-3 ${display.color}`}>
            {display.spinner && <Loader2 size={28} className="animate-spin" />}
            {display.label}
          </span>
        </div>

        {/* Real action — go to the one-click stream page */}
        <Link
          href="/gym-dashboard/stream"
          className={`shrink-0 flex items-center gap-2 font-mincho tracking-[3px] text-sm px-5 py-3 rounded-sm transition-colors ${
            isLive
              ? 'bg-[#b3402f]/10 border border-[#b3402f]/40 text-[#b3402f] hover:bg-[#b3402f]/20'
              : 'bg-[#b3402f] text-[#f0eadc] hover:bg-[#942f22]'
          }`}
        >
          {isLive ? <Radio size={14} className="live-pulse" /> : <Camera size={14} />}
          {isLive ? 'MANAGE STREAM' : 'GO LIVE'}
        </Link>
      </div>

      <div className="border-t border-[#242420] pt-4 mt-6">
        <p className="font-mincho text-[11px] text-[#7a7568]">
          Status refreshes every 30s automatically. Start or stop your stream from the Stream Setup page.
        </p>
      </div>
    </div>
  )
}
