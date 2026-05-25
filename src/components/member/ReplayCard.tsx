import { Play, Clock } from 'lucide-react'

interface ReplayCardProps {
  title: string
  coach: string
  discipline: string
  duration: string
  gym: string
  daysAgo: number
}

const disciplineGradients: Record<string, string> = {
  BJJ: 'from-blue-900/40 to-blue-800/20',
  Boxing: 'from-yellow-900/40 to-yellow-800/20',
  'Muay Thai': 'from-orange-900/40 to-orange-800/20',
  Wrestling: 'from-green-900/40 to-green-800/20',
}

export default function ReplayCard({
  title,
  coach,
  discipline,
  duration,
  gym,
  daysAgo,
}: ReplayCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-200 group flex-shrink-0 w-64">
      {/* Thumbnail */}
      <div className={`relative h-36 bg-gradient-to-br ${disciplineGradients[discipline] ?? 'from-gray-900/40 to-gray-800/20'} flex items-center justify-center`}>
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#FF3B3B]/80 transition-all duration-200">
          <Play size={20} className="text-white fill-white ml-0.5" />
        </div>
        <span className="absolute top-3 left-3 text-xs font-bold text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
          {discipline}
        </span>
        <span className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
          <Clock size={10} /> {duration}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="text-white text-sm font-bold leading-snug line-clamp-2 mb-1">
          {title}
        </h4>
        <p className="text-[#999999] text-xs">{coach} · {gym}</p>
        <p className="text-[#555] text-xs mt-1">
          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
        </p>

        <a
          href="#"
          className="mt-3 w-full flex items-center justify-center gap-1.5 border border-white/10 hover:border-[#FF3B3B]/40 hover:bg-[#FF3B3B]/5 text-white text-xs font-semibold py-2 rounded-xl transition-all duration-200"
        >
          <Play size={12} className="fill-white" /> Watch Replay
        </a>
      </div>
    </div>
  )
}
