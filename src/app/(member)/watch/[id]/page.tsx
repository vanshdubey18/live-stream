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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-2">Session not found</h1>
          <Link href="/dashboard" className="text-[#DC2626] text-sm hover:underline">Back to dashboard</Link>
        </div>
      </div>
    )
  }

  // Check membership — admin can always watch
  const role = user.user_metadata?.role ?? 'member'
  if (role !== 'admin') {
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', user.id)
      .eq('gym_id', session.gym_id)
      .eq('status', 'active')
      .maybeSingle()

    if (!membership) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gymName = (session.gyms as any)?.name ?? 'this gym'
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="text-5xl">🔒</div>
            <h1 className="text-white text-2xl font-bold">Members only</h1>
            <p className="text-[#888888] text-sm max-w-xs mx-auto">
              You need an active membership at <strong className="text-white">{gymName}</strong> to watch this class.
            </p>
            <Link href="/gyms"
              className="inline-block bg-[#DC2626] hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Browse Gyms
            </Link>
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
