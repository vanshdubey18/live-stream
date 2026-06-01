import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import WatchClient from './WatchClient'

export default async function WatchPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirectTo=/watch/${params.id}`)

  // Fetch session + coach + gym name
  const { data: session } = await supabase
    .from('sessions')
    .select('id, title, discipline, level, scheduled_at, status, mux_playback_id, gym_id, coaches(name), gyms(name)')
    .eq('id', params.id)
    .maybeSingle()

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-2">Session not found</h1>
          <Link href="/dashboard" className="text-[#FF3B3B] text-sm hover:underline">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  // Check membership — admin can always watch
  const role = user.user_metadata?.role ?? 'member'
  if (role !== 'admin') {
    const { data: membership } = await supabase
      .from('memberships')
      .select('id, free_until')
      .eq('user_id', user.id)
      .eq('gym_id', session.gym_id)
      .eq('status', 'active')
      .maybeSingle()

    if (!membership) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gymName = (session.gyms as any)?.name ?? 'this gym'

      return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-10 max-w-md w-full text-center space-y-4">
            <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase">Members Only</p>
            <h1 className="font-bebas text-3xl text-white tracking-[1px]">ACCESS RESTRICTED</h1>
            <p className="font-inter text-[#999999] text-sm max-w-xs mx-auto">
              You need an active membership at <strong className="text-white">{gymName}</strong> to watch this class.
            </p>
            <Link href="/gyms"
              className="inline-block bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] px-6 py-3 rounded-sm text-sm transition-colors">
              BROWSE GYMS
            </Link>
          </div>
        </div>
      )
    }

    if (membership.free_until && new Date(membership.free_until) < new Date()) {
      return (
        <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-10 max-w-md w-full text-center space-y-4">
            <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase">Access Expired</p>
            <h1 className="font-bebas text-3xl text-white tracking-[1px]">TRIAL ENDED</h1>
            <p className="font-inter text-[#999999] text-sm">Your free trial has expired. Renew your membership to keep watching.</p>
            <a href="/gyms" className="inline-block bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[3px] px-6 py-3 rounded-sm text-sm transition-colors">RENEW MEMBERSHIP</a>
          </div>
        </div>
      )
    }
  }

  // Determine initial phase + playback ID
  let initialPhase: 'waiting' | 'live' | 'post' = 'waiting'
  let initialPlaybackId: string | null = null

  if (session.status === 'live') {
    initialPhase = 'live'
    // Get gym's live stream playback ID
    const { data: gym } = await supabase
      .from('gyms')
      .select('mux_playback_id')
      .eq('id', session.gym_id)
      .maybeSingle()
    initialPlaybackId = gym?.mux_playback_id ?? null
  } else if (session.status === 'ended') {
    initialPhase = 'post'
    initialPlaybackId = session.mux_playback_id ?? null
  }

  return (
    <WatchClient
      session={session as any}
      initialPhase={initialPhase}
      initialPlaybackId={initialPlaybackId}
    />
  )
}
