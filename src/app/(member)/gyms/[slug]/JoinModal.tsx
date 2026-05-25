'use client'

import { useState } from 'react'
import { X, Loader2, Ticket, CheckCircle, CreditCard } from 'lucide-react'

const PLANS = [
  {
    id: 'single',
    label: 'Single Discipline',
    price: '₹999/mo',
    desc: 'Access to one discipline of your choice',
    disciplines: 1,
  },
  {
    id: 'dual',
    label: 'Dual Discipline',
    price: '₹1,499/mo',
    desc: 'Access to any two disciplines',
    disciplines: 2,
  },
  {
    id: 'full_mma',
    label: 'Full MMA',
    price: '₹1,999/mo',
    desc: 'Unlimited access to all disciplines',
    disciplines: 999,
  },
]

interface Props {
  gym: any
  onClose: () => void
  onJoined: () => void
}

export default function JoinModal({ gym, onClose, onJoined }: Props) {
  const [plan, setPlan] = useState('full_mma')
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([])
  const [coupon, setCoupon] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'plan' | 'success'>('plan')

  const selectedPlan = PLANS.find(p => p.id === plan)!
  const gymDisciplines: string[] = gym.disciplines ?? []

  function toggleDiscipline(d: string) {
    if (selectedPlan.disciplines === 999) return
    setSelectedDisciplines(prev => {
      if (prev.includes(d)) return prev.filter(x => x !== d)
      if (prev.length >= selectedPlan.disciplines) return [...prev.slice(1), d]
      return [...prev, d]
    })
  }

  async function handleJoin() {
    setError('')

    const disciplines = selectedPlan.disciplines === 999 ? gymDisciplines : selectedDisciplines
    if (selectedPlan.disciplines < 999 && disciplines.length === 0) {
      setError('Please select at least one discipline')
      return
    }

    if (!coupon.trim()) {
      setError('A coupon code is required to join during beta. Get one from our team.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/join-gym', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gymId: gym.id,
          planType: plan,
          disciplines,
          couponCode: coupon.trim().toUpperCase(),
        }),
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">

        {step === 'success' ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-black">You're in!</h2>
              <p className="text-[#999999] text-sm mt-2">You've joined <strong className="text-white">{gym.name}</strong>. Start watching classes now.</p>
            </div>
            <button onClick={onJoined}
              className="w-full bg-[#FF3B3B] hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h2 className="text-white font-bold text-base">Join {gym.name}</h2>
                <p className="text-[#999999] text-xs mt-0.5">Select a plan to get started</p>
              </div>
              <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Plan picker */}
              <div className="space-y-2">
                {PLANS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setPlan(p.id); setSelectedDisciplines([]) }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all
                      ${plan === p.id
                        ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-white'
                        : 'bg-[#0D0D0D] border-white/10 text-[#999999] hover:border-white/20'}`}>
                    <div>
                      <p className={`text-sm font-bold ${plan === p.id ? 'text-white' : ''}`}>{p.label}</p>
                      <p className="text-xs mt-0.5 text-[#555]">{p.desc}</p>
                    </div>
                    <span className={`text-sm font-black shrink-0 ml-4 ${plan === p.id ? 'text-[#FF3B3B]' : 'text-[#555]'}`}>{p.price}</span>
                  </button>
                ))}
              </div>

              {/* Discipline picker for single/dual */}
              {selectedPlan.disciplines < 999 && (
                <div>
                  <p className="text-[#999999] text-xs font-semibold uppercase tracking-wider mb-2">
                    Choose {selectedPlan.disciplines === 1 ? '1 discipline' : 'up to 2 disciplines'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gymDisciplines.map(d => {
                      const active = selectedDisciplines.includes(d)
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDiscipline(d)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                            ${active ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-[#FF3B3B]' : 'border-white/10 text-[#555] hover:border-white/20 hover:text-[#888]'}`}>
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Coupon code */}
              <div>
                <label className="text-[#999999] text-xs font-semibold uppercase tracking-wider block mb-1.5">
                  <Ticket size={11} className="inline mr-1" />Coupon Code
                </label>
                <input
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Enter your coupon code"
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#FF3B3B]/40 transition-colors uppercase"
                />
              </div>

              {/* Razorpay placeholder */}
              <div className="flex items-center gap-3 bg-[#0D0D0D] border border-white/5 rounded-xl px-4 py-3">
                <CreditCard size={16} className="text-[#555] shrink-0" />
                <p className="text-[#555] text-xs">Online payments coming soon. Use a coupon code to join during beta.</p>
              </div>

              {error && <p className="text-[#FF3B3B] text-sm bg-[#FF3B3B]/10 border border-[#FF3B3B]/20 rounded-xl px-4 py-3">{error}</p>}

              <button onClick={handleJoin} disabled={loading}
                className="w-full bg-[#FF3B3B] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Joining…</> : 'Join with Coupon'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
