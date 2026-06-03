'use client'

import { useState } from 'react'
import GymSidebar from '@/components/layout/GymSidebar'
import { Search, UserCheck, UserX, Clock } from 'lucide-react'

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

function expiryDate(m: Member) {
  return m.current_period_end ?? m.free_until
}

function isExpiringSoon(m: Member) {
  const end = expiryDate(m)
  if (!end) return false
  const t = new Date(end).getTime()
  const now = Date.now()
  return t >= now && t <= now + 7 * 24 * 60 * 60 * 1000
}

function isExpired(m: Member) {
  const end = expiryDate(m)
  if (!end) return false
  return new Date(end).getTime() < Date.now()
}

export default function MembersClient({ members }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'expired'>('all')

  const filtered = members.filter(m => {
    const name = m.profile?.full_name ?? ''
    const email = m.profile?.email ?? ''
    const q = search.toLowerCase()
    if (q && !name.toLowerCase().includes(q) && !email.toLowerCase().includes(q)) return false
    if (filter === 'active') return m.status === 'active' && !isExpiringSoon(m) && !isExpired(m)
    if (filter === 'expiring') return isExpiringSoon(m)
    if (filter === 'expired') return isExpired(m) || m.status !== 'active'
    return true
  })

  const counts = {
    all: members.length,
    active: members.filter(m => m.status === 'active' && !isExpiringSoon(m) && !isExpired(m)).length,
    expiring: members.filter(isExpiringSoon).length,
    expired: members.filter(m => isExpired(m) || m.status !== 'active').length,
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
          <span className="font-bebas text-2xl text-white tracking-[1px]">{members.length}</span>
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
              {(['all', 'active', 'expiring', 'expired'] as const).map(f => (
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
                      {['Member', 'Plan', 'Source', 'Joined', 'Expires', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => {
                      const name = m.profile?.full_name || m.profile?.email || 'Unknown'
                      const email = m.profile?.email ?? ''
                      const expiring = isExpiringSoon(m)
                      const expired = isExpired(m) || m.status !== 'active'
                      return (
                        <tr key={m.id} className={`hover:bg-[#222222] transition-colors ${i < filtered.length - 1 ? 'border-b border-[#222222]' : ''}`}>
                          <td className="px-5 py-4">
                            <p className="font-inter text-white text-sm font-medium">{name}</p>
                            {email && name !== email && <p className="font-inter text-[#555555] text-xs mt-0.5">{email}</p>}
                          </td>
                          <td className="px-5 py-4 font-inter text-[11px] text-[#999999] tracking-[2px] uppercase">{m.plan_type ?? '—'}</td>
                          <td className="px-5 py-4 font-inter text-[11px] text-[#555555] uppercase tracking-[2px]">{m.source ?? '—'}</td>
                          <td className="px-5 py-4 font-inter text-sm text-[#999999]">{formatDate(m.created_at)}</td>
                          <td className={`px-5 py-4 font-inter text-sm ${expiring ? 'text-[#FFD60A]' : expired ? 'text-[#FF3B3B]' : 'text-[#999999]'}`}>
                            {formatDate(expiryDate(m))}
                          </td>
                          <td className="px-5 py-4">
                            {expired ? (
                              <span className="flex items-center gap-1.5 font-inter text-xs text-[#FF3B3B]"><UserX size={11} /> Expired</span>
                            ) : expiring ? (
                              <span className="flex items-center gap-1.5 font-inter text-xs text-[#FFD60A]"><Clock size={11} /> Expiring</span>
                            ) : (
                              <span className="flex items-center gap-1.5 font-inter text-xs text-[#00D4AA]"><UserCheck size={11} /> Active</span>
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
                  const expiring = isExpiringSoon(m)
                  const expired = isExpired(m) || m.status !== 'active'
                  return (
                    <div key={m.id} className="px-4 py-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-inter text-white text-sm font-medium truncate">{name}</p>
                        {email && name !== email && <p className="font-inter text-[#555555] text-xs truncate">{email}</p>}
                        <p className="font-inter text-[#555555] text-xs mt-0.5">Joined {formatDate(m.created_at)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={`font-inter text-xs ${expiring ? 'text-[#FFD60A]' : expired ? 'text-[#FF3B3B]' : 'text-[#00D4AA]'}`}>
                          {expired ? 'Expired' : expiring ? 'Expiring' : 'Active'}
                        </p>
                        <p className="font-inter text-[#555555] text-xs mt-0.5">{formatDate(expiryDate(m))}</p>
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
