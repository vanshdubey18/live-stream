import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDbRole, adminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import WatchClient from './WatchClient'
import AccessLockedScreen from '@/components/shared/AccessLockedScreen'

export default async function WatchPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/watch/${params.id}`)

  // cf_hls_url is column-locked (migration 019) — the membership check below
  // is what actually gates access, so this reads via the service-role
  // client rather than relying on RLS to differentiate members from anon.
  const { data: session } = await adminClient()
    .from('sessions')
    .select('id, title, discipline, level, scheduled_at, status, cf_hls_url, gym_id, coaches(name), gyms(name, owner_id)')
    .eq('id', params.id)
    .maybeSingle()

  if (!session) {
    return (
      <div className="min-h-screen bg-[#141410] flex items-center justify-center px-4">
        <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-10 max-w-md w-full text-center space-y-4">
          <p className="font-mincho text-[11px] text-[#7a7568] tracking-[4px] uppercase">Not Found</p>
          <h1 className="font-mincho text-3xl text-[#f0eadc] tracking-[1px]">SESSION NOT FOUND</h1>
          <p className="font-mincho text-[#a29c8c] text-sm">This class may have been removed or the link is incorrect.</p>
          <Link href="/dashboard" className="inline-block border border-[#322f26] hover:border-[#7a7568] text-[#f0eadc] font-mincho tracking-[3px] px-6 py-3 rounded-sm text-sm transition-colors">GO TO DASHBOARD</Link>
        </div>
      </div>
    )
  }

  // Check membership — admin can always watch
  const role = await getDbRole(user.id)
  if (role !== 'admin') {
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, free_until, current_period_end')
      .eq('user_id', user.id)
      .eq('gym_id', session.gym_id)
      .eq('status', 'active')
      .maybeSingle()

    if (!membership) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gymName = (session.gyms as any)?.name ?? 'this gym'

      return (
        <div className="min-h-screen bg-[#141410] flex items-center justify-center px-4">
          <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-10 max-w-md w-full text-center space-y-4">
            <p className="font-mincho text-[11px] text-[#7a7568] tracking-[4px] uppercase">Members Only</p>
            <h1 className="font-mincho text-3xl text-[#f0eadc] tracking-[1px]">ACCESS RESTRICTED</h1>
            <p className="font-mincho text-[#a29c8c] text-sm max-w-xs mx-auto">
              You need an active membership at <strong className="text-[#f0eadc]">{gymName}</strong> to watch this class.
            </p>
            <Link href="/gyms"
              className="inline-block bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[3px] px-6 py-3 rounded-sm text-sm transition-colors">
              BROWSE GYMS
            </Link>
          </div>
        </div>
      )
    }

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

  // Fetch the viewer's display name for presence tracking
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .maybeSingle()
  const userName = profile?.name ?? user.email?.split('@')[0] ?? 'Member'

  // Determine initial phase + HLS URL
  let initialPhase: 'waiting' | 'live' | 'post' = 'waiting'
  let initialHlsUrl: string | null = null

  if (session.status === 'live') {
    initialPhase = 'live'
    // Prefer HLS URL stored on the session; fall back to gym's current URL
    if ((session as any).cf_hls_url) {
      initialHlsUrl = (session as any).cf_hls_url
    } else {
      const { data: gym } = await adminClient()
        .from('gyms')
        .select('cf_hls_url')
        .eq('id', session.gym_id)
        .maybeSingle()
      initialHlsUrl = gym?.cf_hls_url ?? null
    }
  } else if (session.status === 'ended') {
    initialPhase = 'post'
    // No recording on free plan
  }

  return (
    <WatchClient
      session={session as any}
      initialPhase={initialPhase}
      initialPlaybackId={initialHlsUrl}
      userId={user.id}
      userName={userName}
    />
  )
}
