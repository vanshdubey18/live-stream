'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Coach } from './CoachCard'

interface AddCoachModalProps {
  onClose: () => void
  onSaved: (coach: Coach) => void
}

const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling']

export default function AddCoachModal({ onClose, onSaved }: AddCoachModalProps) {
  const [form, setForm] = useState({ name: '', discipline: 'BJJ', beltRank: '', bio: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/gym/coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      onSaved(data.coach)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3B3B]/50 transition-colors'
  const labelCls = 'block text-[#999999] text-xs font-medium mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 " onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2A2A]">
          <h2 className="font-bebas text-xl text-white tracking-[1px]">ADD COACH</h2>
          <button onClick={onClose} className="text-[#999999] hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input className={inputCls} placeholder="Coach name" value={form.name}
              onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Discipline</label>
              <select className={inputCls} value={form.discipline} onChange={e => set('discipline', e.target.value)}>
                {DISCIPLINES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Belt / Rank <span className="text-[#555]">(optional)</span></label>
              <input className={inputCls} placeholder="e.g. Black Belt" value={form.beltRank}
                onChange={e => set('beltRank', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Bio <span className="text-[#555]">(optional)</span></label>
            <textarea className={`${inputCls} resize-none h-24`} placeholder="Brief background..."
              value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>
          {error && (
            <p className="font-inter text-[#FF3B3B] text-sm bg-[#FF3B3B]/5 border border-[#FF3B3B]/20 rounded-sm px-4 py-3">{error}</p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-[#333333] hover:border-[#333333] text-white text-sm font-semibold rounded-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-white hover:bg-[#E5E5E5] disabled:opacity-50 text-black font-bebas tracking-[2px] text-sm rounded-sm transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin text-black" /> : 'SAVE COACH'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
