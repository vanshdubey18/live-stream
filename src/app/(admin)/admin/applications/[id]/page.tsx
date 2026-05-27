'use client'

import { useState, useEffect } from 'react'
import { Check, X, Loader2, MapPin, Mail, Building2 } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Toast from '@/components/gym-dashboard/Toast'

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onClose, showTextarea = false }:
  { title: string; message: string; confirmLabel: string; confirmClass: string; onConfirm: () => Promise<void>; onClose: () => void; showTextarea?: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm w-full max-w-md p-6">
        <h3 className="font-bebas text-2xl text-white tracking-[1px] mb-2">{title}</h3>
        <p className="font-inter text-[#999999] text-sm mb-4">{message}</p>
        {showTextarea && (
          <textarea className="w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white font-inter text-sm resize-none h-24 focus:outline-none focus:border-[#555555] mb-4"
            placeholder="Reason for rejection (optional)..." />
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#333333] text-[#999999] hover:text-white font-inter text-sm rounded-sm transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className={`flex-1 py-3 text-sm rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${confirmClass}`}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const gymId = params.id
  const [gym, setGym] = useState<any>(null)
  const [status, setStatus] = useState<'pending' | 'active' | 'rejected'>('pending')
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/gym-detail?id=${gymId}`)
      .then(r => r.json())
      .then(d => {
        if (d.gym) {
          setGym(d.gym)
          setStatus(d.gym.status)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [gymId])

  async function callApi(action: 'approve' | 'reject') {
    const res = await fetch('/api/admin/approve-gym', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gymId, action }),
    })
    const data = await res.json()
    if (!res.ok) { setToast(data.error ?? 'Something went wrong'); return }
    setStatus(action === 'approve' ? 'active' : 'rejected')
    setModal(null)
    setToast(action === 'approve' ? 'Gym approved ✓' : 'Application rejected')
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Gym Applications" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] px-6 h-16 flex items-center gap-3 mt-14 lg:mt-0">
          <a href="/admin/applications" className="font-inter text-[#999999] hover:text-white text-sm transition-colors">← Applications</a>
          <span className="text-[#333333]">/</span>
          <span className="font-inter text-white text-sm">Review Application</span>
          {status !== 'pending' && (
            <span className={`ml-2 font-inter text-xs px-2.5 py-1 rounded-sm ${status === 'active' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'bg-[#FF3B3B]/10 text-[#FF3B3B]'}`}>
              {status === 'active' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>

        <div className="px-6 py-6 max-w-3xl space-y-6">
          {loading ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-12 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-[#555555]" />
            </div>
          ) : !gym ? (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-12 text-center">
              <p className="font-inter text-[#555555] text-sm">Application not found.</p>
            </div>
          ) : (
            <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 space-y-5">
              {/* Avatar + name */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-sm bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0">
                  <span className="text-white font-bebas text-2xl">{gym.name?.[0] ?? 'G'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bebas text-3xl text-white tracking-[1px] leading-tight">{gym.name}</h2>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {gym.city && (
                      <div className="flex items-center gap-1.5 font-inter text-[#999999] text-sm">
                        <MapPin size={13} /> {gym.city}{gym.location ? `, ${gym.location}` : ''}
                      </div>
                    )}
                    {gym.owner_email && (
                      <div className="flex items-center gap-1.5 font-inter text-[#999999] text-sm">
                        <Mail size={13} /> {gym.owner_email}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {gym.description && (
                <p className="font-inter text-[#999999] text-sm leading-relaxed">{gym.description}</p>
              )}

              {/* Disciplines */}
              {(gym.disciplines ?? []).length > 0 && (
                <div>
                  <p className="font-inter text-[11px] text-[#555555] tracking-[4px] uppercase mb-2">Disciplines</p>
                  <div className="flex flex-wrap gap-2">
                    {gym.disciplines.map((d: string) => (
                      <span key={d} className="font-inter text-xs bg-[#222222] border border-[#333333] text-[#999999] px-3 py-1 rounded-sm">{d}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applied date */}
              <div className="pt-2 border-t border-[#333333]">
                <p className="font-inter text-xs text-[#555555]">
                  Applied {new Date(gym.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          {!loading && gym && status === 'pending' && (
            <div className="flex gap-3">
              <button onClick={() => setModal('approve')}
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px] py-4 rounded-sm text-sm transition-all">
                <Check size={16} /> APPROVE GYM
              </button>
              <button onClick={() => setModal('reject')}
                className="flex-1 flex items-center justify-center gap-2 border border-[#333333] hover:bg-[#1F1F1F] text-[#999999] hover:text-white font-inter py-4 rounded-sm text-sm transition-all">
                <X size={16} /> Reject
              </button>
            </div>
          )}

          {!loading && gym && status !== 'pending' && (
            <div className={`border rounded-sm p-4 flex items-center gap-3 ${status === 'active' ? 'border-[#00D4AA]/20 bg-[#00D4AA]/5' : 'border-[#FF3B3B]/20 bg-[#FF3B3B]/5'}`}>
              <Building2 size={16} className={status === 'active' ? 'text-[#00D4AA]' : 'text-[#FF3B3B]'} />
              <p className={`font-inter text-sm ${status === 'active' ? 'text-[#00D4AA]' : 'text-[#FF3B3B]'}`}>
                {status === 'active' ? 'This gym is approved and live on the platform.' : 'This application has been rejected.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {modal === 'approve' && (
        <ConfirmModal
          title="APPROVE THIS GYM?"
          message="This will make the gym live on the platform. The owner can start streaming immediately."
          confirmLabel="APPROVE GYM"
          confirmClass="bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px]"
          onConfirm={() => callApi('approve')}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'reject' && (
        <ConfirmModal
          title="REJECT THIS APPLICATION?"
          message="The gym will be marked as rejected and won't appear on the platform."
          confirmLabel="REJECT"
          confirmClass="border border-[#FF3B3B]/30 text-[#FF3B3B] font-bebas tracking-[2px] hover:bg-[#FF3B3B]/10"
          onConfirm={() => callApi('reject')}
          onClose={() => setModal(null)}
          showTextarea
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
