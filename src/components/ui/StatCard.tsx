interface Props {
  number: string
  label: string
  sublabel?: string
  accent?: boolean
}

export default function StatCard({ number, label, sublabel, accent }: Props) {
  return (
    <div className="bg-[#1c1c16] border border-[#322f26] p-6">
      <div className={`font-mincho text-5xl leading-none tracking-[1px] ${accent ? 'text-[#b3402f]' : 'text-[#f0eadc]'}`}>
        {number}
      </div>
      <div className="font-mincho text-[11px] text-[#a29c8c] uppercase tracking-[4px] mt-2">{label}</div>
      {sublabel && (
        <div className="font-mincho text-xs text-[#7a7568] mt-1">{sublabel}</div>
      )}
    </div>
  )
}
