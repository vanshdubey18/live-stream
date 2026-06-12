import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'
import AdminOverviewClient from './AdminOverviewClient'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export default async function AdminOverviewPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getDbRole(user.id)
  if (role !== 'admin') redirect('/dashboard')

  // Fetch all platform stats in parallel
  const [
    { count: memberCount },
    { count: gymCount },
    { count: pendingCount },
    { data: gyms },
    { data: members },
    { data: coupons },
    { data: payouts },
    { data: sessions },
  ] = await Promise.all([
    adminClient().from('memberships').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminClient().from('gyms').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminClient().from('gyms').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient().from('gyms').select('id, name, city, status, created_at').order('created_at', { ascending: false }),
    adminClient().from('users').select('id, email, name, role, created_at').order('created_at', { ascending: false }),
    adminClient().from('coupons').select('*').order('created_at', { ascending: false }),
    adminClient().from('payouts').select('*, gyms(name)').order('period_start', { ascending: false }),
    adminClient().from('sessions').select('id, status').eq('status', 'live'),
  ])

  return (
    <AdminOverviewClient
      stats={{
        memberCount: memberCount ?? 0,
        gymCount: gymCount ?? 0,
        pendingCount: pendingCount ?? 0,
        liveCount: sessions?.length ?? 0,
      }}
      gyms={gyms ?? []}
      members={members ?? []}
      coupons={coupons ?? []}
      payouts={payouts ?? []}
    />
  )
}
