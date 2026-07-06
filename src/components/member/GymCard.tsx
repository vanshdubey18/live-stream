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
    <div className="bg-[#1c1c16] border border-[#2a2a20] rounded-sm p-6 hover:border-[#322f26] transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div>
        <h3 className="font-mincho text-2xl text-[#f0eadc] leading-tight">{name}</h3>
        <p className="font-mincho text-sm text-[#a29c8c] mt-0.5">{city}</p>
      </div>

      {/* Disciplines */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {disciplines.map((d) => (
          <span
            key={d}
            className="font-mincho text-[10px] text-[#7a7568] tracking-[2px] uppercase"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Next class */}
      <div className="flex items-center gap-2 bg-[#141410] rounded-sm px-4 py-3">
        <Calendar size={14} className="text-[#b3402f] shrink-0" />
        <div className="min-w-0">
          <p className="text-[#f0eadc] text-xs font-medium truncate">{nextClass}</p>
          <p className="text-[#a29c8c] text-xs">{nextClassTime}</p>
        </div>
      </div>

      {/* CTA */}
      <a
        href="#"
        className="flex items-center justify-center gap-1.5 border border-[#322f26] hover:bg-[#242420] text-[#f0eadc] text-sm font-semibold py-2.5 rounded-sm transition-all duration-200"
      >
        View Schedule <ChevronRight size={14} />
      </a>
    </div>
  )
}
