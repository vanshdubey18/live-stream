import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient, getDbRole } from '@/lib/supabase/admin'
import Link from 'next/link'
import ReplayClient from './ReplayClient'

export default async function ReplayPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/replay/${params.id}`)

  const { data: session } = await adminClient()
    .from('sessions')
    .select('id, title, discipline, duration_minutes, mux_playback_id, gym_id, coaches(name), gyms(name)')
    .eq('id', params.id)
    .eq('status', 'ended')
    .maybeSingle()

  if (!session) {
    redirect('/dashboard')
  }

  // Check membership — admin (verified against DB) can always watch
  const role = await getDbRole(user.id)
  if (role !== 'admin') {
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, free_until, current_period_end')
      .eq('user_id', user.id)
      .eq('gym_id', session.gym_id)
      .eq('status', 'active')
      .maybeSingle()

    if (!membership) redirect('/gyms')

    const now = new Date()
    const expiryDate = membership.current_period_end
      ? new Date(membership.current_period_end)
      : membership.free_until
        ? new Date(membership.free_until)
        : null

    if (expiryDate && expiryDate < now) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-10 max-w-md w-full text-center space-y-4">
            <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase">Access Expired</p>
            <h1 className="font-bebas text-3xl text-white tracking-[1px]">ACCESS LOCKED</h1>
            <p className="font-inter text-[#999999] text-sm leading-relaxed">
              Your access period ended on {expiryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
              You&apos;re still a member of this gym — contact your coach to renew access.
            </p>
            <Link href="/dashboard" className="inline-block border border-[#333333] hover:border-[#555555] text-white font-bebas tracking-[3px] px-6 py-3 rounded-sm text-sm transition-colors">GO TO DASHBOARD</Link>
          </div>
        </div>
      )
    }
  }

  return (
    <ReplayClient
      playbackId={session.mux_playback_id ?? undefined}
      session={{
        title: session.title,
        discipline: session.discipline,
        duration_minutes: session.duration_minutes,
        coach: (session.coaches as any)?.name ?? null,
        gym: (session.gyms as any)?.name ?? null,
      }}
    />
  )
}
