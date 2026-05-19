'use client'

import { useState } from 'react'
import { Users, TrendingUp, CalendarDays, Radio, ExternalLink, Plus } from 'lucide-react'
import GymSidebar from '@/components/layout/GymSidebar'
import StatsCard from '@/components/gym-dashboard/StatsCard'
import StreamSetupCard from '@/components/gym-dashboard/StreamSetupCard'
import ClassesTable from '@/components/gym-dashboard/ClassesTable'
import PayoutsTable from '@/components/gym-dashboard/PayoutsTable'
import ScheduleClassModal, { type ScheduledClass } from '@/components/gym-dashboard/ScheduleClassModal'
import Toast from '@/components/gym-dashboard/Toast'

const INITIAL_CLASSES: ScheduledClass[] = [
  { id: '1', date: 'Today', time: '7:00 PM', title: 'BJJ Fundamentals', discipline: 'BJJ', coach: 'Rahul Sharma', level: 'Beginner', duration: '60 min', status: 'Scheduled' },
  { id: '2', date: 'Tomorrow', time: '6:00 AM', title: 'Boxing Combinations', discipline: 'Boxing', coach: 'Arjun Mehta', level: 'Intermediate', duration: '45 min', status: 'Scheduled' },
  { id: '3', date: 'Wed 21 May', time: '7:30 PM', title: 'Muay Thai Clinch', discipline: 'Muay Thai', coach: 'Dev Singh', level: 'Advanced', duration: '60 min', status: 'Scheduled' },
  { id: '4', date: 'Thu 22 May', time: '6:00 AM', title: 'Wrestling Takedowns', discipline: 'Wrestling', coach: 'Vikram Patel', level: 'Intermediate', duration: '60 min', status: 'Scheduled' },
  { id: '5', date: 'Fri 23 May', time: '8:00 PM', title: 'No-Gi Grappling', discipline: 'BJJ', coach: 'Rahul Sharma', level: 'Advanced', duration: '90 min', status: 'Scheduled' },
]

export default function GymDashboardPage() {
  const [classes, setClasses] = useState<ScheduledClass[]>(INITIAL_CLASSES)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState('')

  function handleScheduled(cls: ScheduledClass) {
    setClasses(p => [cls, ...p])
    setToast('Class scheduled ✓')
  }

  function handleDelete(id: string) {
    setClasses(p => p.filter(c => c.id !== id))
    setToast('Class removed')
  }

  function handleGoLive(id: string) {
    setToast('Going live… (Mux integration coming soon)')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <GymSidebar active="Overview" />

      <main className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 h-16 flex items-center justify-between mt-14 lg:mt-0">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Welcome, Rahul</h1>
            <p className="text-[#888888] text-xs">Xtreme MMA Mumbai</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Active
            </span>
            <a href="#" className="hidden sm:flex items-center gap-1.5 text-[#888888] hover:text-white text-xs transition-colors">
              View gym page <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8 max-w-5xl">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Total Members" value="47"
              sub="+12 this month"
              icon={<Users size={18} className="text-green-400" />} />
            <StatsCard label="This Month Revenue" value="₹47,000"
              sub="Your 70% share"
              icon={<TrendingUp size={18} className="text-[#DC2626]" />}
              accent />
            <StatsCard label="Classes This Week" value="18"
              sub="12 completed, 6 scheduled"
              icon={<CalendarDays size={18} className="text-[#888888]" />} />
            <StatsCard label="Hours Streamed" value="28h"
              sub="This month"
              icon={<Radio size={18} className="text-[#888888]" />} />
          </div>

          {/* Stream Setup */}
          <StreamSetupCard />

          {/* Upcoming Classes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">Upcoming Classes</h2>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 bg-[#DC2626] hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                <Plus size={15} /> Schedule New Class
              </button>
            </div>
            <ClassesTable classes={classes} onDelete={handleDelete} onGoLive={handleGoLive} />
          </section>

          {/* Payouts */}
          <section>
            <h2 className="text-white font-bold text-lg mb-4">Recent Payouts</h2>
            <PayoutsTable />
          </section>

        </div>
      </main>

      {showModal && (
        <ScheduleClassModal
          onClose={() => setShowModal(false)}
          onScheduled={handleScheduled}
        />
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
