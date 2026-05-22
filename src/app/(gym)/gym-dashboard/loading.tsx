export default function GymDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#111] border border-white/5 rounded-xl p-5">
            <div className="h-4 w-24 bg-[#1a1a1a] rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-[#1a1a1a] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex gap-4 px-5 py-3 border-b border-white/5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 w-24 bg-[#1a1a1a] rounded animate-pulse" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center px-5 py-4 border-b border-white/5 last:border-0">
            <div className="h-8 w-8 bg-[#1a1a1a] rounded-full animate-pulse shrink-0" />
            <div className="h-4 w-32 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-4 w-20 bg-[#1a1a1a] rounded animate-pulse ml-auto" />
            <div className="h-6 w-16 bg-[#1a1a1a] rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
