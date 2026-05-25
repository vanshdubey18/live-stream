export default function GymsLoading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6">
      {/* Search bar skeleton */}
      <div className="h-11 w-full max-w-lg bg-[#222222] rounded-xl animate-pulse mb-6" />

      {/* Discipline pills */}
      <div className="flex gap-2 flex-wrap mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-8 bg-[#222222] rounded-full animate-pulse"
            style={{ width: `${60 + (i % 3) * 20}px` }}
          />
        ))}
      </div>

      {/* Gym cards — 3-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
            <div className="h-44 bg-[#222222] animate-pulse" />
            <div className="p-4">
              <div className="h-5 w-3/4 bg-[#222222] rounded animate-pulse mb-2" />
              <div className="h-3 w-1/2 bg-[#222222] rounded animate-pulse mb-3" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-[#222222] rounded-full animate-pulse" />
                <div className="h-6 w-16 bg-[#222222] rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
