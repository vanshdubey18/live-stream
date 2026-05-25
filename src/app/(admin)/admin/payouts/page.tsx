'use client'

import { useState } from 'react'
import { CheckCircle, Clock, Loader2, X } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Toast from '@/components/gym-dashboard/Toast'

interface Payout {
  id: string; gym: string; members: number
  revenue: string; gymCut: string; platformCut: string
  period: string; status: 'pending' | 'paid'
}

const INITIAL: Payout[] = [
  { id: '1', gym: 'Xtreme MMA Mumbai', members: 47, revenue: '₹47,000', gymCut: '₹32,900', platformCut: '₹14,100', period: 'May 2026', status: 'pending' },
  { id: '2', gym: 'Champion MMA Chennai', members: 38, revenue: '₹38,000', gymCut: '₹26,600', platformCut: '₹11,400', period: 'May 2026', status: 'pending' },
  { id: '3', gym: 'Gracie Barra Delhi', members: 32, revenue: '₹32,000', gymCut: '₹22,400', platformCut: '₹9,600', period: 'May 2026', status: 'pending' },
  { id: '4', gym: '10th Planet Bangalore', members: 28, revenue: '₹28,000', gymCut: '₹19,600', platformCut: '₹8,400', period: 'May 2026', status: 'pending' },
  { id: '5', gym: 'Xtreme MMA Mumbai', members: 42, revenue: '₹42,000', gymCut: '₹29,400', platformCut: '₹12,600', period: 'April 2026', status: 'paid' },
  { id: '6', gym: 'Gracie Barra Delhi', members: 28, revenue: '₹28,000', gymCut: '₹19,600', platformCut: '₹8,400', period: 'April 2026', status: 'paid' },
]

function ConfirmModal({ payout, onConfirm, onClose }: { payout: Payout; onConfirm: () => void; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-white/10 rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-white font-bold">Confirm Transfer</h3>
          <button onClick={onClose} className="text-[#999999] hover:text-white"><X size={18} /></button>
        </div>
        <p className="text-[#999999] text-sm mb-1">Send payout to <span className="text-white font-medium">{payout.gym}</span>?</p>
        <p className="text-[#FF3B3B] text-2xl font-black mb-4">{payout.gymCut}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-white text-sm font-semibold rounded-xl">Cancel</button>
          <button onClick={() => { setLoading(true); setTimeout(() => { onConfirm(); setLoading(false) }, 700) }} disabled={loading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </div>
  )
}

const TABS = ['Pending', 'Processed'] as const

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>(INITIAL)
  const [tab, setTab] = useState<'Pending' | 'Processed'>('Pending')
  const [confirm, setConfirm] = useState<Payout | null>(null)
  const [toast, setToast] = useState('')

  function processPayout(id: string) {
    setPayouts(p => p.map(x => x.id === id ? { ...x, status: 'paid' } : x))
    setConfirm(null)
    setToast('Payout processed ✓')
  }

  function processAll() {
    setPayouts(p => p.map(x => x.status === 'pending' ? { ...x, status: 'paid' } : x))
    setToast('All pending payouts processed ✓')
  }

  const pending = payouts.filter(p => p.status === 'pending')
  const processed = payouts.filter(p => p.status === 'paid')
  const filtered = tab === 'Pending' ? pending : processed

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Payouts" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Payouts</h1>
          {tab === 'Pending' && pending.length > 0 && (
            <button onClick={processAll}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              Process All Pending
            </button>
          )}
        </div>

        <div className="px-6 py-6 max-w-5xl space-y-4">
          <div className="flex gap-1 bg-[#1A1A1A] border border-white/5 rounded-xl p-1 w-fit">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${tab === t ? 'bg-white/10 text-white' : 'text-[#999999] hover:text-white'}`}>
                {t}
                <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded-full">
                  {t === 'Pending' ? pending.length : processed.length}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Gym', 'Period', 'Members', 'Revenue', 'Gym Cut (70%)', 'Platform (30%)', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#999999] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3.5 text-white font-medium">{p.gym}</td>
                      <td className="px-4 py-3.5 text-[#999999]">{p.period}</td>
                      <td className="px-4 py-3.5 text-white">{p.members}</td>
                      <td className="px-4 py-3.5 text-white">{p.revenue}</td>
                      <td className="px-4 py-3.5 text-white font-bold">{p.gymCut}</td>
                      <td className="px-4 py-3.5 text-[#FF3B3B] font-bold">{p.platformCut}</td>
                      <td className="px-4 py-3.5">
                        {p.status === 'paid'
                          ? <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold"><CheckCircle size={13} /> Paid</span>
                          : <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-semibold"><Clock size={13} /> Pending</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {p.status === 'pending' && (
                          <button onClick={() => setConfirm(p)}
                            className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                            Process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {confirm && <ConfirmModal payout={confirm} onConfirm={() => processPayout(confirm.id)} onClose={() => setConfirm(null)} />}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
