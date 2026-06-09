import { NextRequest, NextResponse } from 'next/server'
import { assertGymOwner, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function GET() {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

  // Select '*' so a not-yet-cached optional column (instagram / price) can't 500 this.
  const { data: gym, error } = await adminClient()
    .from('gyms')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!gym) return NextResponse.json({ error: 'Gym not found' }, { status: 404 })
  return NextResponse.json({ gym })
}

export async function PATCH(req: NextRequest) {
  const user = await assertGymOwner()
  if (!user) return UNAUTHORIZED()

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

  let { error } = await adminClient().from('gyms').update(updates).eq('id', existing.id)

  // If the schema cache is missing an optional column, drop it and retry so the
  // rest of the profile still saves.
  if (error && /schema cache|monthly_price_paise|instagram/i.test(error.message)) {
    delete updates.monthly_price_paise
    delete updates.instagram
    ;({ error } = await adminClient().from('gyms').update(updates).eq('id', existing.id))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
