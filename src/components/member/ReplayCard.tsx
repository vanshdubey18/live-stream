import { Play, Clock } from 'lucide-react'

interface ReplayCardProps {
  title: string
  coach: string
  discipline: string
  duration: string
  gym: string
  daysAgo: number
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
    <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden hover:bg-[#242420] transition-colors group flex-shrink-0 w-64">
      {/* Thumbnail */}
      <div className="relative h-36 bg-[#18180f] flex items-center justify-center">
        <div className="w-12 h-12 rounded-sm bg-[#242420] flex items-center justify-center group-hover:bg-[#f0eadc] transition-colors duration-200">
          <Play size={20} className="text-[#f0eadc] group-hover:text-[#141410] fill-white group-hover:fill-black ml-0.5 transition-colors" />
        </div>
        <span className="absolute top-3 left-3 font-mincho text-[10px] text-[#a29c8c] tracking-[2px] uppercase">
          {discipline}
        </span>
        <span className="absolute bottom-3 right-3 flex items-center gap-1 font-mincho text-[10px] text-[#7a7568]">
          <Clock size={10} /> {duration}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-mincho text-lg text-[#f0eadc] leading-tight line-clamp-2 mb-1">
          {title}
        </h4>
        <p className="font-mincho text-xs text-[#a29c8c]">{coach} · {gym}</p>
        <p className="font-mincho text-xs text-[#7a7568] mt-1">
          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
        </p>

        <a
          href="#"
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho text-xs font-semibold py-2 rounded-sm transition-colors"
        >
          <Play size={12} className="fill-black" /> Watch Replay
        </a>
      </div>
    </div>
  )
}
