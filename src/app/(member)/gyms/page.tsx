import { createClient } from '@/lib/supabase/server'
import { getAllActiveGyms } from '@/lib/supabase/queries'
import BrowseGymsClient from './BrowseGymsClient'

export default async function BrowseGymsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const gyms = await getAllActiveGyms()

  // Get member's existing gym IDs so we can show "Joined" badge
  let joinedGymIds: string[] = []
  if (user) {
    const { data } = await supabase
      .from('memberships')
      .select('gym_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
    joinedGymIds = data?.map(m => m.gym_id) ?? []
  }

  return <BrowseGymsClient gyms={gyms} joinedGymIds={joinedGymIds} isLoggedIn={!!user} />
}
