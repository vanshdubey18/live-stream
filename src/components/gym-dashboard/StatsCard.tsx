interface StatsCardProps {
  label: string
  value: string
  sub?: string
  href?: string
}

export default function StatsCard({ label, value, sub, href }: StatsCardProps) {
  const inner = (
    <>
      <span className="font-mincho text-[11px] text-[#a29c8c] tracking-[4px] uppercase">{label}</span>
      <span className="font-mincho text-4xl text-[#f0eadc] tracking-[1px] leading-none">{value}</span>
      {sub && <span className="font-mincho text-[11px] text-[#7a7568]">{sub}</span>}
    </>
  )
  if (href) {
    return (
      <a href={href} className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 flex flex-col gap-2 hover:bg-[#242420] hover:border-[#7a7568] transition-colors group">
        {inner}
      </a>
    )
  }
  return (
    <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6 flex flex-col gap-2 hover:bg-[#242420] transition-colors">
      {inner}
    </div>
  )
}
