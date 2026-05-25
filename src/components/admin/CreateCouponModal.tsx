'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

export interface Coupon {
  id: string
  code: string
  type: 'percent_off' | 'free_days'
  value: number
  planType: string
  maxUses: number
  timesUsed: number
  expiresAt: string
  isActive: boolean
  notes: string
}

interface CreateCouponModalProps {
  onClose: () => void
  onCreated: (c: Coupon) => void
}

const PLANS = ['All', 'Single', 'Dual', 'Full MMA']

export default function CreateCouponModal({ onClose, onCreated }: CreateCouponModalProps) {
  const [form, setForm] = useState({
    code: '', type: 'percent_off', value: '', planType: 'All',
    maxUses: '100', expiresAt: '', notes: '',
  })
  const [loading, setLoading] = useState(false)

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      onCreated({
        id: Math.random().toString(36).slice(2),
        code: form.code.toUpperCase(),
        type: form.type as Coupon['type'],
        value: Number(form.value),
        planType: form.planType,
        maxUses: Number(form.maxUses),
        timesUsed: 0,
        expiresAt: form.expiresAt || 'Never',
        isActive: true,
        notes: form.notes,
      })
      setLoading(false)
      onClose()
    }, 500)
  }

  const inputCls = 'w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#FF3B3B]/50 transition-colors'
  const labelCls = 'block text-[#999999] text-xs font-medium mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">Create Coupon</h2>
          <button onClick={onClose} className="text-[#999999] hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Coupon Code</label>
            <input className={`${inputCls} uppercase`} placeholder="e.g. PILOT100"
              value={form.code} onChange={e => set('code', e.target.value)} required />
          </div>

          <div>
            <label className={labelCls}>Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['percent_off', 'free_days'] as const).map(t => (
                <label key={t} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm
                  ${form.type === t ? 'border-[#FF3B3B]/40 bg-[#FF3B3B]/5 text-white' : 'border-white/5 text-[#999999] hover:border-white/10'}`}>
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => set('type', t)} className="hidden" />
                  {t === 'percent_off' ? '% Percentage off' : '📅 Free days'}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{form.type === 'percent_off' ? 'Discount %' : 'Free Days'}</label>
              <input type="number" className={inputCls} placeholder={form.type === 'percent_off' ? '50' : '30'}
                value={form.value} onChange={e => set('value', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Applies To Plan</label>
              <select className={inputCls} value={form.planType} onChange={e => set('planType', e.target.value)}>
                {PLANS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Max Uses</label>
              <input type="number" className={inputCls} value={form.maxUses} onChange={e => set('maxUses', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Expiry Date <span className="text-[#555]">(optional)</span></label>
              <input type="date" className={inputCls} value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes <span className="text-[#555]">(optional)</span></label>
            <textarea className={`${inputCls} resize-none h-20`} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-white/10 hover:border-white/20 text-white text-sm font-semibold rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-[#FF3B3B] hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
