export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-8 w-48 bg-[#1a1a1a] rounded animate-pulse" />
        <div className="h-10 w-10 bg-[#1a1a1a] rounded-full animate-pulse" />
      </div>

      {/* Stats cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#111] border border-white/5 rounded-xl p-5">
            <div className="h-4 w-24 bg-[#1a1a1a] rounded animate-pulse mb-3" />
            <div className="h-8 w-16 bg-[#1a1a1a] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Happening Now */}
      <div className="mb-8">
        <div className="h-5 w-36 bg-[#1a1a1a] rounded animate-pulse mb-4" />
        <div className="h-28 w-full bg-[#1a1a1a] rounded-xl animate-pulse" />
      </div>

      {/* Recommended — 4 cards in a row */}
      <div>
        <div className="h-5 w-32 bg-[#1a1a1a] rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
              <div className="h-36 bg-[#1a1a1a] animate-pulse" />
              <div className="p-3">
                <div className="h-4 w-3/4 bg-[#1a1a1a] rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
