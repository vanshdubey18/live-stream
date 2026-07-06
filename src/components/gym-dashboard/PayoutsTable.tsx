import { CheckCircle, Clock, ExternalLink } from 'lucide-react'

const PAYOUTS = [
  { period: 'April 2026', members: 47, amount: '₹47,000', status: 'Paid' },
  { period: 'March 2026', members: 35, amount: '₹35,000', status: 'Paid' },
  { period: 'February 2026', members: 28, amount: '₹28,000', status: 'Paid' },
]

export default function PayoutsTable() {
  return (
    <div className="bg-[#1c1c16] border border-[#2a2a20] rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2a20]">
            {['Period', 'Members', 'Your Amount', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-bold text-[#a29c8c] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#242420]">
          {PAYOUTS.map(p => (
            <tr key={p.period} className="hover:bg-[#242420] transition-colors">
              <td className="px-4 py-3.5 text-[#f0eadc] font-medium">{p.period}</td>
              <td className="px-4 py-3.5 text-[#a29c8c]">{p.members}</td>
              <td className="px-4 py-3.5 text-[#f0eadc] font-bold">{p.amount}</td>
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
      <div className="px-4 py-3 border-t border-[#2a2a20]">
        <a href="/gym-dashboard/revenue" className="flex items-center gap-1.5 text-[#a29c8c] hover:text-[#f0eadc] text-xs transition-colors">
          View all payouts <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
