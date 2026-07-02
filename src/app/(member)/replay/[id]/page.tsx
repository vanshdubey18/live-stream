import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'
import ReplayClient from './ReplayClient'
import AccessLockedScreen from '@/components/shared/AccessLockedScreen'

// Member-facing replay visibility window. The underlying video is never
// deleted (it stays in Cloudflare + feeds AI training indefinitely) — this
// only limits how long a member can watch it.
const REPLAY_WINDOW_DAYS = 30

export default async function ReplayPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/replay/${params.id}`)

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const [{ data: session }, { data: chaptersData }] = await Promise.all([
    adminClient
      .from('sessions')
      .select('id, title, discipline, duration_minutes, replay_url, scheduled_at, gym_id, ai_summary, ai_techniques, ai_key_moments, coaches(name), gyms(name)')
      .eq('id', params.id)
      .eq('status', 'ended')
      .maybeSingle(),
    adminClient
      .from('replay_chapters')
      .select('id, timestamp_seconds, label')
      .eq('session_id', params.id)
      .order('timestamp_seconds', { ascending: true }),
  ])

  if (!session) {
    redirect('/dashboard')
  }

  const role = await getDbRole(user.id)

  // Check membership
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

  // Replay visibility window — separate from membership status. The class
  // itself just ages out of the replay library after REPLAY_WINDOW_DAYS.
  if (role !== 'admin') {
    const classAgeMs = Date.now() - new Date(session.scheduled_at).getTime()
    const windowMs = REPLAY_WINDOW_DAYS * 24 * 60 * 60 * 1000
    if (classAgeMs > windowMs) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
          <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-8 py-16 max-w-md w-full text-center overflow-hidden">
            <span className="absolute inset-0 flex items-center justify-center font-bebas text-[110px] text-white/[0.03] leading-none select-none pointer-events-none">
              ARCHIVED
            </span>
            <div className="relative space-y-3">
              <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase">Replay Archived</p>
              <h1 className="font-bebas text-3xl text-white tracking-[1px]">NO LONGER AVAILABLE</h1>
              <p className="font-inter text-[#999999] text-sm leading-relaxed">
                Replays are available for {REPLAY_WINDOW_DAYS} days after class. This one has aged out of the library.
              </p>
              <a href="/dashboard/replays" className="inline-block font-inter text-[#555555] hover:text-white text-xs transition-colors pt-2">
                Back to replays
              </a>
            </div>
          </div>
        </div>
      )
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiKeyMoments = session.ai_key_moments as any

  return (
    <ReplayClient
      replayUrl={session.replay_url ?? undefined}
      chapters={chaptersData ?? []}
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
