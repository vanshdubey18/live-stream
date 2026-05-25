interface StatsCardProps {
  label: string
  value: string
  sub?: string
  icon?: React.ReactNode
  accent?: boolean
}

export default function StatsCard({ label, value, sub }: StatsCardProps) {
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6 flex flex-col gap-2 hover:bg-[#222222] transition-colors">
      <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">{label}</span>
      <span className="font-bebas text-4xl text-white tracking-[1px] leading-none">{value}</span>
      {sub && <span className="font-inter text-[11px] text-[#555555]">{sub}</span>}
    </div>
  )
}
