'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Building2, CheckSquare, Users,
  Ticket, DollarSign, BarChart2, Settings,
  LogOut, Menu, X, ChevronRight,
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a] border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <span className="text-xl font-black tracking-tighter text-[#DC2626]">MATPEAK</span>
        <button onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full z-40 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <span className="text-xl font-black tracking-tighter text-[#DC2626]">MATPEAK</span>
          <span className="text-[10px] font-bold text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full border border-[#DC2626]/20">ADMIN</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, badge }) => {
            const isActive = active === label
            return (
              <a key={label} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive ? 'bg-[#DC2626]/10 text-white border border-[#DC2626]/20' : 'text-[#888888] hover:text-white hover:bg-white/5'}`}>
                <Icon size={18} className={isActive ? 'text-[#DC2626]' : 'group-hover:text-white'} />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="bg-[#DC2626] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{badge}</span>
                ) : isActive ? (
                  <ChevronRight size={14} className="text-[#DC2626]" />
                ) : null}
              </a>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <button onClick={() => router.push('/login')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#888888] hover:text-white hover:bg-white/5 transition-all w-full">
            <LogOut size={18} /> Log out
          </button>
        </div>
      </aside>
    </>
  )
}
