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
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden hover:bg-[#222222] transition-colors group flex-shrink-0 w-64">
      {/* Thumbnail */}
      <div className="relative h-36 bg-[#111111] flex items-center justify-center">
        <div className="w-12 h-12 rounded-sm bg-[#222222] flex items-center justify-center group-hover:bg-white transition-colors duration-200">
          <Play size={20} className="text-white group-hover:text-black fill-white group-hover:fill-black ml-0.5 transition-colors" />
        </div>
        <span className="absolute top-3 left-3 font-inter text-[10px] text-[#999999] tracking-[2px] uppercase">
          {discipline}
        </span>
        <span className="absolute bottom-3 right-3 flex items-center gap-1 font-inter text-[10px] text-[#555555]">
          <Clock size={10} /> {duration}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-bebas text-lg text-white leading-tight line-clamp-2 mb-1">
          {title}
        </h4>
        <p className="font-inter text-xs text-[#999999]">{coach} · {gym}</p>
        <p className="font-inter text-xs text-[#555555] mt-1">
          {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
        </p>

        <a
          href="#"
          className="mt-3 w-full flex items-center justify-center gap-1.5 bg-white hover:bg-[#E5E5E5] text-black font-inter text-xs font-semibold py-2 rounded-sm transition-colors"
        >
          <Play size={12} className="fill-black" /> Watch Replay
        </a>
      </div>
    </div>
  )
}
