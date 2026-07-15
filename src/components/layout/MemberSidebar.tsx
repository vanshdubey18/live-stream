'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  PlaySquare,
  GraduationCap,
  CreditCard,
  User,
  Menu,
  X,
  LogOut,
  Search,
  Sparkles,
  Award,
  Trophy,
} from 'lucide-react'

const navGroups = [
  {
    label: 'Today',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Train',
    items: [
      { label: 'Browse Gyms', href: '/gyms', icon: Building2 },
      { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
      { label: 'Replays', href: '/dashboard/replays', icon: PlaySquare },
      { label: 'Instructionals', href: '/dashboard/instructionals', icon: GraduationCap },
      { label: 'Progression', href: '/dashboard/progression', icon: Award, soon: true },
    ],
  },
  {
    label: 'You',
    items: [
      { label: 'Achievements', href: '/dashboard/achievements', icon: Trophy, soon: true },
      { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { label: 'Account', href: '/dashboard/account', icon: User },
    ],
  },
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#141410] border-b border-[#322f26] px-4 h-14 flex items-center justify-between">
        <span className="font-mincho tracking-[2px] text-xl text-[#b3402f]">MATPEAK</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSearchClick}
            className="w-9 h-9 flex items-center justify-center text-[#7a7568] hover:text-[#f0eadc] transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <button onClick={() => setOpen(!open)} className="text-[#f0eadc]">
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
        className={`fixed top-0 left-0 h-full z-40 w-[75vw] max-w-[280px] lg:w-64 bg-[#141410] border-r border-[#322f26] flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#322f26]">
          <span className="font-mincho tracking-[2px] text-xl text-[#b3402f]">MATPEAK</span>
        </div>

        {/* Search button */}
        <div className="px-3 py-3 border-b border-[#322f26]">
          <button
            onClick={handleSearchClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-mincho text-[#7a7568] hover:text-[#f0eadc] transition-colors group"
          >
            <Search size={18} className="shrink-0" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="hidden lg:flex items-center gap-0.5 text-[#444] text-[10px] bg-[#1c1c16] border border-[#322f26] rounded-sm px-1.5 py-0.5 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* AI Coach CTA */}
        <div className="px-3 py-3 border-b border-[#322f26]">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-coach'))}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-sm bg-[#b3402f]/10 border border-[#b3402f]/20 hover:bg-[#b3402f]/20 transition-colors group"
          >
            <div className="w-6 h-6 rounded-sm bg-[#b3402f]/20 flex items-center justify-center shrink-0">
              <Sparkles size={13} className="text-[#b3402f]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-mincho text-sm text-[#f0eadc] tracking-[1px] leading-none truncate">Matpeak Coach</p>
              <p className="font-mincho text-[10px] text-[#b3402f]/70 mt-0.5 truncate">Ask about your classes</p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-5' : ''}>
              <p className="font-mincho text-[10px] text-[#635f54] tracking-[3px] uppercase px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon, soon }) => {
                  const isActive = active === label
                  return (
                    <a
                      key={label}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-mincho transition-colors duration-200
                        ${isActive
                          ? 'text-[#f0eadc] bg-[#1c1c16] border-l-2 border-[#b3402f]'
                          : 'text-[#a29c8c] hover:text-[#f0eadc]'
                        }`}
                    >
                      <Icon size={18} className={isActive ? 'text-[#b3402f]' : ''} />
                      <span className="flex-1">{label}</span>
                      {soon && (
                        <span className="font-mincho text-[9px] text-[#b3402f] tracking-[2px] uppercase border border-[#b3402f]/30 px-1.5 py-0.5 rounded-sm shrink-0">
                          Soon
                        </span>
                      )}
                    </a>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[#322f26]">
          <button
            onClick={async () => { await createClient().auth.signOut(); router.push('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-mincho text-[#7a7568] hover:text-[#f0eadc] transition-colors w-full"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  )
}
