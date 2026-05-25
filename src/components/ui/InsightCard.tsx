interface Props {
  title?: string
  body: string
}

export default function InsightCard({ title = "YOUR COACH SAYS", body }: Props) {
  return (
    <div className="border-l-4 border-[#C41E3A] bg-[#0d0d0d] border border-[#1f1f1f] pl-6 pr-6 py-6" style={{ borderLeftWidth: '4px', borderLeftColor: '#C41E3A' }}>
      <p className="font-inter text-[11px] text-[#888888] uppercase tracking-[4px] mb-3">{title}</p>
      <p className="font-inter text-base text-white leading-relaxed">{body}</p>
    </div>
  )
}
