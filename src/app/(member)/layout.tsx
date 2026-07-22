'use client'

import { usePathname } from 'next/navigation'
import AICoachButton from '@/components/ai/AICoachButton'
import MobileTabBar from '@/components/layout/MobileTabBar'

// Watch/live/replay pages are immersive, full-screen video experiences —
// a persistent bottom tab bar and floating AI Coach button would sit on
// top of the video (and, in landscape, on top of the fullscreen overlay
// entirely, since both use the same z-index and the tab bar renders later
// in the DOM). Suppress the standard chrome on those routes only.
function isImmersiveRoute(pathname: string) {
  return pathname.startsWith('/watch/') || pathname.startsWith('/live/') || pathname.startsWith('/replay/')
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const immersive = isImmersiveRoute(pathname)

  if (immersive) return <>{children}</>

  return (
    <>
      {/* Extra bottom space on mobile so the tab bar never covers content */}
      <div className="pb-16 lg:pb-0">{children}</div>
      <MobileTabBar />
      <AICoachButton />
    </>
  )
}
