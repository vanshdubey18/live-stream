'use client'

import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, Calendar, PlaySquare, User } from 'lucide-react'

const tabs = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { label: 'Replays', href: '/dashboard/replays', icon: PlaySquare },
  { label: 'Account', href: '/dashboard/account', icon: User },
]

export default function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141410] border-t border-[#322f26] flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {(() => {
        const { label, href, icon: Icon } = tabs[0]
        const isActive = pathname === href
        return (
          <a
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors"
          >
            <Icon size={20} className={isActive ? 'text-[#b3402f]' : 'text-[#a29c8c]'} />
            <span className={`font-mincho text-[10px] tracking-[1px] uppercase ${isActive ? 'text-[#f0eadc]' : 'text-[#a29c8c]'}`}>
              {label}
            </span>
          </a>
        )
      })()}

      {/* Matpeak Coach — opens the full chat sheet, not a page nav */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-ai-coach'))}
        className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors text-[#b3402f]"
      >
        <Sparkles size={20} />
        <span className="font-mincho text-[10px] tracking-[1px] uppercase">Coach</span>
      </button>

      {tabs.slice(1).map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <a
            key={label}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors"
          >
            <Icon size={20} className={isActive ? 'text-[#b3402f]' : 'text-[#a29c8c]'} />
            <span className={`font-mincho text-[10px] tracking-[1px] uppercase ${isActive ? 'text-[#f0eadc]' : 'text-[#a29c8c]'}`}>
              {label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
