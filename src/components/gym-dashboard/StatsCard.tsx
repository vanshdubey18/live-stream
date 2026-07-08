import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string
  sub?: string
  href?: string
  icon?: LucideIcon
}

export default function StatsCard({ label, value, sub, href, icon: Icon }: StatsCardProps) {
  const inner = (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="font-mincho text-[10px] text-[#a29c8c] uppercase tracking-[3px]">{label}</p>
        {Icon && (
          <span className="w-8 h-8 rounded-full border border-[#322f26] bg-[#242420] flex items-center justify-center text-[#a29c8c] group-hover:text-[#f0eadc] group-hover:border-[#b3402f]/40 group-hover:bg-[#2a2a20] transition-colors duration-150 shrink-0">
            <Icon size={14} />
          </span>
        )}
      </div>
      <span className="block font-mincho text-4xl text-[#f0eadc] tracking-[1px] leading-none mb-3">{value}</span>
      {sub && <span className="block font-mincho text-[11px] text-[#7a7568]">{sub}</span>}
    </>
  )
  if (href) {
    return (
      <a href={href} className="group block border border-[#322f26] rounded-sm bg-[#1c1c16] hover:bg-[#201f19] hover:border-[#3a3630] transition-colors duration-150 p-5">
        {inner}
      </a>
    )
  }
  return (
    <div className="border border-[#322f26] rounded-sm bg-[#1c1c16] p-5">
      {inner}
    </div>
  )
}
