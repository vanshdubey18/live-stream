import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { razorpayClient, splitPaise } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 401 })

  const { moduleId } = await req.json()
  if (!moduleId) return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 })

  const admin = adminClient()
  const { data: mod } = await admin
    .from('modules')
    .select('id, gym_id, title, price_paise, status')
    .eq('id', moduleId)
    .maybeSingle()

  if (!mod || mod.status === 'failed') return NextResponse.json({ error: 'Instructional not found' }, { status: 404 })
  if (mod.status === 'uploading') return NextResponse.json({ error: 'Still uploading — try again shortly' }, { status: 409 })

  const { data: existing } = await admin
    .from('module_purchases')
    .select('id')
    .eq('user_id', user.id)
    .eq('module_id', moduleId)
    .eq('status', 'paid')
    .maybeSingle()
  if (existing) return NextResponse.json({ error: 'Already purchased' }, { status: 409 })

  const { platformCutPaise, gymCutPaise } = splitPaise(mod.price_paise)

  let order
  try {
    order = await razorpayClient().orders.create({
      amount: mod.price_paise,
      currency: 'INR',
      notes: { module_id: mod.id, user_id: user.id },
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not start payment' }, { status: 502 })
  }

  const { error } = await admin.from('module_purchases').insert({
    module_id: mod.id,
    user_id: user.id,
    gym_id: mod.gym_id,
    amount_paise: mod.price_paise,
    platform_cut_paise: platformCutPaise,
    gym_cut_paise: gymCutPaise,
    razorpay_order_id: order.id,
    status: 'created',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    orderId: order.id,
    amount: mod.price_paise,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    moduleTitle: mod.title,
  })
}
