import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { assertAdmin } from '@/lib/supabase/admin'

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET() {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { data, error } = await adminClient()
    .from('gyms')
    .select('id, slug, name, city, disciplines, status, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ gyms: data })
}

// Cascades to sessions, memberships, coaches, etc. — all reference gyms(id) with ON DELETE CASCADE.
export async function DELETE(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { gymId } = await req.json().catch(() => ({}))
  if (!gymId) return NextResponse.json({ error: 'Missing gymId' }, { status: 400 })

  const { error } = await adminClient().from('gyms').delete().eq('id', gymId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
