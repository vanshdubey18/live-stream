import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGymBySlug, getGymCoaches, getGymSessions, getGymMemberCount, getMembershipForGym } from '@/lib/supabase/queries'
import GymDetailClient from './GymDetailClient'


export default async function GymDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const gym = await getGymBySlug(params.slug)

  if (!gym) notFound()

  const [gymCoaches, gymSessions, memberCount, membership] = await Promise.all([
    getGymCoaches(gym.id),
    getGymSessions(gym.id),
    getGymMemberCount(gym.id),
    user ? getMembershipForGym(user.id, gym.id) : Promise.resolve(null),
  ])

  return (
    <GymDetailClient
      gym={gym}
      coaches={gymCoaches}
      sessions={gymSessions}
      memberCount={memberCount}
      membership={membership}
      isLoggedIn={!!user}
    />
  )
}
