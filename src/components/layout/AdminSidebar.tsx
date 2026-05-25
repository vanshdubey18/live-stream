'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Building2, CheckSquare, Users,
  Ticket, DollarSign, BarChart2, Settings,
  LogOut, Menu, X,
} from 'lucide-react'

interface AdminSidebarProps { active?: string; pendingCount?: number }

export default function AdminSidebar({ active = 'Overview', pendingCount = 0 }: AdminSidebarProps) {
  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Gym Applications', href: '/admin/applications', icon: Building2, badge: pendingCount > 0 ? pendingCount : undefined },
    { label: 'Active Gyms', href: '/admin/gyms', icon: CheckSquare },
    { label: 'All Members', href: '/admin/members', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Payouts', href: '/admin/payouts', icon: DollarSign },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ]
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-black border-b border-[#1f1f1f] px-4 h-14 flex items-center justify-between">
        <span className="font-bebas tracking-[2px] text-xl text-[#C41E3A]">MATPEAK</span>
        <button onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && <div className="lg:hidden fixed inset-0 z-30 bg-black/80" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full z-40 w-64 bg-black border-r border-[#1f1f1f] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#1f1f1f]">
          <span className="font-bebas tracking-[2px] text-xl text-[#C41E3A]">MATPEAK</span>
          <span className="font-inter text-[10px] text-[#C41E3A] bg-[#C41E3A]/10 border border-[#C41E3A]/20 px-2 py-0.5 rounded-sm">ADMIN</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, badge }) => {
            const isActive = active === label
            return (
              <a key={label} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-inter transition-colors duration-200
                  ${isActive
                    ? 'text-white bg-[#0d0d0d] border-l-2 border-[#C41E3A]'
                    : 'text-[#555555] hover:text-white'
                  }`}>
                <Icon size={18} className={isActive ? 'text-[#C41E3A]' : ''} />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="bg-[#C41E3A] text-white text-[10px] font-bold w-5 h-5 rounded-sm flex items-center justify-center">{badge}</span>
                ) : null}
              </a>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#1f1f1f]">
          <button onClick={async () => { await createClient().auth.signOut(); router.push('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-inter text-[#555555] hover:text-white transition-colors w-full">
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>
    </>
  )
}
