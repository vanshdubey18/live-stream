import { createClient } from '@/lib/supabase/server'
import LiveClient from './LiveClient'

export default async function LivePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch session → gym to get the live stream playback ID
  const { data: session } = await supabase
    .from('sessions')
    .select('gym_id')
    .eq('id', params.id)
    .maybeSingle()

  let playbackId: string | undefined
  if (session?.gym_id) {
    const { data: gym } = await supabase
      .from('gyms')
      .select('mux_playback_id')
      .eq('id', session.gym_id)
      .maybeSingle()
    playbackId = gym?.mux_playback_id ?? undefined
  }

  return <LiveClient playbackId={playbackId} />
}
