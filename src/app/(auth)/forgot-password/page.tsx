'use client'

import { useState } from 'react'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simulate sending — wire to Supabase resetPasswordForEmail when ready
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSent(true)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black tracking-tighter text-[#DC2626]">MATPEAK</a>
          <p className="text-[#888888] text-sm mt-2">Reset your password</p>
        </div>

        <div className="bg-[#111111] border border-white/5 rounded-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={40} className="text-green-400 mx-auto" />
              <h2 className="text-white font-bold text-lg">Check your email</h2>
              <p className="text-[#888888] text-sm">
                We sent a reset link to <strong className="text-white">{email}</strong>. It expires in 1 hour.
              </p>
              <a href="/login" className="block text-[#DC2626] text-sm font-medium hover:underline mt-4">
                ← Back to login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <a href="/login" className="flex items-center justify-center gap-1.5 text-[#888888] hover:text-white text-sm transition-colors">
                <ArrowLeft size={14} /> Back to login
              </a>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
