'use client'

import { useState } from 'react'
import { Trash2, Plus, Loader2 } from 'lucide-react'

interface Chapter {
  id: string
  timestamp_seconds: number
  label: string
}

function fmtSeconds(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function parseTimestamp(ts: string): number | null {
  const parts = ts.split(':').map(Number)
  if (parts.length === 2 && !parts.some(isNaN)) return parts[0] * 60 + parts[1]
  if (parts.length === 3 && !parts.some(isNaN)) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return null
}

export default function ChapterEditor({
  sessionId,
  replayUrl,
  durationSeconds,
  initialChapters,
}: {
  sessionId: string
  replayUrl: string | null
  durationSeconds: number | null
  initialChapters: Chapter[]
}) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [tsInput, setTsInput] = useState('')
  const [labelInput, setLabelInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const inputCls = 'bg-[#0D0D0D] border border-[#333333] rounded-sm px-3 py-2.5 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors'

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const seconds = parseTimestamp(tsInput)
    if (seconds === null) { setError('Use MM:SS format (e.g. 23:41)'); return }
    if (durationSeconds && seconds > durationSeconds) {
      setError(`Timestamp exceeds session duration (${fmtSeconds(durationSeconds)})`); return
    }
    setAdding(true)
    const res = await fetch('/api/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, timestamp_seconds: seconds, label: labelInput }),
    })
    const data = await res.json()
    setAdding(false)
    if (!res.ok) { setError(data.error ?? 'Failed to add chapter'); return }
    setChapters(p => [...p, data.chapter].sort((a, b) => a.timestamp_seconds - b.timestamp_seconds))
    setTsInput('')
    setLabelInput('')
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await fetch(`/api/chapters/${id}`, { method: 'DELETE' })
    setChapters(p => p.filter(c => c.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {!replayUrl && (
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-5 py-4">
          <p className="font-inter text-[#999999] text-sm">Replay is still processing. Chapter editor will be available once the recording is ready.</p>
        </div>
      )}

      {replayUrl && (
        <>
          {/* Chapter list */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#333333]">
              <div className="w-5 h-px bg-[#FF3B3B]" />
              <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase">Chapters</p>
              <span className="ml-auto font-inter text-[11px] text-[#555555]">{chapters.length}/50</span>
            </div>

            {chapters.length === 0 ? (
              <div className="relative px-5 py-10 text-center overflow-hidden">
                <span className="absolute inset-0 flex items-center justify-center font-bebas text-[80px] text-white/[0.03] leading-none select-none pointer-events-none">PIN</span>
                <p className="relative font-inter text-[#555555] text-sm">No chapters yet. Pin a moment below.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#222222]">
                {chapters.map(ch => (
                  <div key={ch.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="font-bebas text-[#FF3B3B] text-base tracking-[1px] tabular-nums shrink-0 w-12">
                      {fmtSeconds(ch.timestamp_seconds)}
                    </span>
                    <span className="font-inter text-sm text-white flex-1 truncate">{ch.label}</span>
                    <button
                      onClick={() => handleDelete(ch.id)}
                      disabled={deletingId === ch.id}
                      className="text-[#555555] hover:text-[#FF3B3B] transition-colors shrink-0"
                    >
                      {deletingId === ch.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add chapter form */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-5">
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Pin a Moment</p>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <div>
                  <label className="font-inter text-[11px] text-[#555555] tracking-[3px] uppercase block mb-1.5">Timestamp</label>
                  <input
                    className={`${inputCls} font-mono w-full`}
                    placeholder="23:41"
                    value={tsInput}
                    onChange={e => setTsInput(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="font-inter text-[11px] text-[#555555] tracking-[3px] uppercase block mb-1.5">Label</label>
                  <input
                    className={`${inputCls} w-full`}
                    placeholder="Triangle choke entry"
                    value={labelInput}
                    onChange={e => setLabelInput(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="font-inter text-[#FF3B3B] text-xs">{error}</p>}
              <button
                type="submit"
                disabled={adding || chapters.length >= 50}
                className="flex items-center gap-2 bg-[#FF3B3B] hover:bg-[#e03333] disabled:opacity-50 text-white font-bebas tracking-[2px] px-5 py-2.5 rounded-sm text-sm transition-colors"
              >
                {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                PIN CHAPTER
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
