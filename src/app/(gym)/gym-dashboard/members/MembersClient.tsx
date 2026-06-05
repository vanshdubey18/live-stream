'use client'

import { useState } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Search, UserCheck, UserX, Trash2 } from 'lucide-react'

interface Member {
  id: string
  user_id: string
  plan_type: string
  status: string
  free_until: string | null
  current_period_end: string | null
  created_at: string
  source: string | null
  profile: { full_name: string | null; email: string }
}

interface Props {
  gym: any
  members: Member[]
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MembersClient({ members: initial }: Props) {
  const [members, setMembers] = useState(initial)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'removed'>('all')
  const [removing, setRemoving] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = members.filter(m => {
    const name = m.profile?.full_name ?? ''
    const email = m.profile?.email ?? ''
    const q = search.toLowerCase()
    if (q && !name.toLowerCase().includes(q) && !email.toLowerCase().includes(q)) return false
    if (filter === 'active') return m.status === 'active'
    if (filter === 'removed') return m.status !== 'active'
    return true
  })

  const counts = {
    all: members.length,
    active: members.filter(m => m.status === 'active').length,
    removed: members.filter(m => m.status !== 'active').length,
  }

  async function handleRemove(id: string) {
    setRemoving(id)
    try {
      const res = await fetch(`/api/gym/members/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'cancelled' } : m))
      }
    } finally {
      setRemoving(null)
      setConfirmId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Members" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#222222] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Gym Dashboard</p>
            <h1 className="font-bebas text-xl text-white tracking-[1px] leading-tight">Members</h1>
          </div>
          <span className="font-bebas text-2xl text-white tracking-[1px]">{counts.active}</span>
        </div>

        <div className="px-6 py-8 max-w-5xl space-y-6">

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full bg-[#1A1A1A] border border-[#333333] rounded-sm pl-8 pr-3 py-2.5 font-inter text-sm text-white placeholder-[#444444] focus:outline-none focus:border-[#555555] transition-colors"
              />
            </div>
            <div className="flex gap-1">
              {(['all', 'active', 'removed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-2 font-inter text-xs rounded-sm capitalize transition-colors ${
                    filter === f
                      ? 'bg-white text-black'
                      : 'bg-[#1A1A1A] border border-[#333333] text-[#555555] hover:text-white'
                  }`}
                >
                  {f} {counts[f] > 0 && <span className="opacity-60">({counts[f]})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Members table */}
          {filtered.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-12 text-center">
              <p className="font-inter text-[#555555] text-sm">
                {members.length === 0 ? 'No members yet. Share your gym page to get started.' : 'No members match this filter.'}
              </p>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333333]">
                      {['Member', 'Source', 'Joined', 'Status', ''].map((h, i) => (
                        <th key={i} className="px-5 py-3 text-left font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => {
                      const name = m.profile?.full_name || m.profile?.email || 'Unknown'
                      const email = m.profile?.email ?? ''
                      const active = m.status === 'active'
                      return (
                        <tr key={m.id} className={`hover:bg-[#222222] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#222222]' : ''}`}>
                          <td className="px-5 py-4">
                            <p className="font-inter text-white text-sm font-medium">{name}</p>
                            {email && name !== email && <p className="font-inter text-[#555555] text-xs mt-0.5">{email}</p>}
                          </td>
                          <td className="px-5 py-4 font-inter text-[11px] text-[#555555] uppercase tracking-[2px]">{m.source ?? '—'}</td>
                          <td className="px-5 py-4 font-inter text-sm text-[#999999]">{formatDate(m.created_at)}</td>
                          <td className="px-5 py-4">
                            {active ? (
                              <span className="flex items-center gap-1.5 font-inter text-xs text-[#00D4AA]"><UserCheck size={11} /> Active</span>
                            ) : (
                              <span className="flex items-center gap-1.5 font-inter text-xs text-[#FF3B3B]"><UserX size={11} /> Removed</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {active && (
                              confirmId === m.id ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="font-inter text-xs text-[#999999]">Remove?</span>
                                  <button
                                    onClick={() => handleRemove(m.id)}
                                    disabled={removing === m.id}
                                    className="font-inter text-xs text-[#FF3B3B] hover:text-white transition-colors disabled:opacity-50"
                                  >
                                    {removing === m.id ? 'Removing…' : 'Yes'}
                                  </button>
                                  <button
                                    onClick={() => setConfirmId(null)}
                                    className="font-inter text-xs text-[#555555] hover:text-white transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmId(m.id)}
                                  className="flex items-center gap-1.5 font-inter text-xs text-[#555555] hover:text-[#FF3B3B] transition-colors ml-auto"
                                >
                                  <Trash2 size={11} /> Remove
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-[#222222]">
                {filtered.map(m => {
                  const name = m.profile?.full_name || m.profile?.email || 'Unknown'
                  const email = m.profile?.email ?? ''
                  const active = m.status === 'active'
                  return (
                    <div key={m.id} className="px-4 py-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-inter text-white text-sm font-medium truncate">{name}</p>
                        {email && name !== email && <p className="font-inter text-[#555555] text-xs truncate">{email}</p>}
                        <p className="font-inter text-[#555555] text-xs mt-0.5">Joined {formatDate(m.created_at)}</p>
                      </div>
                      <div className="shrink-0 text-right flex flex-col items-end gap-2">
                        <p className={`font-inter text-xs ${active ? 'text-[#00D4AA]' : 'text-[#FF3B3B]'}`}>
                          {active ? 'Active' : 'Removed'}
                        </p>
                        {active && (
                          confirmId === m.id ? (
                            <div className="flex gap-2">
                              <button onClick={() => handleRemove(m.id)} disabled={removing === m.id} className="font-inter text-[10px] text-[#FF3B3B]">
                                {removing === m.id ? '…' : 'Yes'}
                              </button>
                              <button onClick={() => setConfirmId(null)} className="font-inter text-[10px] text-[#555555]">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmId(m.id)} className="font-inter text-[10px] text-[#555555] hover:text-[#FF3B3B] transition-colors">
                              Remove
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
