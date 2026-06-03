import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGymByOwnerId, getGymMembers } from '@/lib/supabase/queries'
import MembersClient from './MembersClient'

export default async function MembersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const gym = await getGymByOwnerId(user.id)
  if (!gym) redirect('/gym-dashboard')

  const members = await getGymMembers(gym.id)

  return <MembersClient gym={gym} members={members} />
}
