import { TrendingUp } from 'lucide-react'

const GYMS = [
  { rank: 1, name: 'Xtreme MMA Mumbai', city: 'Mumbai', members: 47, revenue: '₹47,000', cut: '₹14,100' },
  { rank: 2, name: 'Champion MMA Chennai', city: 'Chennai', members: 38, revenue: '₹38,000', cut: '₹11,400' },
  { rank: 3, name: 'Gracie Barra Delhi', city: 'Delhi', members: 32, revenue: '₹32,000', cut: '₹9,600' },
  { rank: 4, name: '10th Planet Bangalore', city: 'Bangalore', members: 28, revenue: '₹28,000', cut: '₹8,400' },
  { rank: 5, name: 'Combat Club Jammu', city: 'Jammu', members: 22, revenue: '₹22,000', cut: '₹6,600' },
]

export default function TopGymsTable() {
  return (
    <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="text-white font-bold text-sm">Top Gyms This Month</h3>
        <TrendingUp size={16} className="text-[#888888]" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['#', 'Gym', 'Members', 'Revenue', 'Your Cut (30%)'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#888888] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {GYMS.map(g => (
              <tr key={g.rank} className="hover:bg-white/2 transition-colors cursor-pointer">
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-black w-6 h-6 rounded-lg flex items-center justify-center
                    ${g.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : g.rank === 2 ? 'bg-white/10 text-white/60' : g.rank === 3 ? 'bg-orange-500/10 text-orange-400' : 'text-[#555]'}`}>
                    {g.rank}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="text-white font-semibold text-sm">{g.name}</div>
                  <div className="text-[#555] text-xs">{g.city}</div>
                </td>
                <td className="px-4 py-3.5 text-white font-medium">{g.members}</td>
                <td className="px-4 py-3.5 text-white font-medium">{g.revenue}</td>
                <td className="px-4 py-3.5 text-[#DC2626] font-bold">{g.cut}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
