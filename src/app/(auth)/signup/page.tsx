'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
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
    if (form.password !== form.confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.name,
            phone: form.phone || null,
            role: 'member',
          },
        },
      })

      if (signUpError) throw signUpError

      if (data.user) {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black tracking-tighter text-[#DC2626]">
            MATPEAK
          </a>
          <p className="text-[#888888] text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="John Silva"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
              />
            </div>

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
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Phone{' '}
                <span className="text-[#555] font-normal">(optional)</span>
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                name="confirm"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={handleChange}
                required
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-[#888888] text-sm mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-white hover:text-[#DC2626] font-medium transition-colors">
              Log in
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}
