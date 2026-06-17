import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGymByOwnerId } from '@/lib/supabase/queries'
import StreamSetupPageClient from './StreamSetupPageClient'

export default async function StreamSetupPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const gym = await getGymByOwnerId(user.id)
  if (!gym) redirect('/gym-dashboard')

  return (
    <StreamSetupPageClient gymId={gym.id} />
  )
}
