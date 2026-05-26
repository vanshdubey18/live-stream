import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import CouponsClient from './CouponsClient'

export default async function CouponsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if ((user.user_metadata?.role ?? 'member') !== 'admin') redirect('/dashboard')

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: coupons } = await admin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return <CouponsClient coupons={coupons ?? []} />
}
