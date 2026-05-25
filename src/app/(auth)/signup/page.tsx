'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [role, setRole] = useState<'member' | 'gym_owner'>('member')
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

    if (!form.name.trim()) return setError('Full name is required.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            role,
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        router.push('/onboarding')
      }
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
            JOIN MATPEAK
          </a>
          <p className="font-inter text-xs text-[#999999] tracking-[4px] uppercase mt-2">
            START YOUR TRAINING
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block font-bebas tracking-[2px] text-white text-sm mb-2">
                FULL NAME
              </label>
              <input
                name="name"
                type="text"
                placeholder="John Silva"
                value={form.name}
                onChange={handleChange}
                required
                className="font-inter w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors duration-150"
              />
            </div>

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
              <label className="block font-bebas tracking-[2px] text-white text-sm mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
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

            {/* Role selector */}
            <div>
              <label className="block font-bebas tracking-[2px] text-white text-sm mb-2">
                I AM A
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`font-bebas tracking-[2px] text-sm py-3 rounded-sm border transition-colors duration-150 ${
                    role === 'member'
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent border-[#333333] text-[#999999] hover:border-white hover:text-white'
                  }`}
                >
                  MEMBER
                </button>
                <button
                  type="button"
                  onClick={() => setRole('gym_owner')}
                  className={`font-bebas tracking-[2px] text-sm py-3 rounded-sm border transition-colors duration-150 ${
                    role === 'gym_owner'
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent border-[#333333] text-[#999999] hover:border-white hover:text-white'
                  }`}
                >
                  GYM OWNER
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
                'CREATE ACCOUNT'
              )}
            </button>
          </form>

          {/* Bottom link */}
          <p className="font-inter text-center text-[#555555] text-sm mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-white hover:text-[#E5E5E5] transition-colors duration-150">
              Log in
            </a>
          </p>
        </div>

      </div>
    </main>
  )
}
