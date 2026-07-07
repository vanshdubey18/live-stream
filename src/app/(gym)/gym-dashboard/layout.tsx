import GymMobileTabBar from '@/components/layout/GymMobileTabBar'

export default function GymDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Extra bottom space on mobile so the tab bar never covers content */}
      <div className="pb-16 lg:pb-0">{children}</div>
      <GymMobileTabBar />
    </>
  )
}
