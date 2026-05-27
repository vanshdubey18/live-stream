import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET() {
  const db = adminClient()

  // Delete all gyms
  await db.from('gyms').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Insert exactly one Mock Gym
  const { data, error } = await db.from('gyms').insert({
    name: 'Mock Gym',
    slug: 'mock-gym',
    city: 'Mumbai',
    location: 'Andheri West',
    description: 'A test gym for the pilot.',
    disciplines: ['BJJ', 'Wrestling'],
    owner_email: 'test@matpeak.com',
    status: 'active',
    monthly_price_paise: 0,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, gym: data })
}
