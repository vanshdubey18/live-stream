import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import ApplicationsClient from './ApplicationsClient'

export default async function ApplicationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role ?? 'member'
  if (role !== 'admin') redirect('/dashboard')

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: gyms } = await adminClient
    .from('gyms')
    .select('id, name, city, location, disciplines, owner_email, status, created_at')
    .order('created_at', { ascending: false })

  const allGyms = gyms ?? []
  const pendingCount = allGyms.filter(g => g.status === 'pending').length

  return <ApplicationsClient gyms={allGyms} pendingCount={pendingCount} />
}
