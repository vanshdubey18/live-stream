import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { session_id } = await req.json()
  if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })

  const supabase = adminClient()

  // Verify this session belongs to the caller's gym
  const { data: session } = await supabase
    .from('sessions')
    .select('id, cf_video_uid, gyms!inner(owner_id)')
    .eq('id', session_id)
    .maybeSingle()

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  if ((session.gyms as any)?.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }
  if (!session.cf_video_uid) {
    return NextResponse.json({ error: 'Recording not ready yet' }, { status: 400 })
  }

  // Call Cloudflare clip API
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/stream/clip`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
      },
      body: JSON.stringify({
        clippedFromVideoUID: session.cf_video_uid,
        startTimeSeconds: 0,
        endTimeSeconds: 60,
      }),
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Clip API failed' }, { status: 502 })
  }

  const json = await res.json()
  const clipUid = json.result?.uid
  if (!clipUid) return NextResponse.json({ error: 'No clip UID returned' }, { status: 502 })

  await supabase.from('sessions').update({
    clip_video_uid: clipUid,
    clip_status: 'pending',
    clip_url: null,
  }).eq('id', session_id)

  return NextResponse.json({ success: true })
}
