import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

// Self-serve data export (GDPR/DPDP-style DSAR) — returns everything this
// account has stored about the user as a single JSON download.
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = adminClient()

  const [profile, memberships, purchases, watchHistory, coupons] = await Promise.all([
    admin.from('users').select('id, email, name, phone, role, created_at').eq('id', user.id).maybeSingle(),
    admin.from('memberships').select('gym_id, status, source, plan_type, free_until, current_period_end, created_at').eq('user_id', user.id),
    admin.from('module_purchases').select('module_id, amount_paise, status, created_at').eq('user_id', user.id),
    admin.from('watch_history').select('session_id, watched_at, duration_seconds').eq('user_id', user.id),
    admin.from('coupon_redemptions').select('coupon_id, gym_id, plan_type, free_until, redeemed_at').eq('user_id', user.id),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    memberships: memberships.data ?? [],
    module_purchases: purchases.data ?? [],
    watch_history: watchHistory.data ?? [],
    coupon_redemptions: coupons.data ?? [],
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="matpeak-data-export-${user.id}.json"`,
    },
  })
}
