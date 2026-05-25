'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Radio, CalendarDays, Users,
  DollarSign, BarChart2, Settings, LogOut, Menu, X,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/gym-dashboard', icon: LayoutDashboard },
  { label: 'Stream Setup', href: '/gym-dashboard/stream', icon: Radio },
  { label: 'Schedule Classes', href: '/gym-dashboard/schedule', icon: CalendarDays },
  { label: 'Coaches', href: '/gym-dashboard/coaches', icon: Users },
  { label: 'Revenue', href: '/gym-dashboard/revenue', icon: DollarSign },
  { label: 'Analytics', href: '/gym-dashboard/analytics', icon: BarChart2 },
  { label: 'Gym Profile', href: '/gym-dashboard/profile', icon: Settings },
]

interface GymSidebarProps { active?: string }

export default function GymSidebar({ active = 'Overview' }: GymSidebarProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0D0D0D] border-b border-[#333333] px-4 h-14 flex items-center justify-between">
        <span className="font-bebas tracking-[2px] text-xl text-[#FF3B3B]">MATPEAK</span>
        <button onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/80" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full z-40 w-64 bg-[#0D0D0D] border-r border-[#333333] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#333333]">
          <span className="font-bebas tracking-[2px] text-xl text-[#FF3B3B]">MATPEAK</span>
          <span className="font-inter text-[10px] text-[#555555] bg-[#1A1A1A] border border-[#333333] px-2 py-0.5 rounded-sm">GYM</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = active === label
            return (
              <a key={label} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-inter transition-colors duration-200
                  ${isActive
                    ? 'text-white bg-[#1A1A1A] border-l-2 border-[#FF3B3B]'
                    : 'text-[#555555] hover:text-white'
                  }`}>
                <Icon size={18} className={isActive ? 'text-[#FF3B3B]' : ''} />
                {label}
              </a>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#333333]">
          <button onClick={async () => { await createClient().auth.signOut(); router.push('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-inter text-[#555555] hover:text-white transition-colors w-full">
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>
    </>
  )
}
