'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black tracking-tighter text-[#FF3B3B]">
            MATPEAK
          </a>
          <p className="text-[#999999] text-sm mt-2">Welcome back</p>
        </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-sm px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#FF3B3B]/50 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm font-medium">Password</label>
                <a
                  href="/forgot-password"
                  className="text-[#999999] hover:text-white text-xs transition-colors"
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
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-sm px-4 py-3 pr-11 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#FF3B3B]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-sm px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bebas tracking-[3px] py-3.5 rounded-sm text-sm transition-all duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Log In <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[#999999] text-sm mt-6">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-white hover:text-[#FF3B3B] font-medium transition-colors">
              Sign up free
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
