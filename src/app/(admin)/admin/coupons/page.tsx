'use client'

import { useState } from 'react'
import { Plus, CheckCircle, XCircle } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import CreateCouponModal, { type Coupon } from '@/components/admin/CreateCouponModal'
import Toast from '@/components/gym-dashboard/Toast'

const INITIAL_COUPONS: Coupon[] = [
  { id: '1', code: 'PILOT100', type: 'percent_off', value: 100, planType: 'All', maxUses: 50, timesUsed: 12, expiresAt: 'Never', isActive: true, notes: 'Early pilot members — full free access' },
  { id: '2', code: 'EARLY50', type: 'percent_off', value: 50, planType: 'All', maxUses: 100, timesUsed: 8, expiresAt: 'Dec 31, 2026', isActive: true, notes: 'Early adopter discount' },
  { id: '3', code: 'COACH30', type: 'free_days', value: 30, planType: 'All', maxUses: 100, timesUsed: 5, expiresAt: 'Never', isActive: true, notes: 'For coaches referred by gym partners' },
  { id: '4', code: 'EXPIRED20', type: 'percent_off', value: 20, planType: 'Single', maxUses: 30, timesUsed: 30, expiresAt: 'Mar 31, 2026', isActive: false, notes: 'Old promo — expired' },
]

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  function handleCreated(c: Coupon) {
    setCoupons(p => [c, ...p])
    setToast('Coupon created ✓')
  }

  function toggleActive(id: string) {
    setCoupons(p => p.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c))
    setToast('Coupon updated')
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Coupons" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Coupons</h1>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#FF3B3B] hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-sm transition-colors">
            <Plus size={15} /> Create Coupon
          </button>
        </div>

        <div className="px-6 py-6 max-w-5xl">
          <div className="bg-[#1A1A1A] border border-white/5 rounded-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Code', 'Type', 'Value', 'Used / Max', 'Plan', 'Expires', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#999999] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {coupons.map(c => (
                    <tr key={c.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3.5">
                        <span className="text-white font-mono font-bold text-sm">{c.code}</span>
                        {c.notes && <p className="text-[#555] text-xs mt-0.5 max-w-[160px] truncate">{c.notes}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-[#999999]">
                        {c.type === 'percent_off' ? 'Percentage' : 'Free days'}
                      </td>
                      <td className="px-4 py-3.5 text-white font-bold">
                        {c.type === 'percent_off' ? `${c.value}%` : `${c.value} days`}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF3B3B] rounded-full" style={{ width: `${Math.min((c.timesUsed / c.maxUses) * 100, 100)}%` }} />
                          </div>
                          <span className="text-[#999999] text-xs">{c.timesUsed}/{c.maxUses}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#999999]">{c.planType}</td>
                      <td className="px-4 py-3.5 text-[#999999] text-xs">{c.expiresAt}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => toggleActive(c.id)} className="flex items-center gap-1.5 transition-colors">
                          {c.isActive
                            ? <><CheckCircle size={15} className="text-green-400" /><span className="text-green-400 text-xs font-semibold">Active</span></>
                            : <><XCircle size={15} className="text-[#555]" /><span className="text-[#555] text-xs">Inactive</span></>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showModal && <CreateCouponModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
