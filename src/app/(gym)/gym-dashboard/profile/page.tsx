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
    setTimeout(() => { setLoading(false); setToast('Changes saved ✓') }, 700)
  }

  const inputCls = 'w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#DC2626]/50 transition-colors'
  const labelCls = 'block text-white text-sm font-medium mb-2'

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <GymSidebar active="Gym Profile" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Gym Profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 max-w-2xl space-y-6">

          {/* Logo & Cover */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold">Media</h2>
            {[{ label: 'Logo', sub: 'Square image, min 200×200px' }, { label: 'Cover Photo', sub: 'Landscape, min 1200×400px' }].map(item => (
              <div key={item.label}>
                <p className="text-[#888888] text-xs font-medium mb-2">{item.label}</p>
                <div className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl px-6 py-8 flex flex-col items-center gap-2 cursor-pointer transition-colors">
                  <Upload size={20} className="text-[#555]" />
                  <p className="text-[#888888] text-xs">Click to upload · {item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Basic Info */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold">Basic Info</h2>
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
                <span className="bg-[#0a0a0a] border border-white/10 border-r-0 rounded-l-xl px-3 py-3 text-[#555] text-sm">@</span>
                <input className={`${inputCls} rounded-l-none`} value={form.instagram}
                  onChange={e => set('instagram', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Disciplines */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Disciplines Offered</h2>
            <div className="grid grid-cols-2 gap-3">
              {DISCIPLINES.map(d => {
                const checked = form.disciplines.includes(d)
                return (
                  <label key={d} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all
                    ${checked ? 'border-[#DC2626]/40 bg-[#DC2626]/5' : 'border-white/5 hover:border-white/10'}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleDiscipline(d)} className="hidden" />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                      ${checked ? 'bg-[#DC2626] border-[#DC2626]' : 'border-white/20'}`}>
                      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                    </div>
                    <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-[#888888]'}`}>{d}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#DC2626] hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
          </button>
        </form>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
