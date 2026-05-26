'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckCircle, XCircle } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import CreateCouponModal from '@/components/admin/CreateCouponModal'
import Toast from '@/components/gym-dashboard/Toast'

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

export default function CouponsClient({ coupons: initial }: { coupons: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initial)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/admin/coupons')
      .then(r => r.json())
      .then(d => { if (d.coupons) setCoupons(d.coupons) })
      .catch(() => {})
  }, [])

  function handleCreated(c: Coupon) {
    setCoupons(p => [c, ...p])
    setToast('Coupon created ✓')
  }

  async function toggleActive(id: string, current: boolean) {
    const next = !current
    setCoupons(p => p.map(c => c.id === id ? { ...c, is_active: next } : c))
    const res = await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: next }),
    })
    if (!res.ok) {
      setCoupons(p => p.map(c => c.id === id ? { ...c, is_active: current } : c))
      setToast('Failed to update coupon')
    }
  }

  function formatExpiry(date: string | null) {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Coupons" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Admin</p>
            <h1 className="font-bebas text-2xl text-white tracking-[1px] leading-tight">COUPONS</h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] text-sm px-4 py-2 rounded-sm transition-colors">
            <Plus size={14} /> CREATE COUPON
          </button>
        </div>

        <div className="px-6 py-6 max-w-5xl">
          {coupons.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center">
              <p className="font-inter text-[#555555] text-sm mb-4">No coupons yet.</p>
              <button onClick={() => setShowModal(true)}
                className="bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] text-sm px-6 py-2.5 rounded-sm transition-colors">
                CREATE FIRST COUPON
              </button>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#333333]">
                      {['Code', 'Type', 'Value', 'Used / Max', 'Expires', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-inter text-[11px] text-[#999999] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {coupons.map(c => (
                      <tr key={c.id} className="hover:bg-[#1F1F1F] transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="text-white font-mono font-bold">{c.code}</span>
                          {c.notes && <p className="text-[#555555] text-xs mt-0.5 max-w-[180px] truncate">{c.notes}</p>}
                        </td>
                        <td className="px-4 py-3.5 text-[#999999] font-inter text-xs">
                          {c.type === 'percent_off' ? 'Percentage off' : 'Free days'}
                        </td>
                        <td className="px-4 py-3.5 font-bebas text-white text-lg tracking-[1px]">
                          {c.type === 'percent_off' ? `${c.value}%` : `${c.value} days`}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-14 bg-[#222222] rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF3B3B]" style={{ width: `${Math.min((c.times_used / c.max_uses) * 100, 100)}%` }} />
                            </div>
                            <span className="font-inter text-[#999999] text-xs">{c.times_used}/{c.max_uses}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-inter text-[#999999] text-xs">{formatExpiry(c.expires_at)}</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => toggleActive(c.id, c.is_active)} className="flex items-center gap-1.5 transition-colors">
                            {c.is_active
                              ? <><CheckCircle size={14} className="text-[#00D4AA]" /><span className="font-inter text-[#00D4AA] text-xs">Active</span></>
                              : <><XCircle size={14} className="text-[#555555]" /><span className="font-inter text-[#555555] text-xs">Inactive</span></>}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {showModal && <CreateCouponModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
