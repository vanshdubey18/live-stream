'use client'

import { useState } from 'react'
import { Check, X, Loader2, MapPin, Mail } from 'lucide-react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Toast from '@/components/gym-dashboard/Toast'

function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onClose, showTextarea = false }:
  { title: string; message: string; confirmLabel: string; confirmClass: string; onConfirm: (reason?: string) => void; onClose: () => void; showTextarea?: boolean }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  function handleConfirm() {
    setLoading(true)
    setTimeout(() => { onConfirm(reason); setLoading(false) }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-[#888888] text-sm mb-4">{message}</p>
        {showTextarea && (
          <textarea className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none h-24 focus:outline-none focus:border-[#DC2626]/50 mb-4"
            placeholder="Reason for rejection (will be emailed to gym owner)..."
            value={reason} onChange={e => setReason(e.target.value)} />
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-white/10 text-white text-sm font-semibold rounded-xl hover:border-white/20 transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className={`flex-1 py-3 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${confirmClass}`}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ApplicationDetailPage() {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null)
  const [toast, setToast] = useState('')

  const coaches = [
    { name: 'Sameer Khan', discipline: 'BJJ', rank: 'Purple Belt', bio: 'Competed in IBJJF Delhi Open 2024.' },
    { name: 'Nitin Roy', discipline: 'Wrestling', rank: 'State level', bio: 'West Bengal state gold medalist 2023.' },
    { name: 'Priya Mukherjee', discipline: 'BJJ', rank: 'Blue Belt', bio: 'Women\'s division specialist.' },
  ]

  const checklist = [
    { label: 'Gym photos uploaded', done: true },
    { label: 'All coaches verified', done: true },
    { label: 'Bank account added', done: true },
    { label: 'Stream test completed', done: false },
    { label: 'Terms of service signed', done: true },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar active="Gym Applications" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center gap-3 mt-14 lg:mt-0">
          <a href="/admin/applications" className="text-[#888888] hover:text-white text-sm transition-colors">← Applications</a>
          <span className="text-[#555]">/</span>
          <span className="text-white font-bold text-sm">Mat Lab Kolkata</span>
          {status !== 'pending' && (
            <span className={`ml-2 text-xs font-bold px-2.5 py-1 rounded-full ${status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          )}
        </div>

        <div className="px-6 py-6 max-w-3xl space-y-6">
          {/* Gym info */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <div className="h-32 bg-gradient-to-r from-blue-900/30 to-slate-900/30 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-white/20 text-sm">Cover photo pending</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#DC2626]/10 flex items-center justify-center shrink-0">
                <span className="text-[#DC2626] text-2xl font-black">M</span>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Mat Lab Kolkata</h2>
                <div className="flex items-center gap-1.5 text-[#888888] text-sm mt-1"><MapPin size={14} /> Salt Lake, Kolkata</div>
                <div className="flex items-center gap-1.5 text-[#888888] text-sm mt-0.5"><Mail size={14} /> owner@matlabkolkata.com</div>
              </div>
            </div>
            <p className="text-[#888888] text-sm mt-4 leading-relaxed">
              Premier grappling academy in Kolkata focusing on BJJ and Wrestling. Founded in 2022, we train competitors and hobbyists at all levels.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['BJJ', 'Wrestling'].map(d => (
                <span key={d} className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 text-white/60">{d}</span>
              ))}
            </div>
          </div>

          {/* Coaches */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Coaches ({coaches.length})</h3>
            <div className="space-y-3">
              {coaches.map(c => (
                <div key={c.name} className="flex items-start gap-3 bg-[#0a0a0a] rounded-xl p-4">
                  <div className="w-10 h-10 rounded-xl bg-[#DC2626]/10 flex items-center justify-center shrink-0">
                    <span className="text-[#DC2626] font-black text-sm">{c.name[0]}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{c.name}</p>
                    <p className="text-[#888888] text-xs">{c.discipline} · {c.rank}</p>
                    <p className="text-[#555] text-xs mt-1">{c.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Onboarding Checklist</h3>
            <div className="space-y-3">
              {checklist.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
                    ${item.done ? 'bg-green-500/20 border border-green-500/30' : 'bg-white/5 border border-white/10'}`}>
                    {item.done && <Check size={11} className="text-green-400" />}
                  </div>
                  <span className={`text-sm ${item.done ? 'text-white' : 'text-[#555]'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {status === 'pending' && (
            <div className="flex gap-3">
              <button onClick={() => setModal('approve')}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-bold py-4 rounded-xl text-sm transition-all">
                <Check size={16} /> Approve Gym ✅
              </button>
              <button onClick={() => setModal('reject')}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold py-4 rounded-xl text-sm transition-all">
                <X size={16} /> Reject with Feedback ❌
              </button>
            </div>
          )}
        </div>
      </main>

      {modal === 'approve' && (
        <ConfirmModal title="Approve Mat Lab Kolkata?" message="This will create a stream key, notify the owner, and make the gym live on the platform."
          confirmLabel="Approve Gym ✅" confirmClass="bg-green-600 hover:bg-green-700"
          onConfirm={() => { setStatus('approved'); setModal(null); setToast('Gym approved and welcome email sent ✓') }}
          onClose={() => setModal(null)} />
      )}

      {modal === 'reject' && (
        <ConfirmModal title="Reject this application?" message="Provide a reason — this will be emailed to the gym owner."
          confirmLabel="Send Rejection" confirmClass="bg-[#DC2626] hover:bg-red-700"
          onConfirm={() => { setStatus('rejected'); setModal(null); setToast('Rejection sent with feedback') }}
          onClose={() => setModal(null)} showTextarea />
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
