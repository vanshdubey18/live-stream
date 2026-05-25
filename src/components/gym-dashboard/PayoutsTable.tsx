import { CheckCircle, Clock, ExternalLink } from 'lucide-react'

const PAYOUTS = [
  { period: 'April 2026', members: 47, amount: '₹47,000', status: 'Paid' },
  { period: 'March 2026', members: 35, amount: '₹35,000', status: 'Paid' },
  { period: 'February 2026', members: 28, amount: '₹28,000', status: 'Paid' },
]

export default function PayoutsTable() {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {['Period', 'Members', 'Your Amount', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#999999] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {PAYOUTS.map(p => (
            <tr key={p.period} className="hover:bg-white/2 transition-colors">
              <td className="px-4 py-3.5 text-white font-medium">{p.period}</td>
              <td className="px-4 py-3.5 text-[#999999]">{p.members}</td>
              <td className="px-4 py-3.5 text-white font-bold">{p.amount}</td>
              <td className="px-4 py-3.5">
                {p.status === 'Paid' ? (
                  <span className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                    <CheckCircle size={13} /> Paid
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-semibold">
                    <Clock size={13} /> Pending
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-white/5">
        <a href="/gym-dashboard/revenue" className="flex items-center gap-1.5 text-[#999999] hover:text-white text-xs transition-colors">
          View all payouts <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
