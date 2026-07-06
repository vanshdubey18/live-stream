import { Pencil, Trash2 } from 'lucide-react'

export interface Coach {
  id: string
  name: string
  discipline: string
  belt_rank?: string | null
  beltRank?: string | null
  bio?: string | null
  avatar_url?: string | null
}

const disciplineColors: Record<string, string> = {
  BJJ: 'bg-[#1c1c16] text-[#a29c8c]',
  Boxing: 'bg-[#FFD60A]/10 text-[#FFD60A]',
  'Muay Thai': 'bg-[#1c1c16] text-[#a29c8c]',
  Wrestling: 'bg-[#00D4AA]/10 text-[#00D4AA]',
}

interface CoachCardProps {
  coach: Coach
  onEdit: (coach: Coach) => void
  onRemove: (id: string) => void
}

export default function CoachCard({ coach, onEdit, onRemove }: CoachCardProps) {
  const rank = coach.belt_rank ?? coach.beltRank

  return (
    <div className="bg-[#1c1c16] border border-[#2a2a20] rounded-sm overflow-hidden hover:border-[#322f26] transition-all duration-200 flex flex-col">
      {/* Photo or placeholder */}
      <div className="relative w-full aspect-[4/3] bg-[#18180f]">
        {coach.avatar_url ? (
          <img
            src={coach.avatar_url}
            alt={coach.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mincho text-6xl text-[#322f26]">{coach.name[0]}</span>
          </div>
        )}
        {/* Discipline badge overlaid on photo */}
        <span className={`absolute top-3 right-3 font-mincho text-[10px] tracking-[2px] uppercase px-2 py-1 rounded-sm ${disciplineColors[coach.discipline] ?? 'bg-[#1c1c16] text-[#a29c8c]'} border border-[#322f26]`}>
          {coach.discipline}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-mincho text-xl text-[#f0eadc] leading-tight">{coach.name}</h3>
          {rank && (
            <p className="text-[#a29c8c] text-xs mt-0.5">{rank}</p>
          )}
          {coach.bio && (
            <p className="text-[#555] text-sm mt-2 line-clamp-2">{coach.bio}</p>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <button onClick={() => onEdit(coach)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-[#322f26] hover:bg-[#242420] text-[#f0eadc] text-xs font-semibold py-2 rounded-sm transition-all">
            <Pencil size={12} /> Edit
          </button>
          <button onClick={() => onRemove(coach.id)}
            className="flex-1 flex items-center justify-center gap-1.5 border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-semibold py-2 rounded-sm transition-all">
            <Trash2 size={12} /> Remove
          </button>
        </div>
      </div>
    </div>
  )
}
