'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'

interface Member {
  id: string
  user_id: string
  gym_id: string
  status: string
  source: string | null
  free_until: string | null
  created_at: string
  gyms: { name: string } | null
  user_email?: string
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/members')
      .then(r => r.json())
      .then(d => { if (d.members) setMembers(d.members) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = members.filter(m =>
    (m.user_email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m.gyms?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="All Members" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Admin</p>
            <h1 className="font-bebas text-2xl text-white tracking-[1px] leading-tight">ALL MEMBERS</h1>
          </div>
          <span className="ml-3 font-inter text-xs text-[#999999] bg-[#1A1A1A] border border-[#333333] px-2 py-1 rounded-sm">{members.length}</span>
        </div>

        <div className="px-6 py-6 max-w-5xl space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by email or gym..."
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-sm pl-9 pr-4 py-2.5 text-white font-inter text-sm focus:outline-none focus:border-[#555555] transition-colors" />
          </div>

          {loading ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center">
              <p className="font-inter text-[#555555] text-sm">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center">
              <p className="font-inter text-[#555555] text-sm">No members yet.</p>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#333333]">
                      {['Email', 'Gym', 'Source', 'Free Until', 'Joined', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-inter text-[11px] text-[#999999] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {filtered.map(m => (
                      <tr key={m.id} className="hover:bg-[#1F1F1F] transition-colors">
                        <td className="px-4 py-3.5 font-inter text-white text-sm">{m.user_email ?? m.user_id.slice(0, 8) + '...'}</td>
                        <td className="px-4 py-3.5 font-inter text-[#999999] text-sm">{m.gyms?.name ?? '—'}</td>
                        <td className="px-4 py-3.5 font-inter text-[#999999] text-xs">{m.source ?? 'paid'}</td>
                        <td className="px-4 py-3.5 font-inter text-[#999999] text-xs">
                          {m.free_until ? new Date(m.free_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3.5 font-inter text-[#999999] text-xs">
                          {new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`font-inter text-xs px-2 py-1 rounded-sm ${m.status === 'active' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'bg-[#1A1A1A] text-[#555555]'}`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-[#1F1F1F]">
                {filtered.map(m => (
                  <div key={m.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <p className="font-inter text-white text-sm">{m.user_email ?? m.user_id.slice(0, 8) + '...'}</p>
                      <span className={`font-inter text-xs px-2 py-0.5 rounded-sm ${m.status === 'active' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'bg-[#1A1A1A] text-[#555555]'}`}>{m.status}</span>
                    </div>
                    <p className="font-inter text-[#999999] text-xs mt-0.5">{m.gyms?.name ?? '—'} · {m.source ?? 'paid'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
