import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export const runtime = 'nodejs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function verifySignature(rawBody: string, sigHeader: string | null): boolean {
  if (!sigHeader || !process.env.RAZORPAY_WEBHOOK_SECRET) return false
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(sigHeader)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sigHeader = req.headers.get('x-razorpay-signature')

  if (!verifySignature(rawBody, sigHeader)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  const admin = getAdmin()

  if (event.event === 'payment.captured' || event.event === 'order.paid') {
    const payment = event.payload?.payment?.entity
    const orderId: string | undefined = payment?.order_id
    const paymentId: string | undefined = payment?.id
    if (!orderId) return NextResponse.json({ received: true })

    const { data: purchase } = await admin
      .from('module_purchases')
      .select('id, module_id, status')
      .eq('razorpay_order_id', orderId)
      .maybeSingle()

    if (!purchase) {
      console.warn(`[razorpay-webhook] No purchase found for order ${orderId}`)
      return NextResponse.json({ received: true })
    }

    // Idempotent — Razorpay redelivers webhooks, don't double-count a sale.
    if (purchase.status !== 'paid') {
      await admin.from('module_purchases').update({
        status: 'paid',
        razorpay_payment_id: paymentId ?? null,
      }).eq('id', purchase.id)

      const { data: mod } = await admin.from('modules').select('sales_count').eq('id', purchase.module_id).maybeSingle()
      if (mod) {
        await admin.from('modules').update({ sales_count: mod.sales_count + 1 }).eq('id', purchase.module_id)
      }
      console.log(`[razorpay-webhook] Purchase ${purchase.id} marked paid`)
    }
  } else if (event.event === 'payment.failed') {
    const payment = event.payload?.payment?.entity
    const orderId: string | undefined = payment?.order_id
    if (orderId) {
      await admin.from('module_purchases').update({ status: 'failed' }).eq('razorpay_order_id', orderId).neq('status', 'paid')
    }
  }

  return NextResponse.json({ received: true })
}
