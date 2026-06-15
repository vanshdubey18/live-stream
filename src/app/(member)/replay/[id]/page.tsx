import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'
import ReplayClient from './ReplayClient'
import AccessLockedScreen from '@/components/shared/AccessLockedScreen'

export default async function ReplayPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/replay/${params.id}`)

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: session } = await adminClient
    .from('sessions')
    .select('id, title, discipline, duration_minutes, mux_playback_id, gym_id, ai_summary, ai_techniques, ai_key_moments, coaches(name), gyms(name)')
    .eq('id', params.id)
    .eq('status', 'ended')
    .maybeSingle()

  if (!session) {
    redirect('/dashboard')
  }

  // Check membership
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
      return <AccessLockedScreen gymId={session.gym_id} expiryDate={expiryDate.toISOString()} />
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiKeyMoments = session.ai_key_moments as any

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
      aiData={session.ai_summary ? {
        summary: session.ai_summary,
        techniques: aiKeyMoments?.techniques ?? (session.ai_techniques ?? []).map((name: string) => ({ name, timestamp: null })),
        moments: aiKeyMoments?.moments ?? [],
        coachQuote: aiKeyMoments?.coachQuote ?? '',
      } : null}
    />
  )
}
