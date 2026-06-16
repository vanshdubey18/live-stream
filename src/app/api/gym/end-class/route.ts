import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { getDbRole } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = await getDbRole(user.id)
  if (role !== 'gym_owner' && role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { sessionId } = await req.json().catch(() => ({}))

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  if (sessionId) {
    await admin.from('sessions').update({ status: 'ended' }).eq('id', sessionId)
  } else {
    // End all live sessions for this gym
    const { data: gym } = await supabase
      .from('gyms')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (gym) {
      await admin.from('sessions').update({ status: 'ended' }).eq('gym_id', gym.id).eq('status', 'live')
    }
  }

  return NextResponse.json({ success: true })
}
