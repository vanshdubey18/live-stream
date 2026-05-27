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

  const { data: gym, error } = await adminClient()
    .from('gyms')
    .select('id, name, description, city, location, disciplines, monthly_price_paise, instagram')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
  return NextResponse.json({ gym })
}

export async function PATCH(req: NextRequest) {
  const user = await getGymOwner()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { name, description, city, location, disciplines, monthlyPricePaise, instagram } = await req.json()

  const { data: existing } = await adminClient()
    .from('gyms')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })

  const updates: Record<string, any> = {}
  if (name !== undefined) updates.name = name
  if (description !== undefined) updates.description = description
  if (city !== undefined) updates.city = city
  if (location !== undefined) updates.location = location
  if (disciplines !== undefined) updates.disciplines = disciplines
  if (monthlyPricePaise !== undefined) updates.monthly_price_paise = monthlyPricePaise
  if (instagram !== undefined) updates.instagram = instagram

  const { error } = await adminClient()
    .from('gyms')
    .update(updates)
    .eq('id', existing.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
