'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  PlaySquare,
  CreditCard,
  User,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Gyms', href: '/dashboard/gyms', icon: Building2 },
  { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { label: 'Replays', href: '/dashboard/replays', icon: PlaySquare },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Account', href: '/dashboard/account', icon: User },
]

interface MemberSidebarProps {
  active?: string
}

export default function MemberSidebar({ active = 'Dashboard' }: MemberSidebarProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a] border-b border-white/5 px-4 h-14 flex items-center justify-between">
        <span className="text-xl font-black tracking-tighter text-[#DC2626]">MATPEAK</span>
        <button onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <span className="text-xl font-black tracking-tighter text-[#DC2626]">MATPEAK</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = active === label
            return (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-[#DC2626]/10 text-white border border-[#DC2626]/20'
                    : 'text-[#888888] hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-[#DC2626]' : 'group-hover:text-white'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-[#DC2626]" />}
              </a>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#888888] hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
