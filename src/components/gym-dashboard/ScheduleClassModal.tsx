'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Coach {
  id: string
  name: string
}

interface ScheduleClassModalProps {
  coaches: Coach[]
  onClose: () => void
  onScheduled: (cls: any) => void
}

export interface ScheduledClass {
  id: string
  title: string
  discipline: string
  scheduled_at: string
  duration_minutes: number
  level: string
  status: string
}

const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing']
const DURATIONS = ['15', '30', '45', '60', '90']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function ScheduleClassModal({ coaches, onClose, onScheduled }: ScheduleClassModalProps) {
  const [form, setForm] = useState({
    title: '',
    discipline: 'BJJ',
    coachId: coaches[0]?.id ?? '',
    date: '',
    time: '',
    duration: '60',
    level: 'Intermediate',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const scheduledAt = new Date(`${form.date}T${form.time}`)
    if (scheduledAt <= new Date()) {
      setError('Scheduled time must be in the future.')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/gym/session/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          discipline: form.discipline,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: parseInt(form.duration),
          level: form.level,
          coachId: form.coachId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      onScheduled(data.session)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#141410] border border-[#322f26] rounded-sm px-4 py-2.5 text-[#f0eadc] text-sm focus:outline-none focus:border-[#f0eadc] transition-colors'
  const labelCls = 'block font-mincho text-[11px] text-[#a29c8c] tracking-[3px] uppercase mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a20]">
          <h2 className="font-mincho text-xl text-[#f0eadc] tracking-[1px]">SCHEDULE NEW CLASS</h2>
          <button onClick={onClose} className="text-[#7a7568] hover:text-[#f0eadc] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Class Title</label>
            <input className={inputCls} placeholder="e.g. Advanced Guard Passing" value={form.title}
              onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Discipline</label>
              <select className={inputCls} value={form.discipline} onChange={e => set('discipline', e.target.value)}>
                {DISCIPLINES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Coach</label>
              <select className={inputCls} value={form.coachId} onChange={e => set('coachId', e.target.value)}>
                <option value="">No coach assigned</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input type="time" className={inputCls} value={form.time}
                onChange={e => set('time', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Duration (min)</label>
              <select className={inputCls} value={form.duration} onChange={e => set('duration', e.target.value)}>
                {DURATIONS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Level</label>
              <select className={inputCls} value={form.level} onChange={e => set('level', e.target.value)}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <p className="font-mincho text-sm text-[#b3402f] bg-[#b3402f]/5 border border-[#b3402f]/20 rounded-sm px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-[#322f26] text-[#f0eadc] text-sm font-semibold rounded-sm hover:bg-[#242420] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-[#f0eadc] hover:bg-[#e4dcc8] disabled:opacity-50 text-[#141410] font-mincho tracking-[2px] text-sm rounded-sm transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin text-[#141410]" /> : 'SCHEDULE CLASS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
