'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Radio, CalendarDays, Users,
  DollarSign, BarChart2, Settings, LogOut, Menu, X, UserCheck,
} from 'lucide-react'

const navGroups = [
  {
    label: 'Today',
    items: [
      { label: 'Overview', href: '/gym-dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Run Your Gym',
    items: [
      { label: 'Stream Setup', href: '/gym-dashboard/stream', icon: Radio },
      { label: 'Schedule Classes', href: '/gym-dashboard/schedule', icon: CalendarDays },
      { label: 'Members', href: '/gym-dashboard/members', icon: UserCheck },
      { label: 'Coaches', href: '/gym-dashboard/coaches', icon: Users },
    ],
  },
  {
    label: 'Grow',
    items: [
      { label: 'Revenue', href: '/gym-dashboard/revenue', icon: DollarSign },
      { label: 'Analytics', href: '/gym-dashboard/analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Gym Profile', href: '/gym-dashboard/profile', icon: Settings },
    ],
  },
]

interface GymSidebarProps { active?: string }

export default function GymSidebar({ active = 'Overview' }: GymSidebarProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#141410] border-b border-[#322f26] px-4 h-14 flex items-center justify-between">
        <span className="font-mincho tracking-[2px] text-xl text-[#b3402f]">MATPEAK</span>
        <button onClick={() => setOpen(!open)} className="text-[#f0eadc]">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/80" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-40 w-[75vw] max-w-[280px] lg:w-64 bg-[#141410] border-r border-[#322f26] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#322f26]">
          <span className="font-mincho tracking-[2px] text-xl text-[#b3402f]">MATPEAK</span>
          <span className="font-mincho text-[10px] text-[#7a7568] bg-[#1c1c16] border border-[#322f26] px-2 py-0.5 rounded-sm">GYM</span>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
              <p className="font-mincho text-[10px] text-[#635f54] tracking-[3px] uppercase px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const isActive = active === label
                  return (
                    <a key={label} href={href} onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-mincho transition-colors duration-200
                        ${isActive
                          ? 'text-[#f0eadc] bg-[#1c1c16] border-l-2 border-[#b3402f]'
                          : 'text-[#a29c8c] hover:text-[#f0eadc]'
                        }`}>
                      <Icon size={18} className={isActive ? 'text-[#b3402f]' : ''} />
                      {label}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[#322f26]">
          <button onClick={async () => { await createClient().auth.signOut(); router.push('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-mincho text-[#7a7568] hover:text-[#f0eadc] transition-colors w-full">
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>
    </>
  )
}
