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
    return <span className="font-mincho tracking-[1px] text-[#b3402f] text-sm">● LIVE</span>
  }
  if (s === 'ended') {
    return <span className="font-mincho tracking-[1px] text-[#7a7568] text-sm">ENDED</span>
  }
  return <span className="font-mincho tracking-[1px] text-[#f0eadc] text-sm">SCHEDULED</span>
}

export default function ClassesTable({ classes, onDelete, onGoLive }: ClassesTableProps) {
  if (classes.length === 0) {
    return (
      <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm px-6 py-12 text-center">
        <p className="font-mincho text-[#7a7568] text-sm">No classes scheduled yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden">

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#322f26]">
              {['Title', 'Discipline', 'Date / Time', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {classes.map((cls, i) => (
              <tr
                key={cls.id}
                className={`hover:bg-[#242420] transition-colors ${i < classes.length - 1 ? 'border-b border-[#242420]' : ''}`}
              >
                <td className="px-5 py-4 font-mincho text-[#f0eadc] text-sm font-medium">{cls.title}</td>
                <td className="px-5 py-4">
                  <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[2px] uppercase">{cls.discipline}</span>
                </td>
                <td className="px-5 py-4 font-mincho text-[#a29c8c] text-sm whitespace-nowrap">
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
                        className="font-mincho tracking-[2px] text-sm bg-[#f0eadc] text-[#141410] px-3 py-1 rounded-sm hover:bg-[#e4dcc8] transition-colors"
                      >
                        {(cls.status as string) === 'live' ? 'MANAGE' : 'GO LIVE'}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(cls.id)}
                      className="w-7 h-7 flex items-center justify-center border border-[#322f26] text-[#7a7568] hover:text-[#f0eadc] hover:border-[#7a7568] rounded-sm transition-all"
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
      <div className="md:hidden divide-y divide-[#242420]">
        {classes.map(cls => (
          <div key={cls.id} className="px-4 py-4 space-y-3 hover:bg-[#242420] transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mincho text-[#f0eadc] text-sm font-medium">{cls.title}</p>
                <p className="font-mincho text-[#a29c8c] text-xs mt-0.5 tracking-[2px] uppercase">{cls.discipline}</p>
                <p className="font-mincho text-[#7a7568] text-xs mt-0.5">{cls.date} · {cls.time}</p>
              </div>
              <StatusBadge status={cls.status} />
            </div>
            <div className="flex gap-2">
              {cls.status !== 'ended' && (
                <button
                  onClick={() => onGoLive(cls.id)}
                  className="font-mincho tracking-[2px] text-sm bg-[#f0eadc] text-[#141410] px-4 py-1.5 rounded-sm hover:bg-[#e4dcc8] transition-colors"
                >
                  {cls.status === 'live' ? 'MANAGE' : 'GO LIVE'}
                </button>
              )}
              <button
                onClick={() => onDelete(cls.id)}
                className="flex items-center gap-1.5 border border-[#322f26] text-[#7a7568] hover:text-[#f0eadc] font-mincho text-xs px-3 py-1.5 rounded-sm transition-all"
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
