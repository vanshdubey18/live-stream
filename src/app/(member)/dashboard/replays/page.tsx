import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MemberSidebar from '@/components/layout/MemberSidebar'
import ReplaysClient from '@/components/member/ReplaysClient'
import { getMemberGyms, getReplayLibrary } from '@/lib/supabase/queries'

export default async function ReplaysPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard/replays')

  const memberships = await getMemberGyms(user.id)
  const gymIds = memberships.map((m) => (m.gyms as any)?.id).filter(Boolean) as string[]
  const gyms = memberships
    .map((m) => m.gyms as any)
    .filter(Boolean)
    .map((g: any) => ({ id: g.id, name: g.name }))

  const replays = await getReplayLibrary(gymIds)

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <MemberSidebar active="Replays" />
      <ReplaysClient replays={replays as any} gyms={gyms} />
    </div>
  )
}
