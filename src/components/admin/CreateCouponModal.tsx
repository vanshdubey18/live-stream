'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  type: 'percent_off' | 'free_days'
  value: number
  plan_type: string
  max_uses: number
  times_used: number
  expires_at: string | null
  is_active: boolean
  notes: string | null
}

interface Props {
  onClose: () => void
  onCreated: (c: Coupon) => void
}

export default function CreateCouponModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    code: '',
    type: 'free_days',
    value: '30',
    maxUses: '50',
    expiresAt: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          maxUses: Number(form.maxUses),
          expiresAt: form.expiresAt || null,
          notes: form.notes,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      onCreated(data.coupon)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-2.5 text-white font-inter text-sm focus:outline-none focus:border-white transition-colors'
  const labelCls = 'block font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-1.5'

  const hint = form.type === 'free_days'
    ? `Members get ${form.value || '?'} days of free access when they redeem this code.`
    : form.value === '100'
      ? 'Members get 30 days of free access (100% off).'
      : `Members get ${form.value || '?'}% off their first month.`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333333]">
          <h2 className="font-bebas text-2xl text-white tracking-[1px]">CREATE COUPON</h2>
          <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Coupon Code</label>
            <input
              className={`${inputCls} uppercase tracking-widest`}
              placeholder="e.g. PILOT2025"
              value={form.code}
              onChange={e => set('code', e.target.value)}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Type</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { val: 'free_days', label: 'Free Days' },
                { val: 'percent_off', label: '% Off' },
              ] as const).map(t => (
                <label key={t.val} className={`flex items-center gap-2 px-4 py-3 rounded-sm border cursor-pointer transition-all font-inter text-sm
                  ${form.type === t.val ? 'border-white bg-[#222222] text-white' : 'border-[#333333] text-[#999999] hover:border-[#555555]'}`}>
                  <input type="radio" name="type" value={t.val} checked={form.type === t.val}
                    onChange={() => { set('type', t.val); set('value', t.val === 'free_days' ? '30' : '100') }}
                    className="hidden" />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{form.type === 'free_days' ? 'Days Free' : 'Discount %'}</label>
              <input type="number" min="1" max={form.type === 'percent_off' ? '100' : undefined}
                className={inputCls}
                value={form.value}
                onChange={e => set('value', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Max Uses</label>
              <input type="number" min="1" className={inputCls} value={form.maxUses}
                onChange={e => set('maxUses', e.target.value)} />
            </div>
          </div>

          {/* Hint */}
          <p className="font-inter text-[#00D4AA] text-xs bg-[#00D4AA]/5 border border-[#00D4AA]/20 rounded-sm px-4 py-3">
            {hint}
          </p>

          <div>
            <label className={labelCls}>Expiry Date <span className="text-[#555555]">(optional)</span></label>
            <input type="date" className={inputCls} value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Notes <span className="text-[#555555]">(optional)</span></label>
            <input className={inputCls} placeholder="e.g. Pilot batch — free 30 days"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          {error && (
            <p className="font-inter text-[#FF3B3B] text-sm bg-[#FF3B3B]/5 border border-[#FF3B3B]/20 rounded-sm px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-[#333333] text-[#999999] hover:text-white font-inter text-sm rounded-sm transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-white hover:bg-[#E5E5E5] disabled:opacity-50 text-black font-bebas tracking-[3px] rounded-sm transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
