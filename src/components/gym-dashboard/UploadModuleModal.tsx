'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Loader2, Film } from 'lucide-react'

interface Props {
  onClose: () => void
  onUploaded: () => void
}

const DISCIPLINES = ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling', 'MMA', 'Kickboxing', 'Judo', 'Sambo']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

interface Coach { id: string; name: string }

export default function UploadModuleModal({ onClose, onUploaded }: Props) {
  const [form, setForm] = useState({
    title: '', description: '', discipline: 'BJJ', level: 'Intermediate', priceRupees: '', coachId: '',
  })
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/gym/coaches').then(r => r.json()).then(d => { if (d.coaches) setCoaches(d.coaches) }).catch(() => {})
  }, [])

  function set(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!file) { setError('Choose a video file first'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/gym/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); setLoading(false); return }

      // Upload straight to Cloudflare from the browser — never through our server.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', data.uploadUrl)
        xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100)) }
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error('Upload failed'))
        xhr.onerror = () => reject(new Error('Upload failed'))
        const fd = new FormData()
        fd.append('file', file)
        xhr.send(fd)
      })

      onUploaded()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-[#141410] border border-[#322f26] rounded-sm px-4 py-2.5 text-[#f0eadc] text-sm focus:outline-none focus:border-[#b3402f]/50 transition-colors'
  const labelCls = 'block text-[#a29c8c] text-xs font-medium mb-1.5'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={loading ? undefined : onClose} />
      <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a20]">
          <h2 className="font-mincho text-xl text-[#f0eadc] tracking-[1px]">UPLOAD INSTRUCTIONAL</h2>
          {!loading && <button onClick={onClose} className="text-[#a29c8c] hover:text-[#f0eadc] transition-colors"><X size={20} /></button>}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Video file</label>
            <div
              className="flex items-center gap-3 border border-[#322f26] hover:border-[#7a7568] rounded-sm px-4 py-3 cursor-pointer transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Film size={16} className="text-[#635f54] shrink-0" />
              <span className="font-mincho text-sm text-[#a29c8c] truncate">{file ? file.name : 'Choose a video…'}</span>
            </div>
            <input ref={fileRef} type="file" accept="video/*" className="hidden"
              onChange={e => setFile(e.target.files?.[0] ?? null)} />
          </div>

          <div>
            <label className={labelCls}>Title</label>
            <input className={inputCls} placeholder="e.g. The Berimbolo, Start to Finish" value={form.title}
              onChange={e => set('title', e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className={labelCls}>Description <span className="text-[#555]">(optional)</span></label>
            <textarea className={`${inputCls} resize-none h-20`} value={form.description}
              onChange={e => set('description', e.target.value)} disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Discipline</label>
              <select className={inputCls} value={form.discipline} onChange={e => set('discipline', e.target.value)} disabled={loading}>
                {DISCIPLINES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Level</label>
              <select className={inputCls} value={form.level} onChange={e => set('level', e.target.value)} disabled={loading}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (₹)</label>
              <input className={inputCls} type="number" min="1" placeholder="499" value={form.priceRupees}
                onChange={e => set('priceRupees', e.target.value)} required disabled={loading} />
            </div>
            <div>
              <label className={labelCls}>Coach <span className="text-[#555]">(optional)</span></label>
              <select className={inputCls} value={form.coachId} onChange={e => set('coachId', e.target.value)} disabled={loading}>
                <option value="">—</option>
                {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {loading && (
            <div>
              <div className="h-1.5 bg-[#141410] rounded-sm overflow-hidden">
                <div className="h-full bg-[#b3402f] transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <p className="font-mincho text-[11px] text-[#7a7568] mt-1.5">Uploading… {progress}%</p>
            </div>
          )}

          {error && (
            <p className="font-mincho text-[#b3402f] text-sm bg-[#b3402f]/5 border border-[#b3402f]/20 rounded-sm px-4 py-3">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3 border border-[#322f26] text-[#f0eadc] text-sm font-semibold rounded-sm transition-all hover:bg-[#242420] disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-[#f0eadc] hover:bg-[#e4dcc8] disabled:opacity-50 text-[#141410] font-mincho tracking-[2px] text-sm rounded-sm transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={15} className="animate-spin text-[#141410]" /> : 'UPLOAD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
