import AICoachButton from '@/components/ai/AICoachButton'
import MobileTabBar from '@/components/layout/MobileTabBar'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Extra bottom space on mobile so the tab bar never covers content */}
      <div className="pb-16 lg:pb-0">{children}</div>
      <MobileTabBar />
      <AICoachButton />
    </>
  )
}
