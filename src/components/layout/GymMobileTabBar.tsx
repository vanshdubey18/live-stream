'use client'

import { usePathname } from 'next/navigation'
import { LayoutDashboard, Radio, CalendarDays, UserCheck, DollarSign } from 'lucide-react'

const tabs = [
  { label: 'Home', href: '/gym-dashboard', icon: LayoutDashboard },
  { label: 'Stream', href: '/gym-dashboard/stream', icon: Radio },
  { label: 'Schedule', href: '/gym-dashboard/schedule', icon: CalendarDays },
  { label: 'Members', href: '/gym-dashboard/members', icon: UserCheck },
  { label: 'Revenue', href: '/gym-dashboard/revenue', icon: DollarSign },
]

export default function GymMobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141410] border-t border-[#322f26] flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ label, href, icon: Icon }) => {
        // Exact match for /gym-dashboard, prefix match for sub-routes
        const isActive = href === '/gym-dashboard'
          ? pathname === '/gym-dashboard'
          : pathname === href || pathname.startsWith(href + '/')
        return (
          <a
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors"
          >
            <Icon size={20} className={isActive ? 'text-[#b3402f]' : 'text-[#a29c8c]'} />
            <span
              className={`font-mincho text-[10px] tracking-[1px] uppercase ${
                isActive ? 'text-[#f0eadc]' : 'text-[#a29c8c]'
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
