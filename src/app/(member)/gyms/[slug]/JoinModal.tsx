'use client'

import { useState } from 'react'
import { X, Loader2, Ticket, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'

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
  const [showCoupon, setShowCoupon] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'join' | 'success'>('join')

  const price = gym.monthly_price_paise ?? 99900

  async function handleCouponJoin() {
    setError('')
    if (!coupon.trim()) {
      setError('Enter a coupon code.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/join-gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId: gym.id, couponCode: coupon.trim().toUpperCase() }),
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

            <div className="p-6 space-y-4">

              {/* Price display */}
              <div className="bg-[#0D0D0D] border border-[#333333] rounded-sm p-5 flex items-baseline justify-between">
                <div>
                  <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase mb-1">Monthly fee</p>
                  <p className="font-inter text-xs text-[#999999]">Live classes &amp; replays</p>
                </div>
                <div className="text-right shrink-0 ml-6">
                  <span className="font-bebas text-5xl text-white">{formatPrice(price)}</span>
                  <span className="font-inter text-sm text-[#555555]">/mo</span>
                </div>
              </div>

              {/* Pay online — coming soon */}
              <button
                disabled
                className="w-full flex items-center justify-between bg-[#0D0D0D] border border-[#333333] rounded-sm px-5 py-4 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-[#555555]" />
                  <span className="font-inter text-sm text-white">Pay Online</span>
                </div>
                <span className="font-inter text-[10px] text-[#555555] tracking-[3px] uppercase border border-[#333333] px-2 py-1 rounded-sm">
                  Coming Soon
                </span>
              </button>

              {/* Coupon toggle */}
              <div className="border border-[#333333] rounded-sm overflow-hidden">
                <button
                  onClick={() => setShowCoupon(v => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#222222] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Ticket size={16} className="text-[#999999]" />
                    <span className="font-inter text-sm text-white">Have a coupon code?</span>
                  </div>
                  {showCoupon ? <ChevronUp size={16} className="text-[#555555]" /> : <ChevronDown size={16} className="text-[#555555]" />}
                </button>

                {showCoupon && (
                  <div className="px-5 pb-5 pt-1 space-y-3 border-t border-[#2A2A2A]">
                    <input
                      value={coupon}
                      onChange={e => setCoupon(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCouponJoin()}
                      placeholder="Enter coupon code"
                      className="w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#444444] font-inter text-sm focus:outline-none focus:border-[#555555] transition-colors uppercase"
                    />
                    {error && (
                      <p className="font-inter text-sm text-[#FF3B3B]">{error}</p>
                    )}
                    <button
                      onClick={handleCouponJoin}
                      disabled={loading}
                      className="w-full bg-white text-black font-bebas tracking-[3px] py-3 rounded-sm hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      {loading ? <><Loader2 size={15} className="animate-spin" /> APPLYING…</> : 'APPLY &amp; JOIN'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}
