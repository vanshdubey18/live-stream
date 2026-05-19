import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-[#0a0a0a] p-8">
      <h1 className="text-white text-2xl font-bold mb-2">
        Welcome back, {user.user_metadata?.full_name ?? 'Fighter'}
      </h1>
      <p className="text-[#888888]">Member dashboard coming in the next step.</p>
    </main>
  )
}
