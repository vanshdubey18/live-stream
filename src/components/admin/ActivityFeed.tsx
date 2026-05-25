import { UserPlus, Radio, CreditCard, Building2, Ticket } from 'lucide-react'

const ACTIVITIES = [
  { icon: <UserPlus size={14} className="text-green-400" />, text: 'New member signup: Karan Singh joined Xtreme MMA Mumbai', sub: 'Full MMA plan · ₹1,999/mo', time: '2 min ago', dot: 'bg-green-400' },
  { icon: <Radio size={14} className="text-[#FF3B3B]" />, text: 'Live stream started: Combat Club Jammu – Boxing', sub: '14 viewers watching', time: '18 min ago', dot: 'bg-[#FF3B3B]' },
  { icon: <CreditCard size={14} className="text-blue-400" />, text: 'Payment received: ₹1,499 from Priya Sharma', sub: 'Gracie Barra Delhi · Dual plan', time: '34 min ago', dot: 'bg-blue-400' },
  { icon: <Building2 size={14} className="text-yellow-400" />, text: 'New gym application: Mat Lab Kolkata', sub: 'BJJ · Wrestling · Awaiting review', time: '1 hr ago', dot: 'bg-yellow-400' },
  { icon: <Ticket size={14} className="text-purple-400" />, text: 'Coupon redeemed: PILOT100 by Aman Verma', sub: '100% off · Xtreme MMA Mumbai', time: '2 hr ago', dot: 'bg-purple-400' },
  { icon: <UserPlus size={14} className="text-green-400" />, text: 'New member: Sneha Iyer joined Champion MMA Chennai', sub: 'Single discipline · ₹999/mo', time: '3 hr ago', dot: 'bg-green-400' },
  { icon: <CreditCard size={14} className="text-blue-400" />, text: 'Payment received: ₹1,999 from Rohit Das', sub: '10th Planet Bangalore · Full MMA', time: '4 hr ago', dot: 'bg-blue-400' },
  { icon: <Radio size={14} className="text-[#FF3B3B]" />, text: 'Stream ended: Gracie Barra Delhi – BJJ Fundamentals', sub: '62 viewers · 58 min', time: '5 hr ago', dot: 'bg-[#FF3B3B]' },
]

export default function ActivityFeed() {
  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="text-white font-bold text-sm">Recent Activity</h3>
      </div>
      <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
        {ACTIVITIES.map((a, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/2 transition-colors">
            <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${a.dot}`} />
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium leading-snug">{a.text}</p>
              <p className="text-[#555] text-xs mt-0.5">{a.sub}</p>
            </div>
            <span className="text-[#555] text-xs shrink-0 mt-0.5">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
