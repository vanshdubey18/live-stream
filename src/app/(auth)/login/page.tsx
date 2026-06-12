'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('error') === 'auth_failed') {
      setError('Your sign-in link expired or is invalid — please try again.')
    }
  }, [searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) throw signInError

      const role = data.user?.user_metadata?.role ?? 'member'

      if (role === 'admin') router.push('/admin')
      else if (role === 'gym_owner') router.push('/gym-dashboard')
      else router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.')
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
            WELCOME BACK
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block font-bebas tracking-[2px] text-white text-sm mb-2">
                EMAIL
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="font-inter w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors duration-150"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-bebas tracking-[2px] text-white text-sm">
                  PASSWORD
                </label>
                <a
                  href="/forgot-password"
                  className="font-inter text-[#555555] hover:text-white text-xs transition-colors duration-150"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  required
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

            {/* Error */}
            {error && (
              <p className="font-inter text-[#FF3B3B] text-sm mt-2">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="font-bebas tracking-[3px] w-full bg-white hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed text-black py-4 rounded-sm text-sm transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'LOG IN'
              )}
            </button>
          </form>

          {/* Bottom link */}
          <p className="font-inter text-center text-[#555555] text-sm mt-6">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-white hover:text-[#E5E5E5] transition-colors duration-150">
              Sign up
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}
