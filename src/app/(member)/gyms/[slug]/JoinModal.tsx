'use client'

import { useState } from 'react'
import { X, Loader2, Ticket, CreditCard } from 'lucide-react'

const PLANS = [
  {
    id: 'single',
    label: 'Single Discipline',
    price: '₹999',
    period: '/mo',
    desc: 'Access to one discipline of your choice',
    disciplines: 1,
  },
  {
    id: 'dual',
    label: 'Dual Discipline',
    price: '₹1,499',
    period: '/mo',
    desc: 'Access to any two disciplines',
    disciplines: 2,
  },
  {
    id: 'full_mma',
    label: 'Full MMA',
    price: '₹1,999',
    period: '/mo',
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
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">

        {step === 'success' ? (
          <div className="p-8 text-center space-y-6">
            <div>
              <p className="font-inter text-xs text-[#00D4AA] tracking-[3px] uppercase mb-4">
                ● ACTIVE MEMBER
              </p>
              <h2 className="font-bebas text-4xl text-white">YOU&apos;RE IN</h2>
              <p className="font-inter text-sm text-[#999999] mt-3">
                You&apos;ve joined <span className="text-white">{gym.name}</span>. Start watching classes now.
              </p>
            </div>
            <button
              onClick={onJoined}
              className="w-full bg-white text-black font-bebas tracking-[3px] py-3.5 rounded-sm hover:bg-[#E5E5E5] transition-colors text-sm"
            >
              GO TO DASHBOARD
            </button>
          </div>
        ) : (
          <>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2A2A2A]">
              <div>
                <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-1">Membership</p>
                <h2 className="font-bebas text-2xl text-white">JOIN {gym.name.toUpperCase()}</h2>
              </div>
              <button
                onClick={onClose}
                className="text-[#555555] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Plan picker */}
              <div>
                <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">Select Plan</p>
                <div className="space-y-2">
                  {PLANS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setPlan(p.id); setSelectedDisciplines([]) }}
                      className={`w-full flex items-center justify-between px-4 py-4 rounded-sm border text-left transition-colors ${
                        plan === p.id
                          ? 'bg-[#222222] border-white'
                          : 'bg-[#0D0D0D] border-[#333333] hover:bg-[#1F1F1F]'
                      }`}
                    >
                      <div>
                        <p className={`font-inter text-sm ${plan === p.id ? 'text-white' : 'text-[#999999]'}`}>
                          {p.label}
                        </p>
                        <p className="font-inter text-xs text-[#555555] mt-0.5">{p.desc}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className={`font-bebas text-2xl ${plan === p.id ? 'text-white' : 'text-[#555555]'}`}>
                          {p.price}
                        </span>
                        <span className={`font-inter text-xs ${plan === p.id ? 'text-[#999999]' : 'text-[#333333]'}`}>
                          {p.period}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discipline picker for single/dual */}
              {selectedPlan.disciplines < 999 && (
                <div>
                  <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-3">
                    Choose {selectedPlan.disciplines === 1 ? '1 Discipline' : 'Up To 2 Disciplines'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {gymDisciplines.map(d => {
                      const active = selectedDisciplines.includes(d)
                      return (
                        <button
                          key={d}
                          onClick={() => toggleDiscipline(d)}
                          className={`px-4 py-1.5 rounded-sm font-inter text-xs uppercase tracking-[2px] border transition-colors ${
                            active
                              ? 'border-white text-white bg-[#222222]'
                              : 'border-[#333333] text-[#555555] hover:border-[#555555] hover:text-[#999999]'
                          }`}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Coupon code */}
              <div>
                <label className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase block mb-2">
                  <Ticket size={10} className="inline mr-1.5" />Coupon Code
                </label>
                <input
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  placeholder="Enter your coupon code"
                  className="w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#444444] font-inter text-sm focus:outline-none focus:border-[#555555] transition-colors uppercase"
                />
              </div>

              {/* Payment notice */}
              <div className="flex items-center gap-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-sm px-4 py-3">
                <CreditCard size={14} className="text-[#555555] shrink-0" />
                <p className="font-inter text-[#555555] text-xs">
                  Online payments coming soon. Use a coupon code to join during beta.
                </p>
              </div>

              {/* Error */}
              {error && (
                <p className="font-inter text-sm text-[#FF3B3B] bg-[#FF3B3B]/5 border border-[#FF3B3B]/20 rounded-sm px-4 py-3">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-white text-black font-bebas tracking-[3px] py-3.5 rounded-sm hover:bg-[#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> JOINING…</>
                  : 'JOIN WITH COUPON'}
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  )
}
