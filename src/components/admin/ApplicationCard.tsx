'use client'

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

interface ApplicationCardProps {
  app: GymApplication
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

const statusDot: Record<string, string> = {
  pending: 'bg-[#FFD60A]',
  approved: 'bg-[#00D4AA]',
  rejected: 'bg-[#FF3B3B]',
}

const statusText: Record<string, string> = {
  pending: 'text-[#FFD60A]',
  approved: 'text-[#00D4AA]',
  rejected: 'text-[#FF3B3B]',
}

export default function ApplicationCard({ app, onApprove, onReject }: ApplicationCardProps) {
  return (
    <div className="border-b border-[#2A2A2A] py-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bebas text-xl text-white tracking-[1px]">{app.name}</h3>
          <p className="font-inter text-sm text-[#999999] mt-0.5">{app.location}, {app.city} · {app.disciplines.join(', ')}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDot[app.status]}`} />
          <span className={`font-inter text-xs uppercase tracking-[2px] ${statusText[app.status]}`}>{app.status}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 font-inter text-xs text-[#999999]">
        <span>{app.coachCount} coaches</span>
        <span>·</span>
        <span className={app.bankDetailsComplete ? 'text-[#00D4AA]' : 'text-[#FFD60A]'}>
          Bank {app.bankDetailsComplete ? 'complete' : 'pending'}
        </span>
        <span>·</span>
        <span>{app.ownerEmail}</span>
        <span>·</span>
        <span className="text-[#555555]">{app.submittedAt}</span>
      </div>

      {app.status === 'pending' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApprove(app.id)}
            className="bg-white text-black font-bebas tracking-[3px] text-sm px-5 py-2 rounded-sm hover:bg-[#E5E5E5] transition-colors"
          >
            APPROVE
          </button>
          <button
            onClick={() => onReject(app.id)}
            className="border border-[#333333] text-[#999999] font-inter text-sm px-5 py-2 rounded-sm hover:text-white transition-colors"
          >
            Reject
          </button>
          <a
            href={`/admin/applications/${app.id}`}
            className="border border-[#333333] text-[#999999] font-inter text-sm px-5 py-2 rounded-sm hover:text-white transition-colors"
          >
            View Full
          </a>
        </div>
      )}
    </div>
  )
}
