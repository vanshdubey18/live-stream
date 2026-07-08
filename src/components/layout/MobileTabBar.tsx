'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Sparkles, Calendar, PlaySquare, User, MoreHorizontal, Building2 } from 'lucide-react'

const tabs = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { label: 'Replays', href: '/dashboard/replays', icon: PlaySquare },
  { label: 'Account', href: '/dashboard/account', icon: User },
]

const MORE_LINKS = [
  { label: 'Browse Gyms', href: '/gyms', icon: Building2 },
]

export default function MobileTabBar() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <>
      {/* "More" overflow sheet */}
      {moreOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/80"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="lg:hidden fixed bottom-16 left-0 right-0 z-40 bg-[#1c1c16] border-t border-[#322f26]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {MORE_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-6 py-4 font-mincho text-sm text-[#a29c8c] hover:text-[#f0eadc] transition-colors"
              >
                <Icon size={18} />
                {label}
              </a>
            ))}
          </div>
        </>
      )}

      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#141410] border-t border-[#322f26] flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Home */}
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

        {/* Remaining route tabs */}
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

        {/* More overflow toggle */}
        <button
          onClick={() => setMoreOpen(v => !v)}
          className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors"
        >
          <MoreHorizontal size={20} className={moreOpen ? 'text-[#f0eadc]' : 'text-[#a29c8c]'} />
          <span className={`font-mincho text-[10px] tracking-[1px] uppercase ${moreOpen ? 'text-[#f0eadc]' : 'text-[#a29c8c]'}`}>
            More
          </span>
        </button>
      </nav>
    </>
  )
}
