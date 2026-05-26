import { Pencil, Trash2 } from 'lucide-react'

export interface Coach {
  id: string
  name: string
  discipline: string
  beltRank?: string
  bio?: string
}

const disciplineColors: Record<string, string> = {
  BJJ: 'bg-[#1A1A1A] text-[#999999]',
  Boxing: 'bg-[#FFD60A]/10 text-[#FFD60A]',
  'Muay Thai': 'bg-[#1A1A1A] text-[#999999]',
  Wrestling: 'bg-[#00D4AA]/10 text-[#00D4AA]',
}

interface CoachCardProps {
  coach: Coach
  onEdit: (coach: Coach) => void
  onRemove: (id: string) => void
}

export default function CoachCard({ coach, onEdit, onRemove }: CoachCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm p-6 hover:border-[#333333] transition-all duration-200 flex flex-col gap-4">
      {/* Avatar */}
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-sm bg-[#222222] border border-[#333333] flex items-center justify-center">
          <span className="font-bebas text-2xl text-white">{coach.name[0]}</span>
        </div>
        <span className={`font-inter text-[10px] tracking-[2px] uppercase px-2 py-1 rounded-sm ${disciplineColors[coach.discipline] ?? 'bg-[#1A1A1A] text-[#999999]'}`}>
          {coach.discipline}
        </span>
      </div>

      <div>
        <h3 className="font-bebas text-xl text-white">{coach.name}</h3>
        {coach.beltRank && (
          <p className="text-[#999999] text-xs mt-0.5">{coach.beltRank}</p>
        )}
        {coach.bio && (
          <p className="text-[#555] text-sm mt-2 line-clamp-2">{coach.bio}</p>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        <button onClick={() => onEdit(coach)}
          className="flex-1 flex items-center justify-center gap-1.5 border border-[#333333] hover:border-[#333333] hover:bg-[#1A1A1A] text-white text-xs font-semibold py-2 rounded-sm transition-all">
          <Pencil size={12} /> Edit
        </button>
        <button onClick={() => onRemove(coach.id)}
          className="flex-1 flex items-center justify-center gap-1.5 border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-semibold py-2 rounded-sm transition-all">
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </div>
  )
}
