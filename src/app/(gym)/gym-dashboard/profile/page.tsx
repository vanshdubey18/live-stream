'use client'

import { useState, useEffect } from 'react'
import { Loader2, Upload } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import Toast from '@/components/gym-dashboard/Toast'

const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']

export default function GymProfilePage() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    disciplines: [] as string[],
    location: '',
    city: '',
    instagram: '',
    monthlyPrice: '',
    razorpayLink: '',
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState('')


  useEffect(() => {
    fetch('/api/gym/profile')
      .then(r => r.json())
      .then(d => {
        if (d.gym) {
          setForm({
            name: d.gym.name ?? '',
            description: d.gym.description ?? '',
            disciplines: d.gym.disciplines ?? [],
            location: d.gym.location ?? '',
            city: d.gym.city ?? '',
            instagram: d.gym.instagram ?? '',
            monthlyPrice: d.gym.monthly_price_paise ? String(d.gym.monthly_price_paise / 100) : '',
            razorpayLink: d.gym.razorpay_link ?? '',
          })
          if (d.gym.logo_url) setLogoUrl(d.gym.logo_url)
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [])

  function set(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }))
  }

  function toggleDiscipline(d: string) {
    setForm(p => ({
      ...p,
      disciplines: p.disciplines.includes(d)
        ? p.disciplines.filter(x => x !== d)
        : [...p.disciplines, d],
    }))
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoError('')
    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/gym/logo', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setLogoError(data.error ?? 'Upload failed'); return }
      setLogoUrl(data.url)
      setToast('Logo updated ✓')
    } catch {
      setLogoError('Upload failed. Please try again.')
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const priceNum = parseFloat(form.monthlyPrice)
      const res = await fetch('/api/gym/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          city: form.city,
          location: form.location,
          disciplines: form.disciplines,
          monthlyPricePaise: form.monthlyPrice ? Math.round(priceNum * 100) : undefined,
          instagram: form.instagram,
          razorpayLink: form.razorpayLink || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setToast('Changes saved ✓')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#141410] border border-[#322f26] rounded-sm px-4 py-3 text-[#f0eadc] placeholder-[#7a7568] text-sm focus:outline-none focus:border-[#f0eadc] transition-colors'
  const labelCls = 'font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase block mb-1.5'

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#141410] flex">
        <GymSidebar active="Gym Profile" />
        <main className="flex-1 lg:ml-64 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-[#7a7568]" />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <GymSidebar active="Gym Profile" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#322f26] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <div>
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Gym</p>
            <h1 className="font-mincho text-2xl text-[#f0eadc] tracking-[1px] leading-tight">GYM PROFILE</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 max-w-2xl space-y-6">

          {/* Logo */}
          <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-4">
            <h2 className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Logo</h2>
            <div className="flex items-center gap-5">
              {logoUrl ? (
                <img src={logoUrl} alt="Gym logo" className="w-16 h-16 rounded-sm object-cover border border-[#322f26] shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-sm bg-[#141410] border border-[#322f26] flex items-center justify-center shrink-0">
                  <Upload size={18} className="text-[#7a7568]" />
                </div>
              )}
              <div className="flex-1">
                <label className={`inline-flex items-center gap-2 px-4 py-2 border border-[#322f26] rounded-sm font-mincho text-sm text-[#f0eadc] hover:border-[#7a7568] transition-colors cursor-pointer ${logoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {logoUploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : logoUrl ? 'Change Logo' : 'Upload Logo'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                </label>
                <p className="font-mincho text-[#7a7568] text-xs mt-1.5">Square image · JPG, PNG or WebP</p>
                {logoError && <p className="font-mincho text-[#b3402f] text-xs mt-1.5">{logoError}</p>}
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-4">
            <h2 className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Basic Info</h2>
            <div>
              <label className={labelCls}>Gym Name</label>
              <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={`${inputCls} resize-none h-28`} value={form.description}
                onChange={e => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Location / Area</label>
                <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Instagram Handle</label>
              <div className="flex items-center">
                <span className="bg-[#141410] border border-[#322f26] border-r-0 rounded-l-sm px-3 py-3 text-[#7a7568] font-mincho text-sm">@</span>
                <input className={`${inputCls} rounded-l-none`} value={form.instagram}
                  onChange={e => set('instagram', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-4">
            <h2 className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Pricing</h2>
            <div>
              <label className={labelCls}>Monthly Membership Price (₹)</label>
              <div className="flex items-center">
                <span className="bg-[#141410] border border-[#322f26] border-r-0 rounded-l-sm px-3 py-3 text-[#7a7568] font-mincho text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  className={`${inputCls} rounded-l-none`}
                  value={form.monthlyPrice}
                  onChange={e => set('monthlyPrice', e.target.value)}
                />
              </div>
              <p className="font-mincho text-[#7a7568] text-xs mt-1.5">
                Members pay this each month. Platform takes 30% — you keep{' '}
                <span className="text-[#00D4AA]">
                  ₹{Math.round(parseFloat(form.monthlyPrice || '0') * 0.7).toLocaleString('en-IN')}/mo
                </span>
                {' '}per member.
              </p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-5 h-px bg-[#b3402f]" />
              <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase">Payment</p>
            </div>
            <div>
              <label className={labelCls}>Razorpay Payment Link</label>
              <input
                className={inputCls}
                type="url"
                placeholder="https://rzp.io/l/your-link"
                value={form.razorpayLink}
                onChange={e => set('razorpayLink', e.target.value)}
              />
              <p className="font-mincho text-[#7a7568] text-xs mt-1.5">
                Members will be directed here to pay. Paste your Razorpay payment link from your Razorpay dashboard.
              </p>
            </div>
          </div>

          {/* Disciplines */}
          <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6">
            <h2 className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase mb-4">Disciplines Offered</h2>
            <div className="grid grid-cols-2 gap-3">
              {DISCIPLINES.map(d => {
                const checked = form.disciplines.includes(d)
                return (
                  <label key={d} className={`flex items-center gap-3 px-4 py-3 rounded-sm border cursor-pointer transition-all
                    ${checked ? 'border-[#f0eadc] bg-[#242420]' : 'border-[#322f26] hover:border-[#7a7568]'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleDiscipline(d)} className="hidden" />
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-all
                      ${checked ? 'bg-[#f0eadc] border-[#f0eadc]' : 'border-[#322f26]'}`}>
                      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                    </div>
                    <span className={`font-mincho text-sm ${checked ? 'text-[#f0eadc]' : 'text-[#a29c8c]'}`}>{d}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {error && (
            <p className="font-mincho text-[#b3402f] text-sm bg-[#b3402f]/5 border border-[#b3402f]/20 rounded-sm px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#f0eadc] text-[#141410] font-mincho tracking-[3px] hover:bg-[#e4dcc8] disabled:opacity-50 py-3.5 rounded-sm text-sm transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin text-[#141410]" /> : 'SAVE CHANGES'}
          </button>
        </form>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
