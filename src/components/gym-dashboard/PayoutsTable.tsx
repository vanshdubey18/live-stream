import { CheckCircle, Clock, ExternalLink } from 'lucide-react'

const PAYOUTS = [
  { period: 'April 2026', members: 47, amount: '₹47,000', status: 'Paid' },
  { period: 'March 2026', members: 35, amount: '₹35,000', status: 'Paid' },
  { period: 'February 2026', members: 28, amount: '₹28,000', status: 'Paid' },
]

export default function PayoutsTable() {
  return (
    <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2A2A2A]">
            {['Period', 'Members', 'Your Amount', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#999999] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F1F1F]">
          {PAYOUTS.map(p => (
            <tr key={p.period} className="hover:bg-[#1F1F1F] transition-colors">
              <td className="px-4 py-3.5 text-white font-medium">{p.period}</td>
              <td className="px-4 py-3.5 text-[#999999]">{p.members}</td>
              <td className="px-4 py-3.5 text-white font-bold">{p.amount}</td>
              <td className="px-4 py-3.5">
                {p.status === 'Paid' ? (
                  <span className="flex items-center gap-1.5 text-[#00D4AA] text-xs font-semibold">
                    <CheckCircle size={13} /> Paid
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#FFD60A] text-xs font-semibold">
                    <Clock size={13} /> Pending
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-3 border-t border-[#2A2A2A]">
        <a href="/gym-dashboard/revenue" className="flex items-center gap-1.5 text-[#999999] hover:text-white text-xs transition-colors">
          View all payouts <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
