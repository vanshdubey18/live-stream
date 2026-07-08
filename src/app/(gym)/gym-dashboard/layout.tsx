import { createClient } from '@/lib/supabase/server'
import { getGymByOwnerId } from '@/lib/supabase/queries'
import GymMobileTabBar from '@/components/layout/GymMobileTabBar'
import AICoachButton from '@/components/ai/AICoachButton'

export default async function GymDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const gym = user ? await getGymByOwnerId(user.id) : null

  return (
    <>
      {/* Extra bottom space on mobile so the tab bar never covers content */}
      <div className="pb-16 lg:pb-0">{children}</div>
      <GymMobileTabBar />
      {gym && <AICoachButton gymId={gym.id} />}
    </>
  )
}
