'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Toast from '@/components/gym-dashboard/Toast'

interface Gym {
  id: string
  name: string
  city: string
  location: string | null
  disciplines: string[]
  owner_email: string
  status: string
  created_at: string
}

const TABS = ['Pending', 'Active', 'Rejected'] as const
type Tab = typeof TABS[number]

const statusMap: Record<Tab, string> = {
  Pending: 'pending',
  Active: 'active',
  Rejected: 'rejected',
}

const statusDot: Record<string, string> = {
  pending: 'bg-[#FFD60A]',
  active: 'bg-[#00D4AA]',
  rejected: 'bg-[#FF3B3B]',
}

const statusColor: Record<string, string> = {
  pending: 'text-[#FFD60A]',
  active: 'text-[#00D4AA]',
  rejected: 'text-[#FF3B3B]',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ApplicationsClient({ gyms: initial, pendingCount: initialPending }: { gyms: Gym[]; pendingCount: number }) {
  const [gyms, setGyms] = useState<Gym[]>(initial)
  const [tab, setTab] = useState<Tab>('Pending')
  const [loading, setLoading] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const pendingCount = gyms.filter(g => g.status === 'pending').length
  const filtered = gyms.filter(g => g.status === statusMap[tab])

  async function handleAction(gymId: string, action: 'approve' | 'reject') {
    setLoading(gymId)
    try {
      const res = await fetch('/api/admin/approve-gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId, action }),
      })
      const data = await res.json()
      if (!res.ok) { setToast(data.error ?? 'Something went wrong'); return }
      setGyms(p => p.map(g => g.id === gymId ? { ...g, status: data.status } : g))
      setToast(action === 'approve' ? 'Gym approved ✓' : 'Gym rejected')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Gym Applications" pendingCount={pendingCount} />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#2A2A2A] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Admin</p>
            <h1 className="font-bebas text-2xl text-white tracking-[1px] leading-tight">GYM APPLICATIONS</h1>
          </div>
        </div>

        <div className="px-6 py-6 max-w-4xl">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm p-1 mb-6 w-fit">
            {TABS.map(t => {
              const count = gyms.filter(g => g.status === statusMap[t]).length
              return (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-semibold transition-all
                    ${tab === t ? 'bg-[#222222] text-white' : 'text-[#999999] hover:text-white'}`}>
                  {t}
                  {count > 0 && (
                    <span className={`text-xs font-bold w-5 h-5 rounded-sm flex items-center justify-center
                      ${t === 'Pending' ? 'bg-[#FF3B3B] text-white' : 'bg-[#222222] text-[#555555]'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-6 py-16 text-center">
              <p className="font-inter text-[#555555] text-sm">No {tab.toLowerCase()} applications.</p>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm divide-y divide-[#222222]">
              {filtered.map(gym => (
                <div key={gym.id} className="px-5 py-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bebas text-xl text-white tracking-[1px]">{gym.name}</h3>
                      <p className="font-inter text-sm text-[#999999] mt-0.5">
                        {gym.location ? `${gym.location}, ` : ''}{gym.city}
                        {gym.disciplines?.length > 0 ? ` · ${gym.disciplines.join(', ')}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`inline-block w-1.5 h-1.5 rounded-sm ${statusDot[gym.status]}`} />
                      <span className={`font-inter text-xs uppercase tracking-[2px] ${statusColor[gym.status]}`}>{gym.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-inter text-xs text-[#555555] flex-wrap">
                    <span>{gym.owner_email}</span>
                    <span>·</span>
                    <span>Applied {formatDate(gym.created_at)}</span>
                  </div>

                  {gym.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(gym.id, 'approve')}
                        disabled={loading === gym.id}
                        className="bg-white text-black font-bebas tracking-[3px] text-sm px-5 py-2 rounded-sm hover:bg-[#E5E5E5] disabled:opacity-50 transition-colors"
                      >
                        {loading === gym.id ? '…' : 'APPROVE'}
                      </button>
                      <button
                        onClick={() => handleAction(gym.id, 'reject')}
                        disabled={loading === gym.id}
                        className="border border-[#333333] text-[#999999] font-inter text-sm px-5 py-2 rounded-sm hover:text-white disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                      <a href={`/admin/applications/${gym.id}`}
                        className="border border-[#333333] text-[#555555] font-inter text-sm px-5 py-2 rounded-sm hover:text-white transition-colors">
                        View Full
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
