import { User } from 'lucide-react'

interface ClassRowProps {
  time: string
  title: string
  discipline: string
  coach: string
  gym: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  isLive?: boolean
}

const disciplineColors: Record<string, string> = {
  BJJ: 'bg-[#1c1c16] text-[#a29c8c]',
  Boxing: 'bg-[#FFD60A]/10 text-[#FFD60A]',
  'Muay Thai': 'bg-[#1c1c16] text-[#a29c8c]',
  Wrestling: 'bg-[#00D4AA]/10 text-[#00D4AA]',
}

const levelColors = {
  Beginner: 'text-[#00D4AA]',
  Intermediate: 'text-[#FFD60A]',
  Advanced: 'text-[#b3402f]',
}

export default function ClassRow({
  time,
  title,
  discipline,
  coach,
  gym,
  level,
  isLive = false,
}: ClassRowProps) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3.5 rounded-sm transition-all duration-200 group hover:bg-[#f0eadc]/3
      ${isLive ? 'bg-[#b3402f]/5 border border-[#b3402f]/20' : 'border border-transparent'}`}>
      {/* Time */}
      <div className="w-16 shrink-0 text-center">
        {isLive ? (
          <span className="flex items-center gap-1 justify-center text-[#b3402f] text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b3402f] animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="text-[#a29c8c] text-sm font-medium">{time}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[#f0eadc] text-sm font-semibold truncate">{title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-[#a29c8c] text-xs">
            <User size={11} /> {coach}
          </span>
          <span className="text-[#555] text-xs">{gym}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-sm ${disciplineColors[discipline] ?? 'bg-[#1c1c16] text-[#f0eadc]/60'}`}>
          {discipline}
        </span>
        <span className={`text-xs font-medium ${levelColors[level]}`}>
          {level}
        </span>
      </div>

      {/* Watch button (live only) */}
      {isLive && (
        <a
          href="#"
          className="shrink-0 bg-[#b3402f] hover:bg-red-700 text-[#f0eadc] text-xs font-bold px-3 py-1.5 rounded-sm transition-colors"
        >
          Watch
        </a>
      )}
    </div>
  )
}
