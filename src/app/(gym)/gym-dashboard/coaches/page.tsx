'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import CoachCard, { type Coach } from '@/components/gym-dashboard/CoachCard'
import AddCoachModal from '@/components/gym-dashboard/AddCoachModal'
import Toast from '@/components/gym-dashboard/Toast'

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editCoach, setEditCoach] = useState<Coach | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/gym/coaches')
      .then(r => r.json())
      .then(d => { if (d.coaches) setCoaches(d.coaches) })
      .catch(() => {})
  }, [])

  function handleSaved(coach: Coach) {
    setCoaches(p => {
      const idx = p.findIndex(c => c.id === coach.id)
      if (idx >= 0) {
        const next = [...p]
        next[idx] = coach
        return next
      }
      return [...p, coach]
    })
    setToast(editCoach ? 'Coach updated ✓' : 'Coach added ✓')
    setEditCoach(null)
  }

  function handleEdit(coach: Coach) {
    setEditCoach(coach)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setEditCoach(null)
  }

  async function handleRemove(id: string) {
    setCoaches(p => p.filter(c => c.id !== id))
    const res = await fetch('/api/gym/coaches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (!res.ok) {
      setToast('Failed to remove coach')
      fetch('/api/gym/coaches').then(r => r.json()).then(d => { if (d.coaches) setCoaches(d.coaches) })
    } else {
      setToast('Coach removed')
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Coaches" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D] border-b border-[#333333] px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <p className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Gym</p>
            <h1 className="font-bebas text-2xl text-white tracking-[1px] leading-tight">COACHES</h1>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px] text-sm px-4 py-2 rounded-sm transition-colors">
            <Plus size={15} /> ADD COACH
          </button>
        </div>

        <div className="px-6 py-6 max-w-5xl">
          {coaches.length === 0 ? (
            <div className="relative bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-16 text-center overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center font-bebas text-[120px] text-white/[0.03] leading-none select-none pointer-events-none">COACH</span>
              <p className="relative font-inter text-[#555555] text-sm mb-4">No coaches yet.</p>
              <button onClick={() => setShowModal(true)}
                className="relative bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px] text-sm px-5 py-2.5 rounded-sm transition-colors">
                ADD YOUR FIRST COACH
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coaches.map(coach => (
                <CoachCard key={coach.id} coach={coach}
                  onEdit={handleEdit}
                  onRemove={handleRemove} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <AddCoachModal
          onClose={handleCloseModal}
          onSaved={handleSaved}
          coach={editCoach}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
