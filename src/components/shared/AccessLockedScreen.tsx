'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'

interface AccessLockedScreenProps {
  gymId: string
  expiryDate: string
}

export default function AccessLockedScreen({ gymId, expiryDate }: AccessLockedScreenProps) {
  const router = useRouter()
  const [showCoupon, setShowCoupon] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleRenew(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/renew-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymId, couponCode: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to apply code')
      setSuccess(`Access extended by ${data.days} days. Unlocking…`)
      setTimeout(() => router.refresh(), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm p-10 max-w-md w-full text-center overflow-hidden space-y-5">
        {/* Ghost watermark */}
        <span className="absolute inset-0 flex items-center justify-center font-bebas text-[120px] text-white/[0.03] leading-none select-none pointer-events-none">
          LOCKED
        </span>

        <div className="relative space-y-5">
          <div>
            <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase mb-3">Access Expired</p>
            <h1 className="font-bebas text-4xl text-white tracking-[1px]">ACCESS LOCKED</h1>
          </div>

          <p className="font-inter text-[#999999] text-sm leading-relaxed">
            Your access period ended on{' '}
            <span className="text-white">
              {new Date(expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            . You&apos;re still a member — apply a new coupon code to continue watching.
          </p>

          {!showCoupon && !success && (
            <button
              onClick={() => setShowCoupon(true)}
              className="font-bebas tracking-[3px] w-full bg-white hover:bg-[#E5E5E5] text-black py-4 rounded-sm text-sm transition-colors duration-150"
            >
              APPLY COUPON CODE
            </button>
          )}

          {showCoupon && !success && (
            <form onSubmit={handleRenew} className="space-y-3 text-left">
              <label className="block font-bebas tracking-[2px] text-white text-sm">
                COUPON CODE
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
                placeholder="ENTER CODE"
                autoFocus
                className="font-inter w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors duration-150 tracking-[2px]"
              />
              {error && <p className="font-inter text-[#FF3B3B] text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="font-bebas tracking-[3px] w-full bg-white hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed text-black py-4 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'UNLOCK ACCESS'}
              </button>
            </form>
          )}

          {success && (
            <p className="font-inter text-[#00D4AA] text-sm">{success}</p>
          )}

          <a
            href="/dashboard"
            className="block font-inter text-[#555555] hover:text-white text-xs transition-colors duration-150"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
