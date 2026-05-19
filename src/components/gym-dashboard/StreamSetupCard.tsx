'use client'

import { useState } from 'react'
import { Copy, Eye, EyeOff, ExternalLink, Check } from 'lucide-react'

const SERVER_URL = 'rtmp://live.mux.com/app'
const STREAM_KEY = 'live_xxxxxxxxxxxxxxxx_yyyyyy'

export default function StreamSetupCard({ isLive = false }: { isLive?: boolean }) {
  const [showKey, setShowKey] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  function copy(text: string, which: 'url' | 'key') {
    navigator.clipboard.writeText(text)
    if (which === 'url') { setCopiedUrl(true); setTimeout(() => setCopiedUrl(false), 2000) }
    else { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000) }
  }

  return (
    <div className="bg-[#111111] border border-[#DC2626]/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-bold text-lg">🎥 Stream Setup</h2>
        {isLive ? (
          <span className="flex items-center gap-2 bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#DC2626] text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" /> LIVE NOW
          </span>
        ) : (
          <span className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Ready to stream
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-3">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3">
            <p className="text-[#888888] text-xs mb-1">Status</p>
            <p className="text-white text-sm font-medium">{isLive ? '🔴 Streaming live' : 'Offline'}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3">
            <p className="text-[#888888] text-xs mb-1">Last streamed</p>
            <p className="text-white text-sm font-medium">2 hours ago</p>
          </div>
          <a href="#" className="flex items-center gap-1.5 text-[#DC2626] text-sm font-medium hover:underline">
            How to set up OBS <ExternalLink size={13} />
          </a>
        </div>

        {/* Right */}
        <div className="space-y-3">
          {/* Server URL */}
          <div>
            <p className="text-[#888888] text-xs mb-1.5">Server URL</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs font-mono truncate">
                {SERVER_URL}
              </div>
              <button onClick={() => copy(SERVER_URL, 'url')}
                className="shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[#888888] hover:text-white transition-all">
                {copiedUrl ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Stream Key */}
          <div>
            <p className="text-[#888888] text-xs mb-1.5">Stream Key</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl px-3 py-2.5 text-white text-xs font-mono truncate">
                {showKey ? STREAM_KEY : '••••••••••••••••••••'}
              </div>
              <button onClick={() => setShowKey(!showKey)}
                className="shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[#888888] hover:text-white transition-all">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={() => copy(STREAM_KEY, 'key')}
                className="shrink-0 w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[#888888] hover:text-white transition-all">
                {copiedKey ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
