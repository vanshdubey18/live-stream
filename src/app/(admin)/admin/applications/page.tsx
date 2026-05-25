'use client'

import { useState } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import ApplicationCard, { type GymApplication } from '@/components/admin/ApplicationCard'
import Toast from '@/components/gym-dashboard/Toast'

const INITIAL: GymApplication[] = [
  { id: '1', name: 'Mat Lab Kolkata', city: 'Kolkata', location: 'Salt Lake', disciplines: ['BJJ', 'Wrestling'], coachCount: 3, ownerEmail: 'owner@matlabkolkata.com', submittedAt: '2 hours ago', bankDetailsComplete: true, status: 'pending' },
  { id: '2', name: 'Strike First MMA Pune', city: 'Pune', location: 'Koregaon Park', disciplines: ['Boxing', 'Muay Thai', 'BJJ'], coachCount: 4, ownerEmail: 'admin@strikefirst.in', submittedAt: '1 day ago', bankDetailsComplete: false, status: 'pending' },
  { id: '3', name: 'Xtreme MMA Mumbai', city: 'Mumbai', location: 'Andheri West', disciplines: ['BJJ', 'Boxing', 'Muay Thai', 'Wrestling'], coachCount: 4, ownerEmail: 'rahul@xtrememma.com', submittedAt: '14 days ago', bankDetailsComplete: true, status: 'approved' },
  { id: '4', name: 'Gracie Barra Delhi', city: 'Delhi', location: 'Connaught Place', disciplines: ['BJJ'], coachCount: 2, ownerEmail: 'delhi@graciebarra.com', submittedAt: '21 days ago', bankDetailsComplete: true, status: 'approved' },
  { id: '5', name: 'Fake Gym Test', city: 'Mumbai', location: 'Unknown', disciplines: ['BJJ'], coachCount: 0, ownerEmail: 'test@test.com', submittedAt: '10 days ago', bankDetailsComplete: false, status: 'rejected' },
]

const TABS = ['Pending', 'Approved', 'Rejected'] as const

export default function ApplicationsPage() {
  const [apps, setApps] = useState<GymApplication[]>(INITIAL)
  const [tab, setTab] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending')
  const [toast, setToast] = useState('')

  function handleApprove(id: string) {
    setApps(p => p.map(a => a.id === id ? { ...a, status: 'approved' } : a))
    setToast('Gym approved ✓')
  }

  function handleReject(id: string) {
    setApps(p => p.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
    setToast('Gym rejected')
  }

  const filtered = apps.filter(a => a.status === tab.toLowerCase())
  const pendingCount = apps.filter(a => a.status === 'pending').length

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <AdminSidebar active="Gym Applications" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Gym Applications</h1>
        </div>

        <div className="px-6 py-6 max-w-5xl">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#1A1A1A] border border-white/5 rounded-xl p-1 mb-6 w-fit">
            {TABS.map(t => {
              const count = t === 'Pending' ? pendingCount : apps.filter(a => a.status === t.toLowerCase()).length
              return (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                    ${tab === t ? 'bg-white/10 text-white' : 'text-[#999999] hover:text-white'}`}>
                  {t}
                  {count > 0 && (
                    <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center
                      ${t === 'Pending' ? 'bg-[#FF3B3B] text-white' : 'bg-white/10 text-white/60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-16 text-center">
              <p className="text-[#999999] text-sm">No {tab.toLowerCase()} applications.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(app => (
                <ApplicationCard key={app.id} app={app} onApprove={handleApprove} onReject={handleReject} />
              ))}
            </div>
          )}
        </div>
      </main>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
