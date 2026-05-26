'use client'

import { useState } from 'react'
import { Loader2, Upload } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import Toast from '@/components/gym-dashboard/Toast'

const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling']

export default function GymProfilePage() {
  const [form, setForm] = useState({
    name: 'Xtreme MMA Mumbai',
    description: 'Premier MMA gym in Mumbai offering world-class training in BJJ, Boxing, Muay Thai, and Wrestling.',
    disciplines: ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling'],
    location: 'Andheri West',
    city: 'Mumbai',
    instagram: 'xtremmemamumbai',
    monthlyPrice: '999',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setToast('Changes saved') }, 700)
  }

  const inputCls = 'w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white placeholder-[#555555] text-sm focus:outline-none focus:border-white transition-colors'
  const labelCls = 'font-inter text-[11px] text-[#999999] tracking-[4px] uppercase block mb-1.5'

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Gym Profile" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] px-6 h-16 flex items-center mt-14 lg:mt-0">
          <h1 className="font-bebas text-2xl text-white tracking-[1px]">GYM PROFILE</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 max-w-2xl space-y-6">

          {/* Logo & Cover */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 space-y-4">
            <h2 className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Media</h2>
            {[{ label: 'Logo', sub: 'Square image, min 200×200px' }, { label: 'Cover Photo', sub: 'Landscape, min 1200×400px' }].map(item => (
              <div key={item.label}>
                <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-2">{item.label}</p>
                <div className="border border-dashed border-[#333333] hover:border-[#555555] rounded-sm px-6 py-8 flex flex-col items-center gap-2 cursor-pointer transition-colors bg-[#0D0D0D]">
                  <Upload size={20} className="text-[#555555]" />
                  <p className="font-inter text-[#555555] text-xs">Click to upload · {item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Basic Info */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 space-y-4">
            <h2 className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Basic Info</h2>
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
                <span className="bg-[#0D0D0D] border border-[#333333] border-r-0 rounded-l-sm px-3 py-3 text-[#555555] font-inter text-sm">@</span>
                <input className={`${inputCls} rounded-l-none`} value={form.instagram}
                  onChange={e => set('instagram', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 space-y-4">
            <h2 className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Pricing</h2>
            <div>
              <label className={labelCls}>Monthly Membership Price (₹)</label>
              <div className="flex items-center">
                <span className="bg-[#0D0D0D] border border-[#333333] border-r-0 rounded-l-sm px-3 py-3 text-[#555555] font-inter text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  className={`${inputCls} rounded-l-none`}
                  value={form.monthlyPrice}
                  onChange={e => set('monthlyPrice', e.target.value)}
                />
              </div>
              <p className="font-inter text-[#555555] text-xs mt-1.5">
                Members pay this each month. Platform takes 30% — you keep{' '}
                <span className="text-[#00D4AA]">
                  ₹{Math.round(parseFloat(form.monthlyPrice || '0') * 0.7).toLocaleString('en-IN')}/mo
                </span>
                {' '}per member.
              </p>
            </div>
          </div>

          {/* Disciplines */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6">
            <h2 className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase mb-4">Disciplines Offered</h2>
            <div className="grid grid-cols-2 gap-3">
              {DISCIPLINES.map(d => {
                const checked = form.disciplines.includes(d)
                return (
                  <label key={d} className={`flex items-center gap-3 px-4 py-3 rounded-sm border cursor-pointer transition-all
                    ${checked ? 'border-white bg-[#222222]' : 'border-[#333333] hover:border-[#555555]'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleDiscipline(d)} className="hidden" />
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-all
                      ${checked ? 'bg-white border-white' : 'border-[#333333]'}`}>
                      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                    </div>
                    <span className={`font-inter text-sm ${checked ? 'text-white' : 'text-[#999999]'}`}>{d}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-white text-black font-bebas tracking-[3px] hover:bg-[#E5E5E5] disabled:opacity-50 py-3.5 rounded-sm text-sm transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin text-black" /> : 'SAVE CHANGES'}
          </button>
        </form>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
