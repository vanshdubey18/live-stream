'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Building2, User, CheckCircle } from 'lucide-react'

const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

interface Props {
  isLoggedIn: boolean
  prefillName?: string
  prefillEmail?: string
}

export default function GymSignupClient({ isLoggedIn, prefillName, prefillEmail }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(isLoggedIn ? 2 : 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 fields
  const [ownerName, setOwnerName] = useState(prefillName ?? '')
  const [email, setEmail] = useState(prefillEmail ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Step 2 fields
  const [gymName, setGymName] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [disciplines, setDisciplines] = useState<string[]>([])
  const [monthlyPrice, setMonthlyPrice] = useState('999')

  function toggleDiscipline(d: string) {
    setDisciplines(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])
  }

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setStep(2)
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (disciplines.length === 0) { setError('Select at least one discipline'); return }
    setLoading(true)

    try {
      const priceNum = parseFloat(monthlyPrice)
      if (isNaN(priceNum) || priceNum < 1) { setError('Enter a valid monthly price'); setLoading(false); return }
      const payload: any = { gymName, city, location, description, disciplines, monthlyPricePaise: Math.round(priceNum * 100) }
      if (!isLoggedIn) {
        payload.email = email
        payload.password = password
        payload.ownerName = ownerName
      }

      const res = await fetch('/api/gym-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setStep(3)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { n: 1, label: 'Your Account', icon: User },
    { n: 2, label: 'Gym Details', icon: Building2 },
    { n: 3, label: 'Submitted', icon: CheckCircle },
  ]

  const inputCls = 'w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors'
  const labelCls = 'font-inter text-[11px] text-[#999999] tracking-[4px] uppercase block mb-1.5'

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-4 py-16">
      {/* Wordmark */}
      <a href="/" className="font-bebas text-2xl tracking-[1px] text-[#FF3B3B] mb-10">MATPEAK</a>

      <div className="w-full max-w-lg">
        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-6 mb-10">
            {steps.filter(s => !isLoggedIn || s.n !== 1).map((s, idx, arr) => (
              <div key={s.n} className="flex items-center gap-2">
                <span className={`font-inter text-sm transition-colors ${step === s.n ? 'text-white' : step > s.n ? 'text-[#555555]' : 'text-[#555555]'}`}>
                  {step > s.n ? <Check size={14} className="inline" /> : s.n}
                </span>
                <span className={`font-inter text-sm transition-colors ${step === s.n ? 'text-white' : 'text-[#555555]'}`}>{s.label}</span>
                {idx < arr.length - 1 && <span className="text-[#333333] ml-6">/</span>}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Account ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-8 space-y-5">
            <div>
              <h1 className="font-bebas text-2xl text-white tracking-[1px]">CREATE YOUR ACCOUNT</h1>
              <p className="font-inter text-sm text-[#999999] mt-1">Already have an account? <a href="/login" className="text-white hover:text-[#999999] underline transition-colors">Log in</a></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  required
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourgym.com"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Password</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Confirm</label>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {error && <p className="font-inter text-sm text-[#FF3B3B] border border-[#FF3B3B]/20 rounded-sm px-4 py-3">{error}</p>}

            <button type="submit"
              className="w-full bg-white text-black font-bebas tracking-[3px] hover:bg-[#E5E5E5] py-3.5 rounded-sm text-sm transition-colors">
              CONTINUE
            </button>
          </form>
        )}

        {/* ── Step 2: Gym Details ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-8 space-y-6">
            <div>
              <h1 className="font-bebas text-2xl text-white tracking-[1px]">TELL US ABOUT YOUR GYM</h1>
              <p className="font-inter text-sm text-[#999999] mt-1">This will be reviewed by our team before going live.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Gym Name</label>
                <input
                  required
                  value={gymName}
                  onChange={e => setGymName(e.target.value)}
                  placeholder="Xtreme MMA Mumbai"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>City</label>
                  <input
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Area / Locality</label>
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Andheri West"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell members what makes your gym special..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className={labelCls}>Monthly Membership Price (₹)</label>
                <div className="flex items-center">
                  <span className="bg-[#0D0D0D] border border-[#333333] border-r-0 rounded-l-sm px-3 py-3 text-[#555555] font-inter text-sm">₹</span>
                  <input
                    required
                    type="number"
                    min="1"
                    value={monthlyPrice}
                    onChange={e => setMonthlyPrice(e.target.value)}
                    placeholder="999"
                    className={`${inputCls} rounded-l-none`}
                  />
                </div>
                <p className="font-inter text-[#555555] text-xs mt-1">Platform takes 30%. You keep 70%.</p>
              </div>

              <div>
                <label className={labelCls}>Disciplines Offered</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DISCIPLINES.map(d => {
                    const active = disciplines.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        className={`px-3.5 py-1.5 rounded-sm text-xs font-inter border transition-all
                          ${active
                            ? 'border-white bg-[#222222] text-white'
                            : 'border-[#333333] bg-[#0D0D0D] text-[#555555] hover:border-[#555555] hover:text-[#999999]'}`}>
                        {active && <Check size={10} className="inline mr-1" />}
                        {d}
                      </button>
                    )
                  })}
                </div>
                {disciplines.length > 0 && (
                  <p className="font-inter text-[#555555] text-xs mt-2">{disciplines.length} selected</p>
                )}
              </div>
            </div>

            {error && <p className="font-inter text-sm text-[#FF3B3B] border border-[#FF3B3B]/20 rounded-sm px-4 py-3">{error}</p>}

            <div className="flex gap-3">
              {!isLoggedIn && (
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-sm border border-[#333333] text-white font-inter text-sm hover:bg-[#222222] transition-colors">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 bg-white text-black font-bebas tracking-[3px] hover:bg-[#E5E5E5] disabled:opacity-50 disabled:cursor-not-allowed py-3.5 rounded-sm text-sm transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> SUBMITTING…</> : 'SUBMIT APPLICATION'}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-10 text-center space-y-5">
            <div className="w-12 h-12 border border-[#00D4AA] flex items-center justify-center mx-auto rounded-sm">
              <CheckCircle size={24} className="text-[#00D4AA]" />
            </div>
            <div>
              <h1 className="font-bebas text-2xl text-white tracking-[1px]">APPLICATION SUBMITTED</h1>
              <p className="font-inter text-[#999999] text-sm mt-2 max-w-sm mx-auto">
                Our team will review your gym within 24–48 hours. You'll get an email once you're approved.
              </p>
            </div>

            <div className="bg-[#0D0D0D] border border-[#333333] rounded-sm p-5 text-left space-y-3">
              {[
                { n: '1', text: 'Application review by MATPEAK team', done: true },
                { n: '2', text: 'Gym page goes live on platform', done: false },
                { n: '3', text: 'Start streaming classes to members', done: false },
              ].map(item => (
                <div key={item.n} className="flex items-center gap-3">
                  <div className={`w-6 h-6 flex items-center justify-center text-xs font-inter shrink-0
                    ${item.done ? 'text-[#00D4AA]' : 'text-[#555555]'}`}>
                    {item.done ? <Check size={12} /> : item.n}
                  </div>
                  <span className={`font-inter text-sm ${item.done ? 'text-white' : 'text-[#555555]'}`}>{item.text}</span>
                </div>
              ))}
            </div>

            <button onClick={() => router.push('/gym-dashboard')}
              className="w-full bg-white text-black font-bebas tracking-[3px] hover:bg-[#E5E5E5] py-3.5 rounded-sm text-sm transition-colors">
              GO TO YOUR DASHBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
