import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient, getDbRole } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { confirm } = await req.json().catch(() => ({}))
  if (confirm !== 'DELETE') {
    return NextResponse.json({ error: 'Type DELETE to confirm' }, { status: 400 })
  }

  const role = await getDbRole(user.id)
  if (role === 'gym_owner') {
    // Deleting a gym owner leaves their gym orphaned (owner_id -> null) but
    // still live with active members — too risky to do silently from a
    // self-serve button. Route them to support so the gym can be handed
    // off or wound down properly first.
    return NextResponse.json(
      { error: 'Gym owner accounts can\'t be self-deleted yet — contact support to close your gym first.' },
      { status: 400 }
    )
  }

  // Deletes the auth.users row, which cascades (ON DELETE CASCADE) through
  // public.users to memberships, watch_history, module_purchases,
  // coupon_redemptions, and live_chat_messages.
  const { error } = await adminClient().auth.admin.deleteUser(user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
