import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const role = data.user.user_metadata?.role ?? 'member'
      if (role === 'admin') return NextResponse.redirect(`${origin}/admin`)
      if (role === 'gym_owner') return NextResponse.redirect(`${origin}/gym-dashboard`)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
