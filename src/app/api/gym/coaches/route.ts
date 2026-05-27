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

export async function GET() {
  const user = await getGymOwner()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

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

  const { name, discipline, beltRank, bio } = await req.json()
  if (!name || !discipline) return NextResponse.json({ error: 'Name and discipline are required' }, { status: 400 })

  const { data: gym } = await adminClient()
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const { data, error } = await adminClient()
    .from('coaches')
    .insert({ gym_id: gym.id, name, discipline, belt_rank: beltRank || null, bio: bio || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coach: data })
}

export async function DELETE(req: NextRequest) {
  const user = await getGymOwner()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await adminClient().from('coaches').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
