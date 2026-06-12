'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  // The recovery link lands here with a ?code= param — exchange it for a session
  useEffect(() => {
    async function establishSession() {
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setError('This reset link is invalid or has expired. Please request a new one.')
          return
        }
      }
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setSessionReady(true)
      else setError('This reset link is invalid or has expired. Please request a new one.')
    }
    establishSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
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
            NEW PASSWORD
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-8">
          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={40} className="text-[#00D4AA] mx-auto" />
              <h2 className="font-bebas tracking-[3px] text-white text-2xl">
                PASSWORD UPDATED
              </h2>
              <p className="font-inter text-[#999999] text-sm leading-relaxed">
                Taking you back to login…
              </p>
            </div>
          ) : !sessionReady && error ? (
            <div className="text-center space-y-4">
              <p className="font-inter text-[#FF3B3B] text-sm">{error}</p>
              <a
                href="/forgot-password"
                className="font-bebas tracking-[3px] inline-block w-full bg-white hover:bg-[#E5E5E5] text-black py-4 rounded-sm text-sm transition-colors duration-150"
              >
                REQUEST NEW LINK
              </a>
            </div>
          ) : !sessionReady ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-[#555555]" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="font-inter text-[#999999] text-sm leading-relaxed">
                Choose a new password for your account.
              </p>

              <div>
                <label className="block font-bebas tracking-[2px] text-white text-sm mb-2">
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="font-inter w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 pr-11 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-white transition-colors duration-150"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bebas tracking-[2px] text-white text-sm mb-2">
                  CONFIRM PASSWORD
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError('') }}
                  placeholder="Repeat new password"
                  required
                  minLength={8}
                  className="font-inter w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors duration-150"
                />
              </div>

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
                  'UPDATE PASSWORD'
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  )
}
