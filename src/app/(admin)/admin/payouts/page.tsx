'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/payouts')
      .then(r => r.json())
      .then(d => { if (d.payouts) setPayouts(d.payouts) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending = payouts.filter(p => p.status === 'pending')
  const processed = payouts.filter(p => p.status === 'paid')

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Payouts" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Admin</p>
            <h1 className="font-bebas text-2xl text-white tracking-[1px] leading-tight">PAYOUTS</h1>
          </div>
        </div>

        <div className="px-6 py-6 max-w-5xl space-y-6">
          {loading ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center">
              <p className="font-inter text-[#555555] text-sm">Loading...</p>
            </div>
          ) : payouts.length === 0 ? (
            <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center font-bebas text-[120px] text-white/[0.03] leading-none select-none pointer-events-none">EARN</span>
              <p className="relative font-inter text-[#555555] text-sm">No payouts yet.</p>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <section>
                  <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">Pending</p>
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#333333]">
                          {['Gym', 'Period', 'Gym Cut (70%)', 'Platform (30%)', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-inter text-[11px] text-[#999999] uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F1F1F]">
                        {pending.map(p => (
                          <tr key={p.id} className="hover:bg-[#1F1F1F] transition-colors">
                            <td className="px-4 py-3.5 font-inter text-white font-medium">{p.gyms?.name ?? '—'}</td>
                            <td className="px-4 py-3.5 font-inter text-[#999999] text-xs">
                              {new Date(p.period_start).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3.5 font-bebas text-white text-lg tracking-[1px]">
                              ₹{((p.amount_paise * 0.7) / 100).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3.5 font-bebas text-[#FF3B3B] text-lg tracking-[1px]">
                              ₹{((p.amount_paise * 0.3) / 100).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="flex items-center gap-1.5 font-inter text-[#FFD60A] text-xs"><Clock size={12} /> Pending</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {processed.length > 0 && (
                <section>
                  <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">Processed</p>
                  <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#333333]">
                          {['Gym', 'Period', 'Gym Cut (70%)', 'Platform (30%)', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-inter text-[11px] text-[#999999] uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1F1F1F]">
                        {processed.map(p => (
                          <tr key={p.id} className="hover:bg-[#1F1F1F] transition-colors">
                            <td className="px-4 py-3.5 font-inter text-white font-medium">{p.gyms?.name ?? '—'}</td>
                            <td className="px-4 py-3.5 font-inter text-[#999999] text-xs">
                              {new Date(p.period_start).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3.5 font-bebas text-white text-lg tracking-[1px]">
                              ₹{((p.amount_paise * 0.7) / 100).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3.5 font-bebas text-[#FF3B3B] text-lg tracking-[1px]">
                              ₹{((p.amount_paise * 0.3) / 100).toLocaleString('en-IN')}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="flex items-center gap-1.5 font-inter text-[#00D4AA] text-xs"><CheckCircle size={12} /> Paid</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
