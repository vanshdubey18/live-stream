'use client'

import { useState } from 'react'
import { X, Loader2, Ticket, CreditCard } from 'lucide-react'

interface Props {
  gym: any
  onClose: () => void
  onJoined: () => void
}

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN')}`
}

export default function JoinModal({ gym, onClose, onJoined }: Props) {
  const [coupon, setCoupon] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'join' | 'success'>('join')

  const price = gym.monthly_price_paise ?? 99900

  async function handleJoin() {
    setError('')

    if (!coupon.trim()) {
      setError('A coupon code is required to join during beta. Get one from our team.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/join-gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId: gym.id,
          couponCode: coupon.trim().toUpperCase(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setStep('success')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">

        {step === 'success' ? (
          <div className="p-8 text-center space-y-6">
            <div>
              <p className="font-inter text-xs text-[#00D4AA] tracking-[3px] uppercase mb-4">● ACTIVE MEMBER</p>
              <h2 className="font-bebas text-4xl text-white">YOU&apos;RE IN</h2>
              <p className="font-inter text-sm text-[#999999] mt-3">
                You&apos;ve joined <span className="text-white">{gym.name}</span>. Start watching classes now.
              </p>
            </div>
            <button
              onClick={onJoined}
              className="w-full bg-white text-black font-bebas tracking-[3px] py-3.5 rounded-sm hover:bg-[#E5E5E5] transition-colors text-sm"
            >
              GO TO DASHBOARD
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#333333]">
              <div>
                <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-1">Membership</p>
                <h2 className="font-bebas text-2xl text-white">JOIN {gym.name.toUpperCase()}</h2>
              </div>
              <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Price display */}
              <div className="bg-[#0D0D0D] border border-[#333333] rounded-sm p-6 flex items-baseline justify-between">
                <div>
                  <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase mb-1">Monthly fee</p>
                  <p className="font-inter text-xs text-[#999999]">Full access to all live classes &amp; replays</p>
                </div>
                <div className="text-right shrink-0 ml-6">
                  <span className="font-bebas text-5xl text-white">{formatPrice(price)}</span>
                  <span className="font-inter text-sm text-[#555555]">/mo</span>
                </div>
              </div>

              {/* Coupon code */}
              <div>
                <label className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase block mb-2">
                  <Ticket size={10} className="inline mr-1.5" />Coupon Code
                </label>
                <input
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Enter your coupon code"
                  className="w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#444444] font-inter text-sm focus:outline-none focus:border-[#555555] transition-colors uppercase"
                />
              </div>

              {/* Payment notice */}
              <div className="flex items-center gap-3 bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3">
                <CreditCard size={14} className="text-[#555555] shrink-0" />
                <p className="font-inter text-[#555555] text-xs">
                  Online payments coming soon. Use a coupon code to join during beta.
                </p>
              </div>

              {error && (
                <p className="font-inter text-sm text-[#FF3B3B] bg-[#FF3B3B]/5 border border-[#FF3B3B]/20 rounded-sm px-4 py-3">
                  {error}
                </p>
              )}

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-white text-black font-bebas tracking-[3px] py-3.5 rounded-sm hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> JOINING…</>
                  : 'JOIN WITH COUPON'}
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  )
}
