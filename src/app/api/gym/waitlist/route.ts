import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, gym_name, discipline, city, contact, website } = body

  // Honeypot — bots fill the hidden field
  if (website) return NextResponse.json({ success: true })

  if (!name || !gym_name || !discipline || !city || !contact) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const supabase = adminClient()

  // Rate limit: max 10 submissions per IP per hour
  if (ip) {
    const { count } = await supabase
      .from('gym_waitlist')
      .select('id', { count: 'exact', head: true })
      .eq('submitted_ip', ip)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if ((count ?? 0) >= 10) {
      return NextResponse.json({ error: 'Too many submissions. Try again later.' }, { status: 429 })
    }
  }

  const { error } = await supabase.from('gym_waitlist').insert({
    name,
    gym_name,
    discipline,
    city,
    contact,
    submitted_ip: ip,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ duplicate: true }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify founder — best effort, don't fail the request if email fails
  const resendKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL
  if (resendKey && adminEmail) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: 'MATPEAK <noreply@matpeak.com>',
        to: adminEmail,
        subject: `New gym waitlist: ${gym_name}`,
        text: `Name: ${name}\nGym: ${gym_name}\nDiscipline: ${discipline}\nCity: ${city}\nContact: ${contact}`,
      }),
    }).catch(() => {})
  }

  return NextResponse.json({ success: true })
}
