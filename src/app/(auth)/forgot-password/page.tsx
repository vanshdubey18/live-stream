'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) throw resetError
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="text-center mb-8">
          <a href="/" className="font-bebas text-3xl tracking-[3px] text-[#FF3B3B]">
            MATPEAK
          </a>
          <p className="font-inter text-xs text-[#999999] tracking-[4px] uppercase mt-2">
            RESET PASSWORD
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-8">
          {sent ? (
            /* Success state */
            <div className="text-center space-y-4">
              <CheckCircle2 size={40} className="text-green-500 mx-auto" />
              <h2 className="font-bebas tracking-[3px] text-white text-2xl">
                CHECK YOUR EMAIL
              </h2>
              <p className="font-inter text-[#999999] text-sm leading-relaxed">
                We sent a reset link to{' '}
                <span className="text-white">{email}</span>. It expires in 1 hour.
              </p>
              <a
                href="/login"
                className="font-inter inline-flex items-center gap-1.5 text-[#555555] hover:text-white text-sm transition-colors duration-150 mt-2"
              >
                <ArrowLeft size={14} /> Back to login
              </a>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="font-inter text-[#999999] text-sm leading-relaxed">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              <div>
                <label className="block font-bebas tracking-[2px] text-white text-sm mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="you@example.com"
                  required
                  className="font-inter w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors duration-150"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="font-inter text-[#FF3B3B] text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="font-bebas tracking-[3px] w-full bg-white hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed text-black py-4 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  'SEND RESET LINK'
                )}
              </button>

              <a
                href="/login"
                className="font-inter flex items-center justify-center gap-1.5 text-[#555555] hover:text-white text-sm transition-colors duration-150"
              >
                <ArrowLeft size={14} /> Back to login
              </a>
            </form>
          )}
        </div>

      </div>
    </main>
  )
}
