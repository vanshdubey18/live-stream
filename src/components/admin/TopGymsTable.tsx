const GYMS = [
  { rank: 1, name: 'Xtreme MMA Mumbai', city: 'Mumbai', members: 47, revenue: '₹47,000', cut: '₹14,100' },
  { rank: 2, name: 'Champion MMA Chennai', city: 'Chennai', members: 38, revenue: '₹38,000', cut: '₹11,400' },
  { rank: 3, name: 'Gracie Barra Delhi', city: 'Delhi', members: 32, revenue: '₹32,000', cut: '₹9,600' },
  { rank: 4, name: '10th Planet Bangalore', city: 'Bangalore', members: 28, revenue: '₹28,000', cut: '₹8,400' },
  { rank: 5, name: 'Combat Club Jammu', city: 'Jammu', members: 22, revenue: '₹22,000', cut: '₹6,600' },
]

export default function TopGymsTable() {
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#333333]">
        <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Top Gyms This Month</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#333333]">
              {['#', 'Gym', 'Members', 'Revenue', 'Your Cut (30%)'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GYMS.map(g => (
              <tr key={g.rank} className="border-b border-[#2A2A2A] hover:bg-[#222222] transition-colors cursor-pointer">
                <td className="px-4 py-3.5">
                  <span className="font-inter text-sm text-[#555555]">{g.rank}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-bebas text-lg text-white tracking-[1px]">{g.name}</div>
                  <div className="font-inter text-xs text-[#555555]">{g.city}</div>
                </td>
                <td className="px-4 py-3.5 font-inter text-sm text-[#999999]">{g.members}</td>
                <td className="px-4 py-3.5 font-inter text-sm text-[#999999]">{g.revenue}</td>
                <td className="px-4 py-3.5 font-inter text-sm text-[#999999]">{g.cut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
