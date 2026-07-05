import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const admin = adminClient()

  // Auto-confirm the email server-side so account creation never depends on
  // the project's "Confirm email" setting or an inbox actually receiving mail.
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name, role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data.user) return NextResponse.json({ error: 'Signup failed' }, { status: 400 })

  return NextResponse.json({ success: true, userId: data.user.id })
}
