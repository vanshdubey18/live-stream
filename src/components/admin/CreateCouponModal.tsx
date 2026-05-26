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

  const inputCls = 'w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-2.5 text-white font-inter text-sm focus:outline-none focus:border-[#555555] transition-colors'
  const labelCls = 'block font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333]">
          <h2 className="font-bebas text-2xl text-white tracking-[1px]">Create Coupon</h2>
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
                <label key={t} className={`flex items-center gap-2 px-4 py-3 rounded-sm border cursor-pointer transition-all font-inter text-sm
                  ${form.type === t ? 'border-[#555555] bg-[#222222] text-white' : 'border-[#333333] text-[#999999] hover:border-[#555555]'}`}>
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => set('type', t)} className="hidden" />
                  {t === 'percent_off' ? '% Percentage off' : 'Free days'}
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
              <label className={labelCls}>Expiry Date <span className="text-[#555555]">(optional)</span></label>
              <input type="date" className={inputCls} value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notes <span className="text-[#555555]">(optional)</span></label>
            <textarea className={`${inputCls} resize-none h-20`} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-[#333333] hover:border-[#555555] text-[#999999] hover:text-white font-inter text-sm rounded-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-white hover:bg-[#E5E5E5] disabled:opacity-50 text-black font-bebas tracking-[3px] rounded-sm transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'CREATE COUPON'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
