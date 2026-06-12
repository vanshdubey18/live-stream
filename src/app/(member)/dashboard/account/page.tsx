import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MemberSidebar from '@/components/layout/MemberSidebar'
import AccountClient from './AccountClient'
import { getMemberGyms } from '@/lib/supabase/queries'

export default async function AccountPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/dashboard/account')

  const [{ data: profile }, memberships] = await Promise.all([
    supabase.from('users').select('name, phone').eq('id', user.id).maybeSingle(),
    getMemberGyms(user.id),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gyms = memberships.map((m: any) => {
    const end = m.current_period_end ?? m.free_until
    return {
      id: m.gyms?.id ?? '',
      name: m.gyms?.name ?? 'Gym',
      slug: m.gyms?.slug ?? '',
      accessUntil: end ?? null,
      accessExpired: end ? new Date(end) < new Date() : false,
    }
  })

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <MemberSidebar active="Account" />
      <AccountClient
        email={user.email ?? ''}
        name={profile?.name ?? user.user_metadata?.full_name ?? ''}
        phone={profile?.phone ?? ''}
        gyms={gyms}
      />
    </div>
  )
}
