import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return UNAUTHORIZED()

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data, error } = await adminClient()
    .from('gyms')
    .select('id, name, slug, city, location, description, disciplines, owner_email, status, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ gym: data })
}
