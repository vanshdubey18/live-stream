'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Hls from 'hls.js'

interface AIData {
  summary: string
  techniques: { name: string; timestamp: string | null }[]
  moments: { timestamp: string; label: string }[]
  coachQuote: string
}

interface Props {
  title: string
  discipline: string
  level: string
  coach: string | null
  gym: string | null
  hlsUrl?: string
  aiData: AIData | null
}

export default function InstructionalClient({ title, discipline, level, coach, gym, hlsUrl, aiData }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [jumpTo, setJumpTo] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !hlsUrl) return
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl
      return
    }
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      return () => hls.destroy()
    }
  }, [hlsUrl])

  function seekTo(ts: string) {
    const [m, s] = ts.split(':').map(Number)
    if (videoRef.current) videoRef.current.currentTime = m * 60 + (s || 0)
    setJumpTo(ts)
    videoRef.current?.play()
    setTimeout(() => setJumpTo(null), 1500)
  }

  return (
    <div className="min-h-screen bg-[#141410]">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Link href="/dashboard/instructionals" className="inline-flex items-center gap-2 font-mincho text-xs text-[#7a7568] hover:text-[#f0eadc] transition-colors mb-4">
          <ArrowLeft size={14} /> Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div>
            <div className="relative aspect-video bg-black rounded-sm overflow-hidden border border-[#322f26]">
              <video ref={videoRef} controls className="absolute inset-0 w-full h-full" />
            </div>

            <div className="mt-4">
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">
                {discipline} · {level}
              </p>
              <h1 className="font-mincho text-3xl text-[#f0eadc] tracking-[1px] mt-1">{title}</h1>
              <p className="font-mincho text-sm text-[#7a7568] mt-1">
                {coach ?? 'Coach'}{gym ? ` · ${gym}` : ''}
              </p>
            </div>
          </div>

          <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm h-fit">
            <div className="px-5 py-4 border-b border-[#2a2a20]">
              <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Breakdown</p>
            </div>

            {aiData ? (
              <div className="px-5 py-5 space-y-6">
                <div>
                  <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[3px] uppercase mb-3">Techniques Covered</p>
                  <div className="space-y-1">
                    {aiData.techniques.map(t => (
                      <button key={t.name} onClick={() => t.timestamp && seekTo(t.timestamp)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-sm text-left transition-colors ${
                          jumpTo === t.timestamp ? 'bg-[#b3402f]/10' : 'hover:bg-[#242420]'
                        }`}>
                        <span className="font-mincho text-sm text-[#f0eadc]">{t.name}</span>
                        {t.timestamp && <span className="font-mincho text-xs text-[#7a7568] tabular-nums">{t.timestamp}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {aiData.coachQuote && (
                  <div className="border-l-2 border-[#b3402f] pl-4">
                    <p className="font-mincho text-sm text-[#a29c8c] italic leading-relaxed">&ldquo;{aiData.coachQuote}&rdquo;</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="font-mincho text-[#7a7568] text-sm">Breakdown is processing — check back shortly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
