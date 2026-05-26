'use client'

import { useState } from 'react'
import { Search, ExternalLink, MoreHorizontal } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'

const GYMS = [
  { id: '1', name: 'Xtreme MMA Mumbai', city: 'Mumbai', members: 47, revenue: '₹47,000', status: 'Active', lastActive: '2 min ago', disciplines: ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling'] },
  { id: '2', name: 'Champion MMA Chennai', city: 'Chennai', members: 38, revenue: '₹38,000', status: 'Active', lastActive: '1 hr ago', disciplines: ['Boxing', 'Muay Thai'] },
  { id: '3', name: 'Gracie Barra Delhi', city: 'Delhi', members: 32, revenue: '₹32,000', status: 'Active', lastActive: '3 hr ago', disciplines: ['BJJ'] },
  { id: '4', name: '10th Planet Bangalore', city: 'Bangalore', members: 28, revenue: '₹28,000', status: 'Active', lastActive: '5 hr ago', disciplines: ['BJJ', 'Wrestling'] },
  { id: '5', name: 'Combat Club Jammu', city: 'Jammu', members: 22, revenue: '₹22,000', status: 'Active', lastActive: '1 day ago', disciplines: ['Boxing', 'Wrestling'] },
  { id: '6', name: 'Fight Factory Hyderabad', city: 'Hyderabad', members: 18, revenue: '₹18,000', status: 'Active', lastActive: '2 days ago', disciplines: ['Muay Thai', 'BJJ'] },
  { id: '7', name: 'Warriors MMA Ahmedabad', city: 'Ahmedabad', members: 12, revenue: '₹12,000', status: 'Active', lastActive: '3 days ago', disciplines: ['Boxing'] },
  { id: '8', name: 'Iron Fist Lucknow', city: 'Lucknow', members: 9, revenue: '₹9,000', status: 'Active', lastActive: '5 days ago', disciplines: ['Muay Thai', 'Wrestling'] },
]

export default function ActiveGymsPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('All')
  const cities = ['All', ...Array.from(new Set(GYMS.map(g => g.city)))]

  const filtered = GYMS.filter(g =>
    (cityFilter === 'All' || g.city === cityFilter) &&
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Active Gyms" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Active Gyms</h1>
          <span className="ml-3 text-xs text-[#999999] bg-white/5 px-2 py-1 rounded-full">{GYMS.length} gyms</span>
        </div>

        <div className="px-6 py-6 max-w-6xl space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search gyms..." className="w-full bg-[#1A1A1A] border border-white/5 rounded-sm pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/20 transition-colors" />
            </div>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-white/5 rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none">
              {cities.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Gym', 'City', 'Members', 'Revenue', 'Disciplines', 'Last Active', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#999999] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(g => (
                    <tr key={g.id} className="hover:bg-white/2 transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-[#FF3B3B]/10 flex items-center justify-center shrink-0">
                            <span className="text-[#FF3B3B] text-xs font-black">{g.name[0]}</span>
                          </div>
                          <span className="text-white font-semibold text-sm">{g.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#999999]">{g.city}</td>
                      <td className="px-4 py-3.5 text-white font-medium">{g.members}</td>
                      <td className="px-4 py-3.5 text-white font-medium">{g.revenue}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {g.disciplines.slice(0, 2).map(d => (
                            <span key={d} className="text-xs bg-white/5 text-[#999999] px-2 py-0.5 rounded-full">{d}</span>
                          ))}
                          {g.disciplines.length > 2 && <span className="text-xs text-[#555]">+{g.disciplines.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#999999] text-xs">{g.lastActive}</td>
                      <td className="px-4 py-3.5">
                        <button className="text-[#555] hover:text-white transition-colors"><MoreHorizontal size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-white/5">
              {filtered.map(g => (
                <div key={g.id} className="px-4 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold text-sm">{g.name}</p>
                    <p className="text-[#999999] text-xs mt-0.5">{g.city} · {g.members} members · {g.revenue}</p>
                  </div>
                  <ExternalLink size={14} className="text-[#555] shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
