import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'
import { createDirectUpload } from '@/lib/cloudflare'

export async function GET() {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { data: gym } = await adminClient()
    .from('gyms').select('id').eq('owner_id', user.id).maybeSingle()
  if (!gym) return NextResponse.json({ modules: [] })

  const { data, error } = await adminClient()
    .from('modules')
    .select('id, title, description, discipline, level, price_paise, status, cf_video_uid, duration_seconds, sales_count, created_at, coaches ( id, name )')
    .eq('gym_id', gym.id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ modules: data ?? [] })
}

export async function POST(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const body = await req.json()
  const { title, description, discipline, level, priceRupees, coachId } = body

  if (!title || !discipline || !level || !priceRupees) {
    return NextResponse.json({ error: 'title, discipline, level and priceRupees are required' }, { status: 400 })
  }
  const pricePaise = Math.round(Number(priceRupees) * 100)
  if (!Number.isFinite(pricePaise) || pricePaise <= 0) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  const { data: gym } = await adminClient()
    .from('gyms').select('id').eq('owner_id', user.id).maybeSingle()
  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const { data: mod, error } = await adminClient()
    .from('modules')
    .insert({
      gym_id: gym.id,
      coach_id: coachId || null,
      title,
      description: description || null,
      discipline,
      level,
      price_paise: pricePaise,
      status: 'uploading',
    })
    .select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const { uploadUrl, uid } = await createDirectUpload()
    await adminClient().from('modules').update({ cf_video_uid: uid }).eq('id', mod.id)
    return NextResponse.json({ module: { ...mod, cf_video_uid: uid }, uploadUrl })
  } catch (err) {
    await adminClient().from('modules').update({ status: 'failed' }).eq('id', mod.id)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload provisioning failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: gym } = await adminClient()
    .from('gyms').select('id').eq('owner_id', user.id).maybeSingle()
  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const { error } = await adminClient().from('modules').delete().eq('id', id).eq('gym_id', gym.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
