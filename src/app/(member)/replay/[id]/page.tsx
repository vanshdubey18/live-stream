import { createClient } from '@/lib/supabase/server'
import ReplayClient from './ReplayClient'

export default async function ReplayPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch session to get the recorded playback ID
  const { data: session } = await supabase
    .from('sessions')
    .select('mux_playback_id')
    .eq('id', params.id)
    .maybeSingle()

  return <ReplayClient playbackId={session?.mux_playback_id ?? undefined} />
}
