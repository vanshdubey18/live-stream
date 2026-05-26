import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const role = user.user_metadata?.role ?? 'member'
  if (role !== 'admin') return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

  const { gymId, action } = await req.json()
  if (!gymId || !action) return NextResponse.json({ error: 'Missing gymId or action' }, { status: 400 })
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const newStatus = action === 'approve' ? 'active' : 'rejected'
  const { error } = await admin.from('gyms').update({ status: newStatus }).eq('id', gymId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, status: newStatus })
}
