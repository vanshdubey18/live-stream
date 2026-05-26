'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'

const MEMBERS = [
  { id: '1', name: 'Karan Singh', email: 'karan@email.com', gyms: 2, mrr: '₹3,498', joined: 'Mar 12, 2026', status: 'Active', source: 'Paid' },
  { id: '2', name: 'Priya Sharma', email: 'priya@email.com', gyms: 1, mrr: '₹1,499', joined: 'Mar 18, 2026', status: 'Active', source: 'Paid' },
  { id: '3', name: 'Aman Verma', email: 'aman@email.com', gyms: 1, mrr: '₹0', joined: 'Apr 1, 2026', status: 'Active', source: 'Coupon' },
  { id: '4', name: 'Sneha Iyer', email: 'sneha@email.com', gyms: 1, mrr: '₹999', joined: 'Apr 5, 2026', status: 'Active', source: 'Paid' },
  { id: '5', name: 'Rohit Das', email: 'rohit@email.com', gyms: 1, mrr: '₹1,999', joined: 'Apr 10, 2026', status: 'Active', source: 'Paid' },
  { id: '6', name: 'Anjali Nair', email: 'anjali@email.com', gyms: 2, mrr: '₹2,998', joined: 'Apr 15, 2026', status: 'Active', source: 'Paid' },
  { id: '7', name: 'Dev Kumar', email: 'dev@email.com', gyms: 1, mrr: '₹0', joined: 'Apr 20, 2026', status: 'Cancelled', source: 'Coupon' },
  { id: '8', name: 'Meera Pillai', email: 'meera@email.com', gyms: 1, mrr: '₹1,999', joined: 'May 1, 2026', status: 'Active', source: 'Paid' },
]

export default function MembersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = MEMBERS.filter(m =>
    (statusFilter === 'All' || m.status === statusFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="All Members" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D]  border-b border-[#2A2A2A] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">All Members</h1>
          <span className="ml-3 text-xs text-[#999999] bg-[#1A1A1A] px-2 py-1 rounded-sm">{MEMBERS.length} members</span>
        </div>

        <div className="px-6 py-6 max-w-6xl space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..." className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#333333] transition-colors" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm px-4 py-2.5 text-white text-sm focus:outline-none">
              {['All', 'Active', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    {['Name', 'Email', 'Gyms', 'MRR', 'Joined', 'Source', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#999999] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F1F]">
                  {filtered.map(m => (
                    <tr key={m.id} className="hover:bg-[#1F1F1F] transition-colors cursor-pointer">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#FF3B3B]/10 flex items-center justify-center shrink-0">
                            <span className="text-[#FF3B3B] text-xs font-bold">{m.name[0]}</span>
                          </div>
                          <span className="text-white font-medium">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#999999]">{m.email}</td>
                      <td className="px-4 py-3.5 text-white">{m.gyms}</td>
                      <td className="px-4 py-3.5 text-white font-medium">{m.mrr}</td>
                      <td className="px-4 py-3.5 text-[#999999] text-xs">{m.joined}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2 py-1 rounded-sm ${m.source === 'Coupon' ? 'bg-[#1A1A1A] text-[#999999]' : 'bg-[#1A1A1A] text-[#999999]'}`}>
                          {m.source}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium px-2 py-1 rounded-sm ${m.status === 'Active' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'bg-[#1A1A1A] text-[#999999]'}`}>
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
                    <p className="text-white font-semibold text-sm">{m.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-sm ${m.status === 'Active' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'bg-[#1A1A1A] text-[#999999]'}`}>{m.status}</span>
                  </div>
                  <p className="text-[#999999] text-xs mt-0.5">{m.email} · {m.mrr}/mo · {m.gyms} gym{m.gyms > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
