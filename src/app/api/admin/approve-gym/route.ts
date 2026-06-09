import { NextRequest, NextResponse } from 'next/server'
import { assertAdmin, adminClient, UNAUTHORIZED } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const user = await assertAdmin()
  if (!user) return UNAUTHORIZED()

  const { gymId, action } = await req.json()
  if (!gymId || !action) return NextResponse.json({ error: 'Missing gymId or action' }, { status: 400 })
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }

  const newStatus = action === 'approve' ? 'active' : 'rejected'
  const { error } = await adminClient().from('gyms').update({ status: newStatus }).eq('id', gymId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, status: newStatus })
}
