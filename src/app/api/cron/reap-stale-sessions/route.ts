import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getLiveInputStatus } from '@/lib/cloudflare'

export const runtime = 'nodejs'
export const maxDuration = 60

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Vercel Cron, every 5 minutes (see vercel.json). Sweeps for sessions stuck
// marked "live" in the DB after a broadcaster's browser crashed/closed
// without ever calling /api/gym/end-class — otherwise members can be shown a
// "LIVE" badge for a class that isn't happening, indefinitely, since nothing
// else cleans this up until that gym's *next* go-live force-ends it.
//
// Cross-checks each "live" session against Cloudflare's own live input
// status (the source of truth for whether a broadcaster is actually
// publishing) rather than trusting our DB state.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  const { data: liveSessions, error } = await admin
    .from('sessions')
    .select('id, gyms!inner(cf_live_input_uid)')
    .eq('status', 'live')

  if (error) {
    console.error('[reap-stale-sessions] query failed:', error)
    return NextResponse.json({ error: 'Query failed' }, { status: 500 })
  }
  if (!liveSessions?.length) return NextResponse.json({ reaped: 0, checked: 0 })

  let reaped = 0
  for (const session of liveSessions) {
    const liveInputUid = (session as any).gyms?.cf_live_input_uid as string | undefined
    if (!liveInputUid) continue
    try {
      const status = await getLiveInputStatus(liveInputUid)
      if (status === 'disconnected') {
        await admin.from('sessions').update({ status: 'ended' }).eq('id', session.id)
        reaped++
      }
    } catch (err) {
      console.error('[reap-stale-sessions] status check failed for session', session.id, err)
    }
  }

  console.log(`[reap-stale-sessions] checked ${liveSessions.length}, reaped ${reaped}`)
  return NextResponse.json({ reaped, checked: liveSessions.length })
}
