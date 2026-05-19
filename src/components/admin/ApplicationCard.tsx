'use client'

import { MapPin, Clock, Check, X, ExternalLink } from 'lucide-react'

export interface GymApplication {
  id: string
  name: string
  city: string
  location: string
  disciplines: string[]
  coachCount: number
  ownerEmail: string
  submittedAt: string
  bankDetailsComplete: boolean
  status: 'pending' | 'approved' | 'rejected'
}

const disciplineColors: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
}

interface ApplicationCardProps {
  app: GymApplication
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export default function ApplicationCard({ app, onApprove, onReject }: ApplicationCardProps) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-white font-bold text-base">{app.name}</h3>
          <div className="flex items-center gap-1.5 mt-1 text-[#888888] text-xs">
            <MapPin size={12} /> {app.location}, {app.city}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[#888888] text-xs shrink-0">
          <Clock size={12} /> {app.submittedAt}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {app.disciplines.map(d => (
          <span key={d} className={`text-xs font-medium px-2.5 py-1 rounded-full ${disciplineColors[d] ?? 'bg-white/5 text-white/60'}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[#0a0a0a] rounded-xl px-3 py-2.5">
          <p className="text-[#555] text-xs">Coaches</p>
          <p className="text-white text-sm font-bold mt-0.5">{app.coachCount}</p>
        </div>
        <div className="bg-[#0a0a0a] rounded-xl px-3 py-2.5">
          <p className="text-[#555] text-xs">Bank Details</p>
          <p className={`text-sm font-bold mt-0.5 flex items-center gap-1 ${app.bankDetailsComplete ? 'text-green-400' : 'text-yellow-400'}`}>
            {app.bankDetailsComplete ? <><Check size={12} /> Complete</> : 'Pending'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 text-xs text-[#888888]">
        <span>Applied by:</span>
        <span className="text-white font-medium">{app.ownerEmail}</span>
      </div>

      <div className="flex gap-2">
        <a href={`/admin/applications/${app.id}`}
          className="flex items-center gap-1.5 border border-white/10 hover:border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all">
          <ExternalLink size={12} /> View Full
        </a>
        <button onClick={() => onApprove(app.id)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-xs font-bold py-2 rounded-xl transition-all">
          <Check size={13} /> Approve
        </button>
        <button onClick={() => onReject(app.id)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold py-2 rounded-xl transition-all">
          <X size={13} /> Reject
        </button>
      </div>
    </div>
  )
}
