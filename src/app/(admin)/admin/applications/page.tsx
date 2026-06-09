import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient, getDbRole } from '@/lib/supabase/admin'
import ApplicationsClient from './ApplicationsClient'

export default async function ApplicationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = await getDbRole(user.id)
  if (role !== 'admin') redirect('/dashboard')

  const { data: gyms } = await adminClient()
    .from('gyms')
    .select('id, name, city, location, disciplines, owner_email, status, created_at')
    .order('created_at', { ascending: false })

  const allGyms = gyms ?? []
  const pendingCount = allGyms.filter(g => g.status === 'pending').length

  return <ApplicationsClient gyms={allGyms} pendingCount={pendingCount} />
}
