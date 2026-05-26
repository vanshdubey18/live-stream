'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface ScheduleClassModalProps {
  onClose: () => void
  onScheduled: (cls: ScheduledClass) => void
}

export interface ScheduledClass {
  id: string
  date: string
  time: string
  title: string
  discipline: string
  coach: string
  level: string
  duration: string
  status: 'Scheduled'
}

const COACHES = ['Rahul Sharma', 'Arjun Mehta', 'Dev Singh', 'Vikram Patel']
const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling']
const DURATIONS = ['15', '30', '45', '60', '90']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function ScheduleClassModal({ onClose, onScheduled }: ScheduleClassModalProps) {
  const [form, setForm] = useState({
    title: '', discipline: 'BJJ', coach: COACHES[0],
    date: '', time: '', duration: '60', level: 'Intermediate', description: '',
  })
  const [loading, setLoading] = useState(false)

  function set(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      onScheduled({
        id: Math.random().toString(36).slice(2),
        date: form.date,
        time: form.time,
        title: form.title,
        discipline: form.discipline,
        coach: form.coach,
        level: form.level,
        duration: `${form.duration} min`,
        status: 'Scheduled',
      })
      setLoading(false)
      onClose()
    }, 600)
  }

  const inputCls = 'w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3B3B]/50 transition-colors'
  const labelCls = 'block text-[#999999] text-xs font-medium mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 " onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <h2 className="font-bebas text-xl text-white tracking-[1px]">SCHEDULE NEW CLASS</h2>
          <button onClick={onClose} className="text-[#999999] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Class Title</label>
            <input className={inputCls} placeholder="e.g. Advanced Guard Passing" value={form.title}
              onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Discipline</label>
              <select className={inputCls} value={form.discipline} onChange={e => set('discipline', e.target.value)}>
                {DISCIPLINES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Coach</label>
              <select className={inputCls} value={form.coach} onChange={e => set('coach', e.target.value)}>
                {COACHES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date</label>
              <input type="date" className={inputCls} value={form.date}
                onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input type="time" className={inputCls} value={form.time}
                onChange={e => set('time', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Duration (minutes)</label>
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

          <div>
            <label className={labelCls}>Description <span className="text-[#555]">(optional)</span></label>
            <textarea className={`${inputCls} resize-none h-20`} placeholder="What will members learn?"
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-[#333333] hover:border-[#333333] text-white text-sm font-semibold rounded-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-white hover:bg-[#E5E5E5] disabled:opacity-50 text-black font-bebas tracking-[2px] text-sm rounded-sm transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin text-black" /> : 'SCHEDULE CLASS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
