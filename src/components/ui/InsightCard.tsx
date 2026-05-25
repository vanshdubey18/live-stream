interface Props {
  title?: string
  body: string
}

export default function InsightCard({ title = "YOUR COACH SAYS", body }: Props) {
  return (
    <div className="border-l-4 border-[#FF3B3B] bg-[#1A1A1A] border border-[#333333] pl-6 pr-6 py-6" style={{ borderLeftWidth: '4px', borderLeftColor: '#FF3B3B' }}>
      <p className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px] mb-3">{title}</p>
      <p className="font-inter text-base text-white leading-relaxed">{body}</p>
    </div>
  )
}
