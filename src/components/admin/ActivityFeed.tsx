const ACTIVITIES = [
  { text: 'New member signup: Karan Singh joined Xtreme MMA Mumbai', sub: 'Full MMA plan · ₹1,999/mo', time: '2 min ago', dot: 'bg-[#00D4AA]' },
  { text: 'Live stream started: Combat Club Jammu – Boxing', sub: '14 viewers watching', time: '18 min ago', dot: 'bg-[#FF3B3B]' },
  { text: 'Payment received: ₹1,499 from Priya Sharma', sub: 'Gracie Barra Delhi · Dual plan', time: '34 min ago', dot: 'bg-white' },
  { text: 'New gym application: Mat Lab Kolkata', sub: 'BJJ · Wrestling · Awaiting review', time: '1 hr ago', dot: 'bg-[#FFD60A]' },
  { text: 'Coupon redeemed: PILOT100 by Aman Verma', sub: '100% off · Xtreme MMA Mumbai', time: '2 hr ago', dot: 'bg-[#999999]' },
  { text: 'New member: Sneha Iyer joined Champion MMA Chennai', sub: 'Single discipline · ₹999/mo', time: '3 hr ago', dot: 'bg-[#00D4AA]' },
  { text: 'Payment received: ₹1,999 from Rohit Das', sub: '10th Planet Bangalore · Full MMA', time: '4 hr ago', dot: 'bg-white' },
  { text: 'Stream ended: Gracie Barra Delhi – BJJ Fundamentals', sub: '62 viewers · 58 min', time: '5 hr ago', dot: 'bg-[#FF3B3B]' },
]

export default function ActivityFeed() {
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#333333]">
        <span className="font-inter text-[11px] text-[#999999] tracking-[4px] uppercase">Recent Activity</span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {ACTIVITIES.map((a, i) => (
          <div key={i} className="flex items-start gap-3 px-5 border-b border-[#2A2A2A] py-3">
            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="font-inter text-sm text-white leading-snug">{a.text}</p>
              <p className="font-inter text-xs text-[#555555] mt-0.5">{a.sub}</p>
            </div>
            <span className="font-inter text-xs text-[#555555] shrink-0 mt-0.5">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
