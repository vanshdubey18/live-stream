import { Pencil, Trash2 } from 'lucide-react'

export interface Coach {
  id: string
  name: string
  discipline: string
  beltRank?: string
  bio?: string
}

const disciplineColors: Record<string, string> = {
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
}

interface CoachCardProps {
  coach: Coach
  onEdit: (coach: Coach) => void
  onRemove: (id: string) => void
}

export default function CoachCard({ coach, onEdit, onRemove }: CoachCardProps) {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-200 flex flex-col gap-4">
      {/* Avatar */}
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DC2626]/20 to-[#DC2626]/5 flex items-center justify-center">
          <span className="text-[#DC2626] text-xl font-black">{coach.name[0]}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${disciplineColors[coach.discipline] ?? 'bg-white/5 text-white/60'}`}>
          {coach.discipline}
        </span>
      </div>

      <div>
        <h3 className="text-white font-bold text-base">{coach.name}</h3>
        {coach.beltRank && (
          <p className="text-[#888888] text-xs mt-0.5">{coach.beltRank}</p>
        )}
        {coach.bio && (
          <p className="text-[#555] text-sm mt-2 line-clamp-2">{coach.bio}</p>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        <button onClick={() => onEdit(coach)}
          className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white text-xs font-semibold py-2 rounded-xl transition-all">
          <Pencil size={12} /> Edit
        </button>
        <button onClick={() => onRemove(coach.id)}
          className="flex-1 flex items-center justify-center gap-1.5 border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-semibold py-2 rounded-xl transition-all">
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </div>
  )
}
