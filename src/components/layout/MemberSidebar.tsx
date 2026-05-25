'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  Search,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Browse Gyms', href: '/gyms', icon: Building2 },
  { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { label: 'Replays', href: '/dashboard/replays', icon: PlaySquare },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Account', href: '/dashboard/account', icon: User },
]

interface MemberSidebarProps {
  active?: string
  onSearchOpen?: () => void
}

export default function MemberSidebar({ active = 'Dashboard', onSearchOpen }: MemberSidebarProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleSearchClick() {
    if (onSearchOpen) {
      onSearchOpen()
    } else {
      window.dispatchEvent(new CustomEvent('open-search'))
    }
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-black border-b border-[#1f1f1f] px-4 h-14 flex items-center justify-between">
        <span className="font-bebas tracking-[2px] text-xl text-[#C41E3A]">MATPEAK</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSearchClick}
            className="w-9 h-9 flex items-center justify-center text-[#555555] hover:text-white transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <button onClick={() => setOpen(!open)} className="text-white">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/80"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 w-64 bg-black border-r border-[#1f1f1f] flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#1f1f1f]">
          <span className="font-bebas tracking-[2px] text-xl text-[#C41E3A]">MATPEAK</span>
        </div>

        {/* Search button */}
        <div className="px-3 py-3 border-b border-[#1f1f1f]">
          <button
            onClick={handleSearchClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-inter text-[#555555] hover:text-white transition-colors group"
          >
            <Search size={18} className="shrink-0" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="hidden lg:flex items-center gap-0.5 text-[#444] text-[10px] bg-[#0d0d0d] border border-[#1f1f1f] rounded-sm px-1.5 py-0.5 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = active === label
            return (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-inter transition-colors duration-200
                  ${isActive
                    ? 'text-white bg-[#0d0d0d] border-l-2 border-[#C41E3A]'
                    : 'text-[#555555] hover:text-white'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-[#C41E3A]' : ''} />
                {label}
              </a>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#1f1f1f]">
          <button
            onClick={async () => { await createClient().auth.signOut(); router.push('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-inter text-[#555555] hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
