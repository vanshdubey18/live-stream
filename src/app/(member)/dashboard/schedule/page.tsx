import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMemberGyms } from '@/lib/supabase/queries'
import MemberScheduleClient from './MemberScheduleClient'

export default async function SchedulePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberships = await getMemberGyms(user.id)
  const gymIds = memberships.map((m: any) => m.gyms?.id).filter(Boolean)

  // Fetch more sessions for the schedule view — no limit cap needed here
  const sessions = gymIds.length > 0
    ? await (async () => {
        const { data } = await createClient()
          .from('sessions')
          .select('id, title, discipline, scheduled_at, duration_minutes, level, status, coaches(name), gyms(name)')
          .in('gym_id', gymIds)
          .in('status', ['scheduled', 'live'])
          .order('scheduled_at', { ascending: true })
        return data ?? []
      })()
    : []

  return (
    <MemberScheduleClient
      sessions={sessions}
      hasGyms={memberships.length > 0}
    />
  )
}
