import { Calendar, ChevronRight } from 'lucide-react'

interface GymCardProps {
  name: string
  plan: 'Single' | 'Dual' | 'Full MMA'
  disciplines: string[]
  nextClass: string
  nextClassTime: string
  city: string
}

const planColors = {
  Single: 'bg-[#1A1A1A] text-white/60 border-[#333333]',
  Dual: 'bg-[#1A1A1A] text-[#999999] border-blue-500/20',
  'Full MMA': 'bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/20',
}

export default function GymCard({
  name,
  plan,
  disciplines,
  nextClass,
  nextClassTime,
  city,
}: GymCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm p-6 hover:border-[#333333] transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bebas text-2xl text-white leading-tight">{name}</h3>
          <p className="font-inter text-sm text-[#999999] mt-0.5">{city}</p>
        </div>
        <span className={`font-inter text-[10px] tracking-[2px] uppercase px-2 py-1 rounded-sm border ${planColors[plan]}`}>
          {plan}
        </span>
      </div>

      {/* Disciplines */}
      <div className="flex flex-wrap gap-1.5">
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
        className="flex items-center justify-center gap-1.5 border border-[#333333] hover:border-[#333333] hover:bg-[#1A1A1A] text-white text-sm font-semibold py-2.5 rounded-sm transition-all duration-200"
      >
        View Schedule <ChevronRight size={14} />
      </a>
    </div>
  )
}
