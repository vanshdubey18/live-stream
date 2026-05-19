import { ReactNode } from 'react'

interface AdminStatsCardProps {
  label: string
  value: string
  sub: string
  icon: ReactNode
  trend?: 'up' | 'down' | 'live' | 'neutral'
  highlight?: boolean
}

export default function AdminStatsCard({ label, value, sub, icon, trend = 'neutral', highlight = false }: AdminStatsCardProps) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : trend === 'live' ? 'text-[#DC2626]' : 'text-[#888888]'

  return (
    <div className={`bg-[#111111] border rounded-2xl p-5 flex flex-col gap-3 ${highlight ? 'border-[#DC2626]/30' : 'border-white/5'}`}>
      <div className="flex items-center justify-between">
        <span className="text-[#888888] text-xs font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${highlight ? 'bg-[#DC2626]/10' : 'bg-white/5'}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-2xl font-black tracking-tight ${highlight ? 'text-[#DC2626]' : 'text-white'}`}>{value}</div>
        <div className={`text-xs mt-1 ${trendColor}`}>{sub}</div>
      </div>
    </div>
  )
}
