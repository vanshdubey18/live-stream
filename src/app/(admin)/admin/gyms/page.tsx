'use client'

import { useState, useEffect } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'

interface Gym {
  id: string
  slug: string
  name: string
  city: string
  disciplines: string[]
  status: string
  created_at: string
}

export default function ActiveGymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/gyms')
      .then(r => r.json())
      .then(d => { if (d.gyms) setGyms(d.gyms) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = gyms.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Active Gyms" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Admin</p>
            <h1 className="font-bebas text-2xl text-white tracking-[1px] leading-tight">ACTIVE GYMS</h1>
          </div>
          <span className="ml-3 font-inter text-xs text-[#999999] bg-[#1A1A1A] border border-[#333333] px-2 py-1 rounded-sm">{gyms.length}</span>
        </div>

        <div className="px-6 py-6 max-w-5xl space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search gyms..."
              className="w-full bg-[#1A1A1A] border border-[#333333] rounded-sm pl-9 pr-4 py-2.5 text-white font-inter text-sm focus:outline-none focus:border-[#555555] transition-colors" />
          </div>

          {loading ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center">
              <p className="font-inter text-[#555555] text-sm">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center">
              <p className="font-inter text-[#555555] text-sm">No active gyms yet.</p>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#333333]">
                      {['Gym', 'City', 'Disciplines', 'Joined', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-inter text-[11px] text-[#999999] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F1F]">
                    {filtered.map(g => (
                      <tr key={g.id} className="hover:bg-[#1F1F1F] transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-[#FF3B3B]/10 flex items-center justify-center shrink-0">
                              <span className="text-[#FF3B3B] font-bebas text-sm">{g.name[0]}</span>
                            </div>
                            <span className="text-white font-inter font-semibold text-sm">{g.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-inter text-[#999999] text-sm">{g.city ?? '—'}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {(g.disciplines ?? []).slice(0, 2).map((d: string) => (
                              <span key={d} className="font-inter text-xs bg-[#222222] text-[#999999] px-2 py-0.5 rounded-sm">{d}</span>
                            ))}
                            {(g.disciplines ?? []).length > 2 && <span className="font-inter text-xs text-[#555555]">+{g.disciplines.length - 2}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-inter text-[#999999] text-xs">
                          {new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5">
                          <a href={`/gyms/${g.slug}`} className="text-[#555555] hover:text-white transition-colors"><ExternalLink size={14} /></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y divide-[#1F1F1F]">
                {filtered.map(g => (
                  <div key={g.id} className="px-4 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-inter text-white font-semibold text-sm">{g.name}</p>
                      <p className="font-inter text-[#999999] text-xs mt-0.5">{g.city ?? '—'}</p>
                    </div>
                    <ExternalLink size={14} className="text-[#555555] shrink-0" />
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
