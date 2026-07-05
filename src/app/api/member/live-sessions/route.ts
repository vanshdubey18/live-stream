import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

// Lightweight poll fallback for members: is any session live across their gyms?
// Backs up Realtime so "gym went live" shows up within a few seconds even if the
// postgres_changes subscription misses the event.
export async function GET(req: NextRequest) {
  const gymIdsParam = req.nextUrl.searchParams.get('gym_ids') ?? ''
  const gymIds = gymIdsParam.split(',').map(s => s.trim()).filter(Boolean)
  if (!gymIds.length) return NextResponse.json({ session: null })

  const { data } = await admin()
    .from('sessions')
    .select('id, title, discipline, gym_id')
    .in('gym_id', gymIds)
    .eq('status', 'live')
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ session: data ?? null })
}
