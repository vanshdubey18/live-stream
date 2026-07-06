interface Props {
  title?: string
  body: string
}

export default function InsightCard({ title = "YOUR COACH SAYS", body }: Props) {
  return (
    <div className="border-l-4 border-[#b3402f] bg-[#1c1c16] border border-[#322f26] pl-6 pr-6 py-6" style={{ borderLeftWidth: '4px', borderLeftColor: '#b3402f' }}>
      <p className="font-mincho text-[11px] text-[#a29c8c] uppercase tracking-[4px] mb-3">{title}</p>
      <p className="font-mincho text-base text-[#f0eadc] leading-relaxed">{body}</p>
    </div>
  )
}
