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
  BJJ: 'bg-blue-500/10 text-blue-400',
  Boxing: 'bg-yellow-500/10 text-yellow-400',
  'Muay Thai': 'bg-orange-500/10 text-orange-400',
  Wrestling: 'bg-green-500/10 text-green-400',
}

const levelColors = {
  Beginner: 'text-green-400',
  Intermediate: 'text-yellow-400',
  Advanced: 'text-[#FF3B3B]',
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
    <div className={`flex items-center gap-4 px-4 py-3.5 rounded-sm transition-all duration-200 group hover:bg-white/3
      ${isLive ? 'bg-[#FF3B3B]/5 border border-[#FF3B3B]/20' : 'border border-transparent'}`}>
      {/* Time */}
      <div className="w-16 shrink-0 text-center">
        {isLive ? (
          <span className="flex items-center gap-1 justify-center text-[#FF3B3B] text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B3B] animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="text-[#999999] text-sm font-medium">{time}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="flex items-center gap-1 text-[#999999] text-xs">
            <User size={11} /> {coach}
          </span>
          <span className="text-[#555] text-xs">{gym}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${disciplineColors[discipline] ?? 'bg-white/5 text-white/60'}`}>
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
          className="shrink-0 bg-[#FF3B3B] hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-sm transition-colors"
        >
          Watch
        </a>
      )}
    </div>
  )
}
