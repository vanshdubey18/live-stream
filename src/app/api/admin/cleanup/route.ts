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

  // Run all missing column migrations
  const migrations = [
    `alter table public.gyms add column if not exists monthly_price_paise integer not null default 99900`,
    `alter table public.gyms add column if not exists mux_playback_id text`,
    `alter table public.gyms add column if not exists stream_key text`,
    `alter table public.gyms add column if not exists mux_live_stream_id text`,
    `alter table public.gyms add column if not exists instagram text`,
    `alter table public.memberships add column if not exists source text`,
    `alter table public.memberships add column if not exists free_until timestamptz`,
    `alter table public.memberships add column if not exists price_charged_paise integer`,
    `notify pgrst, 'reload schema'`,
  ]

  const results: any[] = []
  for (const sql of migrations) {
    const { error } = await db.rpc('exec_sql', { sql }).single().catch(() => ({ error: null }))
    results.push({ sql: sql.slice(0, 50), error: error?.message ?? null })
  }

  // Delete all gyms and insert one clean Mock Gym
  await db.from('gyms').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { data, error } = await db.from('gyms').insert({
    name: 'Mock Gym',
    slug: 'mock-gym',
    city: 'Mumbai',
    location: 'Andheri West',
    description: 'A test gym for the pilot.',
    disciplines: ['BJJ', 'Wrestling'],
    owner_email: 'test@matpeak.com',
    status: 'active',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message, migrations: results }, { status: 500 })
  return NextResponse.json({ ok: true, gym: data, migrations: results })
}
