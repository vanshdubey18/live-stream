import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET() {
  const db = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: gyms } = await db.from('gyms').select('id, name, status, owner_id, owner_email, created_at').order('created_at', { ascending: false })

  return NextResponse.json({ gyms })
}
