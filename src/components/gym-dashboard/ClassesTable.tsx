'use client'

import { Radio, Pencil, Trash2 } from 'lucide-react'
import type { ScheduledClass } from './ScheduleClassModal'

const disciplineColors: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
}

interface ClassesTableProps {
  classes: ScheduledClass[]
  onDelete: (id: string) => void
  onGoLive: (id: string) => void
}

export default function ClassesTable({ classes, onDelete, onGoLive }: ClassesTableProps) {
  if (classes.length === 0) {
    return (
      <div className="bg-[#111111] border border-white/5 rounded-2xl px-6 py-12 text-center">
        <p className="text-[#888888] text-sm">No classes scheduled yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Date', 'Time', 'Title', 'Discipline', 'Coach', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#888888] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {classes.map(cls => (
              <tr key={cls.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3.5 text-white font-medium whitespace-nowrap">{cls.date}</td>
                <td className="px-4 py-3.5 text-[#888888] whitespace-nowrap">{cls.time}</td>
                <td className="px-4 py-3.5 text-white font-medium">{cls.title}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${disciplineColors[cls.discipline] ?? 'bg-white/5 text-white/60'}`}>
                    {cls.discipline}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[#888888]">{cls.coach}</td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-medium text-[#888888] bg-white/5 px-2.5 py-1 rounded-full">
                    {cls.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onGoLive(cls.id)}
                      className="flex items-center gap-1.5 bg-[#DC2626]/10 hover:bg-[#DC2626]/20 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all">
                      <Radio size={12} /> Go Live
                    </button>
                    <button onClick={() => onDelete(cls.id)}
                      className="w-7 h-7 flex items-center justify-center text-[#555] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-white/5">
        {classes.map(cls => (
          <div key={cls.id} className="px-4 py-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-white font-semibold text-sm">{cls.title}</p>
                <p className="text-[#888888] text-xs mt-0.5">{cls.coach} · {cls.date} {cls.time}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${disciplineColors[cls.discipline] ?? 'bg-white/5 text-white/60'}`}>
                {cls.discipline}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onGoLive(cls.id)}
                className="flex items-center gap-1.5 bg-[#DC2626]/10 border border-[#DC2626]/20 text-[#DC2626] text-xs font-semibold px-3 py-1.5 rounded-lg">
                <Radio size={11} /> Go Live
              </button>
              <button onClick={() => onDelete(cls.id)}
                className="flex items-center gap-1.5 text-[#555] hover:text-red-400 text-xs px-2 py-1.5 rounded-lg">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
