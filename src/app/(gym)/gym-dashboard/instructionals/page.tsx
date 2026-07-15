'use client'

import { useState, useEffect } from 'react'
import { Plus, Video, Clock, TrendingUp } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import UploadModuleModal from '@/components/gym-dashboard/UploadModuleModal'
import Toast from '@/components/gym-dashboard/Toast'
import { cfThumbnailUrl } from '@/lib/cf-thumbnail'

interface Module {
  id: string
  title: string
  description: string | null
  discipline: string
  level: string
  price_paise: number
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  cf_video_uid: string | null
  duration_seconds: number | null
  sales_count: number
  created_at: string
  coaches: { id: string; name: string } | null
}

const STATUS_LABEL: Record<Module['status'], string> = {
  uploading: 'UPLOADING',
  processing: 'PROCESSING',
  ready: 'READY',
  failed: 'FAILED',
}
const STATUS_COLOR: Record<Module['status'], string> = {
  uploading: 'text-[#FFD60A] border-[#FFD60A]/30 bg-[#FFD60A]/5',
  processing: 'text-[#FFD60A] border-[#FFD60A]/30 bg-[#FFD60A]/5',
  ready: 'text-[#00D4AA] border-[#00D4AA]/30 bg-[#00D4AA]/5',
  failed: 'text-[#b3402f] border-[#b3402f]/30 bg-[#b3402f]/5',
}

export default function InstructionalsPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  function refresh() {
    fetch('/api/gym/modules')
      .then(r => r.json())
      .then(d => { if (d.modules) setModules(d.modules) })
      .catch(() => {})
  }

  useEffect(() => {
    refresh()
    // Poll while anything is still uploading/processing so status flips live.
    const t = setInterval(() => {
      setModules(curr => {
        if (curr.some(m => m.status === 'uploading' || m.status === 'processing')) refresh()
        return curr
      })
    }, 5000)
    return () => clearInterval(t)
  }, [])

  async function handleRemove(id: string) {
    setModules(p => p.filter(m => m.id !== id))
    const res = await fetch('/api/gym/modules', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setToast(res.ok ? 'Instructional removed' : 'Failed to remove')
    if (!res.ok) refresh()
  }

  return (
    <div className="min-h-screen bg-[#141410] flex">
      <GymSidebar active="Instructionals" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#141410] border-b border-[#322f26] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">Gym</p>
            <h1 className="font-mincho text-2xl text-[#f0eadc] tracking-[1px] leading-tight">INSTRUCTIONALS</h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[2px] text-sm px-4 py-2 rounded-sm transition-colors">
            <Plus size={15} /> UPLOAD
          </button>
        </div>

        <div className="px-6 py-6 max-w-5xl">
          <p className="font-mincho text-sm text-[#7a7568] mb-6">
            Pre-recorded technique breakdowns members buy individually — you keep 80% of every sale.
          </p>

          {modules.length === 0 ? (
            <div className="relative bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-16 text-center overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center font-mincho text-[110px] text-[#f0eadc]/[0.03] leading-none select-none pointer-events-none">MODULE</span>
              <p className="relative font-mincho text-[#7a7568] text-sm mb-4">No instructionals uploaded yet.</p>
              <button onClick={() => setShowModal(true)}
                className="relative bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[2px] text-sm px-5 py-2.5 rounded-sm transition-colors">
                UPLOAD YOUR FIRST INSTRUCTIONAL
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(m => {
                const thumb = cfThumbnailUrl(m.cf_video_uid)
                return (
                  <div key={m.id} className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden">
                    <div className="relative h-32 bg-[#18180f]">
                      {thumb ? (
                        <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover grayscale contrast-110" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Video size={22} className="text-[#322f26]" />
                        </span>
                      )}
                      <span className={`absolute top-2 left-2 font-mincho text-[9px] tracking-[2px] uppercase border px-2 py-0.5 rounded-sm ${STATUS_COLOR[m.status]}`}>
                        {STATUS_LABEL[m.status]}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-mincho text-base text-[#f0eadc] tracking-[1px] leading-tight mb-1 line-clamp-2">{m.title}</p>
                      <p className="font-mincho text-xs text-[#7a7568] mb-3">
                        {m.discipline}{m.coaches?.name ? ` · ${m.coaches.name}` : ''}
                      </p>
                      <div className="flex items-center justify-between font-mincho text-xs">
                        <span className="text-[#f0eadc]">₹{(m.price_paise / 100).toLocaleString('en-IN')}</span>
                        <span className="flex items-center gap-1 text-[#7a7568]">
                          <TrendingUp size={11} /> {m.sales_count} sold
                        </span>
                      </div>
                      {m.duration_seconds ? (
                        <p className="flex items-center gap-1 font-mincho text-[11px] text-[#635f54] mt-1.5">
                          <Clock size={10} /> {Math.round(m.duration_seconds / 60)}m
                        </p>
                      ) : null}
                      <button onClick={() => handleRemove(m.id)}
                        className="mt-3 font-mincho text-[11px] text-[#7a7568] hover:text-[#b3402f] transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <UploadModuleModal
          onClose={() => setShowModal(false)}
          onUploaded={() => { setShowModal(false); setToast('Uploading — this can take a few minutes'); refresh() }}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
