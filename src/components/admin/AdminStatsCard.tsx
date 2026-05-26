import { ReactNode } from 'react'

interface AdminStatsCardProps {
  label: string
  value: string
  sub: string
  icon: ReactNode
  trend?: 'up' | 'down' | 'live' | 'neutral'
  highlight?: boolean
}

export default function AdminStatsCard({ label, value, sub, trend = 'neutral' }: AdminStatsCardProps) {
  const trendColor = trend === 'up' ? 'text-[#00D4AA]' : trend === 'down' ? 'text-[#FF3B3B]' : trend === 'live' ? 'text-[#FF3B3B]' : 'text-[#999999]'

  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 flex flex-col gap-3">
      <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">{label}</span>
      <div>
        <div className="font-bebas text-5xl text-white tracking-[1px]">{value}</div>
        <div className={`font-inter text-xs mt-1 ${trendColor}`}>{sub}</div>
      </div>
    </div>
  )
}
