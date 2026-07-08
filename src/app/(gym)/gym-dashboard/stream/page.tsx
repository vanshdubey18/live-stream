import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGymByOwnerId } from '@/lib/supabase/queries'
import StreamSetupPageClient from './StreamSetupPageClient'

export default async function StreamSetupPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const gym = await getGymByOwnerId(user.id)
  if (!gym) redirect('/gym-dashboard')

  // If going live against a class scheduled ahead of time, its title/discipline
  // are already known — no need to ask again on this screen.
  let scheduledTitle: string | null = null
  let scheduledDiscipline: string | null = null
  if (searchParams.session_id) {
    const { data: scheduled } = await supabase
      .from('sessions')
      .select('title, discipline')
      .eq('id', searchParams.session_id)
      .eq('gym_id', gym.id)
      .maybeSingle()
    scheduledTitle = scheduled?.title ?? null
    scheduledDiscipline = scheduled?.discipline ?? null
  }

  return (
    <StreamSetupPageClient
      gymId={gym.id}
      ownerId={user.id}
      hasCfStream={!!gym.cf_live_input_uid}
      sessionId={searchParams.session_id ?? null}
      gymDisciplines={gym.disciplines ?? []}
      scheduledTitle={scheduledTitle}
      scheduledDiscipline={scheduledDiscipline}
    />
  )
}
