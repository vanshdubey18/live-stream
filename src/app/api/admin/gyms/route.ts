import { NextResponse } from 'next/server'
import { assertAdmin, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function GET() {
  const user = await assertAdmin()
  if (!user) return UNAUTHORIZED()

  const { data, error } = await adminClient()
    .from('gyms')
    .select('id, slug, name, city, disciplines, status, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ gyms: data })
}
