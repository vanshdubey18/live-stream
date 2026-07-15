import Razorpay from 'razorpay'

export function razorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}

// MATPEAK's cut of every instructional sale — the remainder settles to the
// gym via the existing `payouts` table.
export const PLATFORM_CUT_PERCENT = 20

export function splitPaise(amountPaise: number) {
  const platformCutPaise = Math.round(amountPaise * (PLATFORM_CUT_PERCENT / 100))
  return { platformCutPaise, gymCutPaise: amountPaise - platformCutPaise }
}
