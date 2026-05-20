import { createClient } from '@/lib/supabase/server'
import GymSignupClient from './GymSignupClient'

export default async function GymSignupPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <GymSignupClient
      isLoggedIn={!!user}
      prefillName={user?.user_metadata?.full_name ?? ''}
      prefillEmail={user?.email ?? ''}
    />
  )
}
