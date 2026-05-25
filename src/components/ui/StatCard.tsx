interface Props {
  number: string
  label: string
  sublabel?: string
  accent?: boolean
}

export default function StatCard({ number, label, sublabel, accent }: Props) {
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] p-6">
      <div className={`font-bebas text-5xl leading-none tracking-[1px] ${accent ? 'text-[#FF3B3B]' : 'text-white'}`}>
        {number}
      </div>
      <div className="font-inter text-[11px] text-[#999999] uppercase tracking-[4px] mt-2">{label}</div>
      {sublabel && (
        <div className="font-inter text-xs text-[#555555] mt-1">{sublabel}</div>
      )}
    </div>
  )
}
