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
  Single: 'bg-white/5 text-white/60 border-white/10',
  Dual: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Full MMA': 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20',
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
    <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="w-10 h-10 rounded-xl bg-[#DC2626]/20 flex items-center justify-center mb-3">
            <span className="text-[#DC2626] font-black text-sm">{name[0]}</span>
          </div>
          <h3 className="text-white font-bold text-base leading-tight">{name}</h3>
          <p className="text-[#888888] text-xs mt-0.5">{city}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${planColors[plan]}`}>
          {plan}
        </span>
      </div>

      {/* Disciplines */}
      <div className="flex flex-wrap gap-1.5">
        {disciplines.map((d) => (
          <span
            key={d}
            className="text-xs text-[#888888] bg-white/5 px-2.5 py-1 rounded-full"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Next class */}
      <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-xl px-4 py-3">
        <Calendar size={14} className="text-[#DC2626] shrink-0" />
        <div className="min-w-0">
          <p className="text-white text-xs font-medium truncate">{nextClass}</p>
          <p className="text-[#888888] text-xs">{nextClassTime}</p>
        </div>
      </div>

      {/* CTA */}
      <a
        href="#"
        className="flex items-center justify-center gap-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200"
      >
        View Schedule <ChevronRight size={14} />
      </a>
    </div>
  )
}
