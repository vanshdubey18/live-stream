import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MemberSidebar from '@/components/layout/MemberSidebar'
import InstructionalsClient from '@/components/member/InstructionalsClient'
import { getMemberGyms, getInstructionalsLibrary, getOwnedModuleIds } from '@/lib/supabase/queries'

export default async function InstructionalsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard/instructionals')

  const memberships = await getMemberGyms(user.id)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gymIds = memberships.map((m) => (m.gyms as any)?.id).filter(Boolean) as string[]
  const gyms = memberships
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m) => m.gyms as any)
    .filter(Boolean)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((g: any) => ({ id: g.id, name: g.name }))

  const [modules, ownedIds] = await Promise.all([
    getInstructionalsLibrary(gymIds),
    getOwnedModuleIds(user.id),
  ])

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <MemberSidebar active="Instructionals" />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <InstructionalsClient modules={modules as any} gyms={gyms} ownedIds={ownedIds} />
    </div>
  )
}
