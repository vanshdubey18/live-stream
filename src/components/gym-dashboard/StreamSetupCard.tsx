'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Radio, Loader2 } from 'lucide-react'

interface Props {
  gymId: string
  streamKey?: string | null
}

export default function StreamSetupCard({ gymId }: Props) {
  const [status, setStatus] = useState<'loading' | 'idle' | 'active' | 'disconnected'>('loading')

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const res = await fetch(`/api/gym/stream-status?gym_id=${gymId}`)
        if (!res.ok || !mounted) return
        const d = await res.json()
        if (mounted) setStatus(d.status ?? 'idle')
      } catch { if (mounted) setStatus('idle') }
    }
    check()
    return () => { mounted = false }
  }, [gymId])

  const isLive = status === 'active'
  const isLoading = status === 'loading'

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6">
      <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Stream Status</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isLoading && <Loader2 size={20} className="animate-spin text-[#555555]" />}
          {isLive && <Radio size={20} className="text-[#FF3B3B] live-pulse" />}
          <span className={`font-bebas text-4xl tracking-[1px] ${
            isLoading ? 'text-[#555555]' : isLive ? 'text-[#FF3B3B]' : 'text-white'
          }`}>
            {isLoading ? 'CHECKING…' : isLive ? '● LIVE NOW' : 'OFFLINE'}
          </span>
        </div>

        <Link
          href="/gym-dashboard/stream"
          className={`px-5 py-2.5 rounded-sm font-bebas tracking-[2px] text-sm transition-colors ${
            isLive
              ? 'bg-[#1A1A1A] border border-[#FF3B3B]/30 text-[#FF3B3B] hover:bg-[#FF3B3B]/10'
              : 'bg-[#FF3B3B] text-white hover:bg-[#cc2f2f]'
          }`}
        >
          {isLive ? 'MANAGE STREAM' : 'GO LIVE'}
        </Link>
      </div>
    </div>
  )
}
