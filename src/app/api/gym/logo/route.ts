import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  const { data: gym, error: gymErr } = await adminClient()
    .from('gyms').select('id').eq('owner_id', user.id).maybeSingle()
  if (gymErr) return NextResponse.json({ error: gymErr.message }, { status: 500 })
  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const allowedExts = ['jpg', 'jpeg', 'jfif', 'png', 'webp', 'gif']
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: 'Only JPG, PNG, WebP or GIF allowed' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const path = `logos/${gym.id}.${ext}`

  await adminClient().storage.createBucket('gym-assets', { public: true }).catch(() => {})

  const { error: uploadErr } = await adminClient()
    .storage.from('gym-assets')
    .upload(path, buffer, { contentType: file.type, upsert: true })
  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 })

  const { data: { publicUrl } } = adminClient().storage.from('gym-assets').getPublicUrl(path)
  await adminClient().from('gyms').update({ logo_url: publicUrl }).eq('id', gym.id)

  return NextResponse.json({ url: publicUrl })
}
