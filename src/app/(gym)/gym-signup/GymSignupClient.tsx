'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, Loader2, Building2, User, Dumbbell, MapPin, CheckCircle } from 'lucide-react'

const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

const DISCIPLINE_COLORS: Record<string, string> = {
  BJJ: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  Boxing: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  Wrestling: 'border-green-500/40 bg-green-500/10 text-green-400',
  MMA: 'border-[#DC2626]/40 bg-[#DC2626]/10 text-[#DC2626]',
  Kickboxing: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  Judo: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
  Sambo: 'border-teal-500/40 bg-teal-500/10 text-teal-400',
}

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
      const payload: any = { gymName, city, location, description, disciplines }
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <a href="/" className="text-3xl font-black tracking-tighter text-[#DC2626] mb-10">MATPEAK</a>

      <div className="w-full max-w-lg">
        {/* Step indicator */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-0 mb-10">
            {steps.filter(s => !isLoggedIn || s.n !== 1).map((s, idx, arr) => (
              <div key={s.n} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all
                  ${step === s.n
                    ? 'bg-[#DC2626]/15 border border-[#DC2626]/30 text-[#DC2626]'
                    : step > s.n
                    ? 'text-green-400'
                    : 'text-[#444]'}`}>
                  {step > s.n
                    ? <Check size={13} />
                    : <s.icon size={13} />}
                  {s.label}
                </div>
                {idx < arr.length - 1 && (
                  <ChevronRight size={14} className="text-[#333] mx-1" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1: Account ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="bg-[#111111] border border-white/5 rounded-2xl p-8 space-y-5">
            <div>
              <h1 className="text-white text-2xl font-black">Create your account</h1>
              <p className="text-[#888888] text-sm mt-1">Already have an account? <a href="/login" className="text-[#DC2626] hover:underline">Log in</a></p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-1.5">Full Name</label>
                <input
                  required
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-1.5">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourgym.com"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-1.5">Password</label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-1.5">Confirm</label>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-[#DC2626] text-sm bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-xl px-4 py-3">{error}</p>}

            <button type="submit"
              className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              Continue <ChevronRight size={16} />
            </button>
          </form>
        )}

        {/* ── Step 2: Gym Details ── */}
        {step === 2 && (
          <form onSubmit={handleStep2} className="bg-[#111111] border border-white/5 rounded-2xl p-8 space-y-6">
            <div>
              <h1 className="text-white text-2xl font-black">Tell us about your gym</h1>
              <p className="text-[#888888] text-sm mt-1">This will be reviewed by our team before going live.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-1.5">Gym Name</label>
                <input
                  required
                  value={gymName}
                  onChange={e => setGymName(e.target.value)}
                  placeholder="Xtreme MMA Mumbai"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-1.5">
                    <MapPin size={11} className="inline mr-1" />City
                  </label>
                  <input
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-1.5">Area / Locality</label>
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Andheri West"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Tell members what makes your gym special..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#444] text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-[#888888] text-xs font-semibold uppercase tracking-wider block mb-2.5">
                  <Dumbbell size={11} className="inline mr-1" />Disciplines Offered
                </label>
                <div className="flex flex-wrap gap-2">
                  {DISCIPLINES.map(d => {
                    const active = disciplines.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                          ${active
                            ? DISCIPLINE_COLORS[d] ?? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/10 text-[#555] hover:border-white/20 hover:text-[#888888]'}`}>
                        {active && <Check size={10} className="inline mr-1" />}
                        {d}
                      </button>
                    )
                  })}
                </div>
                {disciplines.length > 0 && (
                  <p className="text-[#555] text-xs mt-2">{disciplines.length} selected</p>
                )}
              </div>
            </div>

            {error && <p className="text-[#DC2626] text-sm bg-[#DC2626]/10 border border-[#DC2626]/20 rounded-xl px-4 py-3">{error}</p>}

            <div className="flex gap-3">
              {!isLoggedIn && (
                <button type="button" onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl border border-white/10 text-[#888888] hover:text-white text-sm font-semibold transition-colors">
                  Back
                </button>
              )}
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>Submit Application <ChevronRight size={16} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Success ── */}
        {step === 3 && (
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <div>
              <h1 className="text-white text-2xl font-black">Application submitted!</h1>
              <p className="text-[#888888] text-sm mt-2 max-w-sm mx-auto">
                Our team will review your gym within 24–48 hours. You'll get an email once you're approved.
              </p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-5 text-left space-y-3 text-sm">
              {[
                { n: '1', text: 'Application review by MATPEAK team', done: true },
                { n: '2', text: 'Gym page goes live on platform', done: false },
                { n: '3', text: 'Start streaming classes to members', done: false },
              ].map(item => (
                <div key={item.n} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0
                    ${item.done ? 'bg-green-500/15 text-green-400' : 'bg-white/5 text-[#555]'}`}>
                    {item.done ? <Check size={12} /> : item.n}
                  </div>
                  <span className={item.done ? 'text-white' : 'text-[#555]'}>{item.text}</span>
                </div>
              ))}
            </div>

            <button onClick={() => router.push('/gym-dashboard')}
              className="w-full bg-[#DC2626] hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
              Go to your dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
