import { Calendar, ChevronRight } from 'lucide-react'

interface GymCardProps {
  name: string
  disciplines: string[]
  nextClass: string
  nextClassTime: string
  city: string
}

export default function GymCard({
  name,
  disciplines,
  nextClass,
  nextClassTime,
  city,
}: GymCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm p-6 hover:border-[#333333] transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div>
        <h3 className="font-bebas text-2xl text-white leading-tight">{name}</h3>
        <p className="font-inter text-sm text-[#999999] mt-0.5">{city}</p>
      </div>

      {/* Disciplines */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {disciplines.map((d) => (
          <span
            key={d}
            className="font-inter text-[10px] text-[#555555] tracking-[2px] uppercase"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Next class */}
      <div className="flex items-center gap-2 bg-[#0D0D0D] rounded-sm px-4 py-3">
        <Calendar size={14} className="text-[#FF3B3B] shrink-0" />
        <div className="min-w-0">
          <p className="text-white text-xs font-medium truncate">{nextClass}</p>
          <p className="text-[#999999] text-xs">{nextClassTime}</p>
        </div>
      </div>

      {/* CTA */}
      <a
        href="#"
        className="flex items-center justify-center gap-1.5 border border-[#333333] hover:bg-[#222222] text-white text-sm font-semibold py-2.5 rounded-sm transition-all duration-200"
      >
        View Schedule <ChevronRight size={14} />
      </a>
    </div>
  )
}
