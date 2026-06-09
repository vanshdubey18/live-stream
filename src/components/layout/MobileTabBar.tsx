'use client'

import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Calendar, PlaySquare, User } from 'lucide-react'

const tabs = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gyms', href: '/gyms', icon: Building2 },
  { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { label: 'Replays', href: '/dashboard/replays', icon: PlaySquare },
  { label: 'Account', href: '/dashboard/account', icon: User },
]

export default function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D] border-t border-[#333333] flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ label, href, icon: Icon }) => {
        // Exact match for /dashboard, prefix match for sub-routes
        const isActive = href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname === href || pathname.startsWith(href + '/')
        return (
          <a
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors"
          >
            <Icon size={20} className={isActive ? 'text-[#FF3B3B]' : 'text-[#555555]'} />
            <span
              className={`font-inter text-[10px] tracking-[1px] uppercase ${
                isActive ? 'text-white' : 'text-[#555555]'
              }`}
            >
              {label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
