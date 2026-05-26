'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DATA = [
  { day: 'May 1', total: 3200, platform: 960 },
  { day: 'May 3', total: 4100, platform: 1230 },
  { day: 'May 5', total: 3800, platform: 1140 },
  { day: 'May 7', total: 5200, platform: 1560 },
  { day: 'May 9', total: 4900, platform: 1470 },
  { day: 'May 11', total: 6100, platform: 1830 },
  { day: 'May 13', total: 5800, platform: 1740 },
  { day: 'May 15', total: 7200, platform: 2160 },
  { day: 'May 17', total: 6800, platform: 2040 },
  { day: 'May 19', total: 8100, platform: 2430 },
  { day: 'May 21', total: 7600, platform: 2280 },
  { day: 'May 23', total: 9200, platform: 2760 },
  { day: 'May 25', total: 8900, platform: 2670 },
  { day: 'May 27', total: 10500, platform: 3150 },
  { day: 'May 29', total: 11200, platform: 3360 },
]

function formatINR(v: number) {
  return `₹${(v / 1000).toFixed(1)}K`
}

export default function RevenueChart() {
  return (
    <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bebas text-2xl text-white tracking-[1px]">Revenue — Last 30 Days</h3>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-inter text-xs text-[#999999]">
            <span className="w-3 h-0.5 bg-[#FF3B3B] inline-block" /> Total Revenue
          </span>
          <span className="flex items-center gap-1.5 font-inter text-xs text-[#999999]">
            <span className="w-3 h-0.5 bg-[#00D4AA] inline-block" /> Platform Cut
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="day" tick={{ fill: '#555555', fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
          <YAxis tickFormatter={formatINR} tick={{ fill: '#555555', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333333', borderRadius: 2, fontSize: 12 }}
            labelStyle={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}
            formatter={(v) => [`₹${(v as number).toLocaleString('en-IN')}`]}
          />
          <Line type="monotone" dataKey="total" stroke="#FF3B3B" strokeWidth={2.5} dot={false} name="Total Revenue" />
          <Line type="monotone" dataKey="platform" stroke="#00D4AA" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Platform Cut" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
