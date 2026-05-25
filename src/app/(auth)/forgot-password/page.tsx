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
    <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="text-2xl font-black tracking-tighter text-[#FF3B3B]">MATPEAK</a>
          <p className="text-[#999999] text-sm mt-2">Reset your password</p>
        </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-sm p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={40} className="text-green-400 mx-auto" />
              <h2 className="text-white font-bold text-lg">Check your email</h2>
              <p className="text-[#999999] text-sm">
                We sent a reset link to <strong className="text-white">{email}</strong>. It expires in 1 hour.
              </p>
              <a href="/login" className="block text-[#FF3B3B] text-sm font-medium hover:underline mt-4">
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
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-sm px-4 py-3 text-white placeholder-[#555] text-sm focus:outline-none focus:border-[#FF3B3B]/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF3B3B] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-sm text-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
              <a href="/login" className="flex items-center justify-center gap-1.5 text-[#999999] hover:text-white text-sm transition-colors">
                <ArrowLeft size={14} /> Back to login
              </a>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
