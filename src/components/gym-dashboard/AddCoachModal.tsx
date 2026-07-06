'use client'

import { useState, useRef } from 'react'
import { X, Loader2, Camera } from 'lucide-react'
import type { Coach } from './CoachCard'

interface Props {
  onClose: () => void
  onSaved: (coach: Coach) => void
  coach?: Coach | null
}

const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing']

export default function AddCoachModal({ onClose, onSaved, coach: editCoach }: Props) {
  const isEdit = !!editCoach

  const [form, setForm] = useState({
    name: editCoach?.name ?? '',
    discipline: editCoach?.discipline ?? 'BJJ',
    beltRank: editCoach?.belt_rank ?? editCoach?.beltRank ?? '',
    bio: editCoach?.bio ?? '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(editCoach?.avatar_url ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function set(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }))
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      if (isEdit) fd.append('id', editCoach.id)
      fd.append('name', form.name)
      fd.append('discipline', form.discipline)
      if (form.beltRank) fd.append('beltRank', form.beltRank)
      if (form.bio) fd.append('bio', form.bio)
      if (photo) fd.append('photo', photo)

      const res = await fetch('/api/gym/coaches', {
        method: isEdit ? 'PATCH' : 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      onSaved(data.coach)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#141410] border border-[#322f26] rounded-sm px-4 py-2.5 text-[#f0eadc] text-sm focus:outline-none focus:border-[#b3402f]/50 transition-colors'
  const labelCls = 'block text-[#a29c8c] text-xs font-medium mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a20]">
          <h2 className="font-mincho text-xl text-[#f0eadc] tracking-[1px]">{isEdit ? 'EDIT COACH' : 'ADD COACH'}</h2>
          <button onClick={onClose} className="text-[#a29c8c] hover:text-[#f0eadc] transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo upload */}
          <div>
            <label className={labelCls}>Photo <span className="text-[#555]">(optional)</span></label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-sm bg-[#141410] border border-[#322f26] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-[#7a7568] transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-[#635f54]" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="font-mincho text-xs text-[#a29c8c] border border-[#322f26] hover:border-[#7a7568] hover:text-[#f0eadc] px-3 py-1.5 rounded-sm transition-all"
                >
                  {preview ? 'Change photo' : 'Upload photo'}
                </button>
                <p className="font-mincho text-[11px] text-[#635f54] mt-1.5">JPG or PNG, max 5MB</p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          <div>
            <label className={labelCls}>Full Name</label>
            <input className={inputCls} placeholder="Coach name" value={form.name}
              onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Discipline</label>
              <select className={inputCls} value={form.discipline} onChange={e => set('discipline', e.target.value)}>
                {DISCIPLINES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Belt / Rank <span className="text-[#555]">(optional)</span></label>
              <input className={inputCls} placeholder="e.g. Black Belt" value={form.beltRank}
                onChange={e => set('beltRank', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Bio <span className="text-[#555]">(optional)</span></label>
            <textarea className={`${inputCls} resize-none h-24`} placeholder="Brief background..."
              value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>

          {error && (
            <p className="font-mincho text-[#b3402f] text-sm bg-[#b3402f]/5 border border-[#b3402f]/20 rounded-sm px-4 py-3">{error}</p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-[#322f26] text-[#f0eadc] text-sm font-semibold rounded-sm transition-all hover:bg-[#242420]">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-[#f0eadc] hover:bg-[#e4dcc8] disabled:opacity-50 text-[#141410] font-mincho tracking-[2px] text-sm rounded-sm transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin text-[#141410]" /> : isEdit ? 'SAVE CHANGES' : 'SAVE COACH'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
