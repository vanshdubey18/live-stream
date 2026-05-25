interface Props {
  number: string
  label: string
  sublabel?: string
  accent?: boolean
}

export default function StatCard({ number, label, sublabel, accent }: Props) {
  return (
    <div className="bg-[#0d0d0d] border border-[#1f1f1f] p-6">
      <div className={`font-bebas text-5xl leading-none tracking-[1px] ${accent ? 'text-[#C41E3A]' : 'text-white'}`}>
        {number}
      </div>
      <div className="font-inter text-[11px] text-[#888888] uppercase tracking-[4px] mt-2">{label}</div>
      {sublabel && (
        <div className="font-inter text-xs text-[#555555] mt-1">{sublabel}</div>
      )}
    </div>
  )
}
