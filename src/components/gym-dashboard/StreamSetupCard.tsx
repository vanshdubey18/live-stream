'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, Clock } from 'lucide-react'
import { formatCountdown } from '@/lib/countdown'

interface NextSession {
  id: string
  title: string
  scheduled_at: string
}

interface Props {
  gymId: string
  nextSession?: NextSession | null
}

export default function StreamSetupCard({ nextSession }: Props) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!nextSession) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [nextSession])

  const href = nextSession
    ? `/gym-dashboard/stream?session_id=${nextSession.id}`
    : '/gym-dashboard/stream'

  return (
    <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-2">Go Live</p>
          {nextSession ? (
            <div className="flex items-center gap-2 font-mincho">
              <Clock size={14} className="text-[#a29c8c] shrink-0" />
              <span className="text-sm text-[#a29c8c] truncate">
                {nextSession.title} starts in{' '}
                <span className="text-[#f0eadc] tabular-nums tracking-[1px]">
                  {formatCountdown(nextSession.scheduled_at, now)}
                </span>
              </span>
            </div>
          ) : (
            <p className="font-mincho text-sm text-[#7a7568]">No class scheduled — go live any time.</p>
          )}
        </div>

        <Link
          href={href}
          className="shrink-0 flex items-center gap-2 bg-[#b3402f] hover:bg-[#942f22] text-[#f0eadc] font-mincho tracking-[3px] text-sm px-5 py-3 rounded-sm transition-colors"
        >
          <Camera size={14} />
          GO LIVE
        </Link>
      </div>
    </div>
  )
}
