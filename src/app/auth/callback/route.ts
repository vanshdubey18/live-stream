import { createClient } from '@/lib/supabase/server'
import { getDbRole } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Note: password-recovery links never hit this route — forgot-password's
  // redirectTo sends them straight to /reset-password, which exchanges the
  // code client-side.

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const role = await getDbRole(data.user.id)
      if (role === 'admin') return NextResponse.redirect(`${origin}/admin`)
      if (role === 'gym_owner') return NextResponse.redirect(`${origin}/gym-dashboard`)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
