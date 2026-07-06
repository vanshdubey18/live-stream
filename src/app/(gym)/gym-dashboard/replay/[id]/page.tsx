import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import GymSidebar from '@/components/layout/GymSidebar'
import ChapterEditor from './ChapterEditor'
import SuggestedTechniques from './SuggestedTechniques'

export default async function GymReplayPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: session }, { data: chapters }, { data: techniqueRows }] = await Promise.all([
    adminClient()
      .from('sessions')
      .select('id, title, discipline, status, replay_url, duration_seconds, gyms!inner(owner_id)')
      .eq('id', params.id)
      .maybeSingle(),
    adminClient()
      .from('replay_chapters')
      .select('id, timestamp_seconds, label')
      .eq('session_id', params.id)
      .order('timestamp_seconds', { ascending: true }),
    adminClient()
      .from('session_techniques')
      .select('technique_id, timestamp_seconds, verified_at, techniques(name)')
      .eq('session_id', params.id)
      .order('timestamp_seconds', { ascending: true, nullsFirst: false }),
  ])

  if (!session) redirect('/gym-dashboard/schedule')
  if ((session.gyms as any)?.owner_id !== user.id) redirect('/gym-dashboard/schedule')
  if (session.status !== 'ended') redirect('/gym-dashboard/schedule')

  const suggestedTechniques = (techniqueRows ?? []).map(row => ({
    technique_id: row.technique_id,
    name: (row.techniques as any)?.name ?? 'Unknown technique',
    timestamp_seconds: row.timestamp_seconds,
    verified: row.verified_at !== null,
  }))

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <GymSidebar active="Schedule" />
      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#322f26] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Replay</p>
            <h1 className="font-mincho text-2xl text-[#f0eadc] tracking-[1px] leading-tight">{session.title}</h1>
          </div>
        </div>
        <div className="px-6 py-6 max-w-2xl space-y-6">
          <SuggestedTechniques
            sessionId={params.id}
            initialTechniques={suggestedTechniques}
          />
          <ChapterEditor
            sessionId={params.id}
            replayUrl={session.replay_url ?? null}
            durationSeconds={session.duration_seconds ?? null}
            initialChapters={chapters ?? []}
          />
        </div>
      </main>
    </div>
  )
}
