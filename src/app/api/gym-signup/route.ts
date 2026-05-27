import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, gymName, city, location, description, disciplines, ownerName, monthlyPricePaise } = body

  const supabase = createClient()

  let userId: string
  let userEmail: string

  // If email/password provided, create a new account
  if (email && password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: ownerName,
          role: 'gym_owner',
        },
      },
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data.user) return NextResponse.json({ error: 'Signup failed' }, { status: 400 })
    userId = data.user.id
    userEmail = email
  } else {
    // Already logged in — get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    userId = user.id
    userEmail = user.email ?? ''
  }

  // Generate unique slug
  const baseSlug = slugify(gymName)
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`

  // Insert gym row
  const { data: gym, error: gymError } = await supabase
    .from('gyms')
    .insert({
      name: gymName,
      slug,
      city,
      location,
      description,
      disciplines,
      owner_email: userEmail,
      owner_id: userId,
      status: 'pending',
      // monthly_price_paise uses DB default (99900) until schema cache refreshes
    })
    .select()
    .single()

  if (gymError) return NextResponse.json({ error: gymError.message }, { status: 400 })

  // Update user role to gym_owner using admin client (bypasses RLS)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await adminClient.from('users').update({ role: 'gym_owner' }).eq('id', userId)
  await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: { role: 'gym_owner' },
  })

  return NextResponse.json({ success: true, gymId: gym.id })
}
