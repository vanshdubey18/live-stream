'use client'

import { useState } from 'react'
import { Check, X, Loader2, MapPin, Mail } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Toast from '@/components/gym-dashboard/Toast'

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onClose, showTextarea = false }:
  { title: string; message: string; confirmLabel: string; confirmClass: string; onConfirm: () => Promise<void>; onClose: () => void; showTextarea?: boolean }) {
  const [reason, setReason] = useState('')
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
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-[#999999] text-sm mb-4">{message}</p>
        {showTextarea && (
          <textarea className="w-full bg-[#0D0D0D] border border-[#333333] rounded-sm px-4 py-3 text-white text-sm resize-none h-24 focus:outline-none focus:border-[#FF3B3B]/50 mb-4"
            placeholder="Reason for rejection..."
            value={reason} onChange={e => setReason(e.target.value)} />
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-[#333333] text-white text-sm font-semibold rounded-sm hover:bg-[#222222] transition-all">
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
  const [status, setStatus] = useState<'pending' | 'active' | 'rejected'>('pending')
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const [toast, setToast] = useState('')

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
    setToast(action === 'approve' ? 'Gym approved ✓' : 'Rejection sent')
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Gym Applications" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#2A2A2A] px-6 h-16 flex items-center gap-3 mt-14 lg:mt-0">
          <a href="/admin/applications" className="text-[#999999] hover:text-white text-sm transition-colors">← Applications</a>
          <span className="text-[#555]">/</span>
          <span className="text-white font-bold text-sm">Review Application</span>
          {status !== 'pending' && (
            <span className={`ml-2 text-xs font-bold px-2.5 py-1 rounded-sm ${status === 'active' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'bg-red-500/10 text-red-400'}`}>
              {status === 'active' ? 'Approved' : 'Rejected'}
            </span>
          )}
        </div>

        <div className="px-6 py-6 max-w-3xl space-y-6">
          <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm p-6">
            <div className="h-24 bg-[#111111] border border-[#333333] rounded-sm mb-4 flex items-center justify-center">
              <span className="font-inter text-[#555555] text-xs tracking-[2px] uppercase">Cover photo</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-sm bg-[#222222] border border-[#333333] flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-black font-bebas">G</span>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Gym Application</h2>
                <div className="flex items-center gap-1.5 text-[#999999] text-sm mt-1"><MapPin size={13} /> Location on file</div>
                <div className="flex items-center gap-1.5 text-[#999999] text-sm mt-0.5"><Mail size={13} /> Email on file</div>
              </div>
            </div>
          </div>

          {status === 'pending' && (
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
        </div>
      </main>

      {modal === 'approve' && (
        <ConfirmModal
          title="Approve this gym?"
          message="This will make the gym live on the platform. The owner can start streaming immediately."
          confirmLabel="APPROVE GYM"
          confirmClass="bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px]"
          onConfirm={() => callApi('approve')}
          onClose={() => setModal(null)}
        />
      )}

      {modal === 'reject' && (
        <ConfirmModal
          title="Reject this application?"
          message="The gym will be marked as rejected."
          confirmLabel="REJECT"
          confirmClass="bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px]"
          onConfirm={() => callApi('reject')}
          onClose={() => setModal(null)}
          showTextarea
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
