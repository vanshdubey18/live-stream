'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import CoachCard, { type Coach } from '@/components/gym-dashboard/CoachCard'
import AddCoachModal from '@/components/gym-dashboard/AddCoachModal'
import Toast from '@/components/gym-dashboard/Toast'

const INITIAL_COACHES: Coach[] = [
  { id: '1', name: 'Rahul Sharma', discipline: 'BJJ', beltRank: 'Black Belt', bio: 'IBJJF champion with 10+ years of competitive experience.' },
  { id: '2', name: 'Arjun Mehta', discipline: 'Boxing', beltRank: 'Pro Fighter', bio: 'Former national boxing champion, 3 years pro record.' },
  { id: '3', name: 'Dev Singh', discipline: 'Muay Thai', bio: 'Trained in Thailand under Kru Yodtong for 5 years.' },
  { id: '4', name: 'Vikram Patel', discipline: 'Wrestling', beltRank: 'National level', bio: 'State gold medalist in freestyle wrestling.' },
]

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  function handleSaved(coach: Coach) {
    setCoaches(p => [...p, coach])
    setToast('Coach added ✓')
  }

  function handleRemove(id: string) {
    setCoaches(p => p.filter(c => c.id !== id))
    setToast('Coach removed')
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      <GymSidebar active="Coaches" />

      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="sticky top-0 z-20 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <h1 className="text-white font-bold text-lg">Your Coaches</h1>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-[#FF3B3B] hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-sm transition-colors">
            <Plus size={15} /> Add Coach
          </button>
        </div>

        <div className="px-6 py-6 max-w-5xl">
          {coaches.length === 0 ? (
            <div className="bg-[#1A1A1A] border border-white/5 rounded-sm px-6 py-16 text-center">
              <p className="text-[#999999] text-sm mb-4">No coaches yet.</p>
              <button onClick={() => setShowModal(true)}
                className="bg-[#FF3B3B] hover:bg-red-700 text-white text-sm font-bold px-5 py-2.5 rounded-sm transition-colors">
                Add your first coach
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coaches.map(coach => (
                <CoachCard key={coach.id} coach={coach}
                  onEdit={() => setToast('Edit coming soon')}
                  onRemove={handleRemove} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && <AddCoachModal onClose={() => setShowModal(false)} onSaved={handleSaved} />}
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
