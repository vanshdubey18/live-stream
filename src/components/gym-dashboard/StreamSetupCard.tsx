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
    if (status === 'loading') return { label: 'CHECKING…', color: 'text-[#555555]', spinner: true }
    switch (status) {
      case 'active':       return { label: '● LIVE NOW', color: 'text-[#FF3B3B]', spinner: false }
      case 'disconnected': return { label: '⟳ RECONNECTING', color: 'text-[#FFD60A]', spinner: false }
      default:             return { label: 'OFFLINE', color: 'text-white', spinner: false }
    }
  })()

  const isLive = status === 'active'

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">Stream Status</p>
          <span className={`font-bebas text-5xl tracking-[1px] flex items-center gap-3 ${display.color}`}>
            {display.spinner && <Loader2 size={28} className="animate-spin" />}
            {display.label}
          </span>
        </div>

        {/* Real action — go to the one-click stream page */}
        <Link
          href="/gym-dashboard/stream"
          className={`shrink-0 flex items-center gap-2 font-bebas tracking-[3px] text-sm px-5 py-3 rounded-sm transition-colors ${
            isLive
              ? 'bg-[#FF3B3B]/10 border border-[#FF3B3B]/40 text-[#FF3B3B] hover:bg-[#FF3B3B]/20'
              : 'bg-[#FF3B3B] text-white hover:bg-[#e03030]'
          }`}
        >
          {isLive ? <Radio size={14} className="live-pulse" /> : <Camera size={14} />}
          {isLive ? 'MANAGE STREAM' : 'GO LIVE'}
        </Link>
      </div>

      <div className="border-t border-[#222222] pt-4 mt-6">
        <p className="font-inter text-[11px] text-[#555555]">
          Status refreshes every 30s automatically. Start or stop your stream from the Stream Setup page.
        </p>
      </div>
    </div>
  )
}
