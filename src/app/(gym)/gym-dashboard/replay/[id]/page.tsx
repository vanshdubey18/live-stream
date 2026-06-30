import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { assertGymOwner, adminClient } from '@/lib/supabase/admin'
import GymSidebar from '@/components/layout/GymSidebar'
import ChapterEditor from './ChapterEditor'

export default async function GymReplayPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: session }, { data: chapters }] = await Promise.all([
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
  ])

  if (!session) redirect('/gym-dashboard/schedule')
  if ((session.gyms as any)?.owner_id !== user.id) redirect('/gym-dashboard/schedule')
  if (session.status !== 'ended') redirect('/gym-dashboard/schedule')

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Schedule" />
      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Replay</p>
            <h1 className="font-bebas text-2xl text-white tracking-[1px] leading-tight">{session.title}</h1>
          </div>
        </div>
        <div className="px-6 py-6 max-w-2xl">
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
