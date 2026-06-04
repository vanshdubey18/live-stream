import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function getGymOwner() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if ((user.user_metadata?.role ?? 'member') !== 'gym_owner') return null
  return user
}

async function uploadPhoto(file: File, coachId: string): Promise<string | null> {
  const admin = adminClient()
  // Ensure bucket exists
  await admin.storage.createBucket('coach-avatars', { public: true }).catch(() => {})

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${coachId}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await admin.storage
    .from('coach-avatars')
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (error) return null

  const { data } = admin.storage.from('coach-avatars').getPublicUrl(path)
  return data.publicUrl
}

export async function GET() {
  const user = await getGymOwner()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  // Ensure coach-avatars bucket exists (no-op if already created)
  await adminClient().storage.createBucket('coach-avatars', { public: true }).catch(() => {})

  const { data: gym } = await adminClient()
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ coaches: [] })

  const { data, error } = await adminClient()
    .from('coaches')
    .select('*')
    .eq('gym_id', gym.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coaches: data ?? [] })
}

export async function POST(req: NextRequest) {
  const user = await getGymOwner()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const formData = await req.formData()
  const name = formData.get('name') as string
  const discipline = formData.get('discipline') as string
  const beltRank = formData.get('beltRank') as string | null
  const bio = formData.get('bio') as string | null
  const photo = formData.get('photo') as File | null

  if (!name || !discipline) return NextResponse.json({ error: 'Name and discipline are required' }, { status: 400 })

  const { data: gym } = await adminClient()
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  // Insert coach first to get ID
  const { data: coach, error } = await adminClient()
    .from('coaches')
    .insert({ gym_id: gym.id, name, discipline, belt_rank: beltRank || null, bio: bio || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Upload photo if provided
  if (photo && photo.size > 0) {
    const avatarUrl = await uploadPhoto(photo, coach.id)
    if (avatarUrl) {
      await adminClient().from('coaches').update({ avatar_url: avatarUrl }).eq('id', coach.id)
      coach.avatar_url = avatarUrl
    }
  }

  return NextResponse.json({ coach })
}

export async function PATCH(req: NextRequest) {
  const user = await getGymOwner()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const formData = await req.formData()
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const discipline = formData.get('discipline') as string
  const beltRank = formData.get('beltRank') as string | null
  const bio = formData.get('bio') as string | null
  const photo = formData.get('photo') as File | null

  if (!id || !name || !discipline) return NextResponse.json({ error: 'id, name and discipline are required' }, { status: 400 })

  const { data: gym } = await adminClient()
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const updates: Record<string, string | null> = {
    name,
    discipline,
    belt_rank: beltRank || null,
    bio: bio || null,
  }

  // Upload new photo if provided
  if (photo && photo.size > 0) {
    const avatarUrl = await uploadPhoto(photo, id)
    if (avatarUrl) updates.avatar_url = avatarUrl
  }

  const { data: coach, error } = await adminClient()
    .from('coaches')
    .update(updates)
    .eq('id', id)
    .eq('gym_id', gym.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coach })
}

export async function DELETE(req: NextRequest) {
  const user = await getGymOwner()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: gym } = await adminClient()
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const { error } = await adminClient().from('coaches').delete().eq('id', id).eq('gym_id', gym.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
