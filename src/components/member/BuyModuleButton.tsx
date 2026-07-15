'use client'

import { useState } from 'react'
import Script from 'next/script'
import { Loader2, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  moduleId: string
  priceLabel: string
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

export default function BuyModuleButton({ moduleId, priceLabel }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleBuy() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/member/purchase-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Could not start payment'); setLoading(false); return }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        order_id: data.orderId,
        name: 'MATPEAK',
        description: data.moduleTitle,
        theme: { color: '#b3402f' },
        handler: () => {
          // Server-side webhook is the source of truth for the unlock — this
          // just gives immediate feedback and refreshes the page to re-check.
          router.refresh()
        },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleBuy}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#b3402f] hover:bg-[#942f22] disabled:opacity-60 text-[#f0eadc] font-mincho tracking-[3px] text-sm px-6 py-3 rounded-sm transition-colors"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
        BUY · {priceLabel}
      </button>
      {error && <p className="font-mincho text-[#b3402f] text-xs mt-2">{error}</p>}
    </>
  )
}
