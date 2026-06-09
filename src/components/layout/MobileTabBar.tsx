'use client'

import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, PlaySquare, User, Sparkles } from 'lucide-react'

const NAV_TABS = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { label: 'Replays', href: '/dashboard/replays', icon: PlaySquare },
]

const ACCOUNT_TAB = { label: 'Account', href: '/dashboard/account', icon: User }

export default function MobileTabBar() {
  const pathname = usePathname()

  function openAICoach() {
    window.dispatchEvent(new Event('open-ai-coach'))
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D] border-t border-[#333333] flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_TABS.map(({ label, href, icon: Icon }) => {
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
            <span className={`font-inter text-[10px] tracking-[1px] uppercase ${isActive ? 'text-white' : 'text-[#555555]'}`}>
              {label}
            </span>
          </a>
        )
      })}

      {/* AI Coach — fires chat panel instead of navigating */}
      <button
        onClick={openAICoach}
        className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors group"
      >
        <Sparkles size={20} className="text-[#555555] group-active:text-[#FF3B3B] transition-colors" />
        <span className="font-inter text-[10px] tracking-[1px] uppercase text-[#555555] group-active:text-white transition-colors">
          AI Coach
        </span>
      </button>

      {/* Account — always last */}
      <a
        href={ACCOUNT_TAB.href}
        className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors"
      >
        <ACCOUNT_TAB.icon size={20} className={pathname === ACCOUNT_TAB.href ? 'text-[#FF3B3B]' : 'text-[#555555]'} />
        <span className={`font-inter text-[10px] tracking-[1px] uppercase ${pathname === ACCOUNT_TAB.href ? 'text-white' : 'text-[#555555]'}`}>
          {ACCOUNT_TAB.label}
        </span>
      </a>
    </nav>
  )
}
