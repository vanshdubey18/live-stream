'use client'

import { Trash2 } from 'lucide-react'
interface SessionRow {
  id: string
  title: string
  discipline: string
  scheduled_at?: string
  date?: string
  time?: string
  coach?: string
  level?: string
  status?: string
}

interface ClassesTableProps {
  classes: SessionRow[]
  onDelete: (id: string) => void
  onGoLive: (id: string) => void
}

function StatusBadge({ status }: { status?: string }) {
  const s = (status ?? 'scheduled').toLowerCase()
  if (s === 'live') {
    return <span className="font-bebas tracking-[1px] text-[#FF3B3B] text-sm">● LIVE</span>
  }
  if (s === 'ended') {
    return <span className="font-bebas tracking-[1px] text-[#555555] text-sm">ENDED</span>
  }
  return <span className="font-bebas tracking-[1px] text-white text-sm">SCHEDULED</span>
}

export default function ClassesTable({ classes, onDelete, onGoLive }: ClassesTableProps) {
  if (classes.length === 0) {
    return (
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm px-6 py-12 text-center">
        <p className="font-inter text-[#555555] text-sm">No classes scheduled yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333333]">
              {['Title', 'Discipline', 'Date / Time', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map((cls, i) => (
              <tr
                key={cls.id}
                className={`hover:bg-[#222222] transition-colors ${i < classes.length - 1 ? 'border-b border-[#222222]' : ''}`}
              >
                <td className="px-5 py-4 font-inter text-white text-sm font-medium">{cls.title}</td>
                <td className="px-5 py-4">
                  <span className="font-inter text-[11px] text-[#999999] tracking-[2px] uppercase">{cls.discipline}</span>
                </td>
                <td className="px-5 py-4 font-inter text-[#999999] text-sm whitespace-nowrap">
                  {cls.date} · {cls.time}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={cls.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {(cls.status as string) !== 'ended' && (
                      <button
                        onClick={() => onGoLive(cls.id)}
                        className="font-bebas tracking-[2px] text-sm bg-white text-black px-3 py-1 rounded-sm hover:bg-[#E5E5E5] transition-colors"
                      >
                        {(cls.status as string) === 'live' ? 'MANAGE' : 'GO LIVE'}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(cls.id)}
                      className="w-7 h-7 flex items-center justify-center border border-[#333333] text-[#555555] hover:text-white hover:border-[#555555] rounded-sm transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile rows */}
      <div className="md:hidden divide-y divide-[#222222]">
        {classes.map(cls => (
          <div key={cls.id} className="px-4 py-4 space-y-3 hover:bg-[#222222] transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-inter text-white text-sm font-medium">{cls.title}</p>
                <p className="font-inter text-[#999999] text-xs mt-0.5 tracking-[2px] uppercase">{cls.discipline}</p>
                <p className="font-inter text-[#555555] text-xs mt-0.5">{cls.date} · {cls.time}</p>
              </div>
              <StatusBadge status={cls.status} />
            </div>
            <div className="flex gap-2">
              {cls.status !== 'ended' && (
                <button
                  onClick={() => onGoLive(cls.id)}
                  className="font-bebas tracking-[2px] text-sm bg-white text-black px-4 py-1.5 rounded-sm hover:bg-[#E5E5E5] transition-colors"
                >
                  {cls.status === 'live' ? 'MANAGE' : 'GO LIVE'}
                </button>
              )}
              <button
                onClick={() => onDelete(cls.id)}
                className="flex items-center gap-1.5 border border-[#333333] text-[#555555] hover:text-white font-inter text-xs px-3 py-1.5 rounded-sm transition-all"
              >
                <Trash2 size={11} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
