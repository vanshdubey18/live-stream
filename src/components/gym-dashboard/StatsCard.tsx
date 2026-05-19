import { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: string
  sub: string
  icon: ReactNode
  accent?: boolean
}

export default function StatsCard({ label, value, sub, icon, accent = false }: StatsCardProps) {
  return (
    <div className={`bg-[#111111] border rounded-2xl p-6 flex flex-col gap-3 ${accent ? 'border-[#DC2626]/30' : 'border-white/5'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[#888888] text-sm font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? 'bg-[#DC2626]/10' : 'bg-white/5'}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-3xl font-black tracking-tight ${accent ? 'text-[#DC2626]' : 'text-white'}`}>{value}</div>
        <div className="text-[#888888] text-xs mt-1">{sub}</div>
      </div>
    </div>
  )
}
