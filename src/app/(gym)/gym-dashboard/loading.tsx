export default function GymDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] lg:ml-64 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6">
            <div className="h-3 w-24 bg-[#222222] rounded-sm animate-pulse mb-4" />
            <div className="h-10 w-16 bg-[#222222] rounded-sm animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
        <div className="flex gap-6 px-5 py-4 border-b border-[#333333]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 w-24 bg-[#222222] rounded-sm animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center px-5 py-4 border-b border-[#1F1F1F] last:border-0">
            <div className="h-8 w-8 bg-[#222222] rounded-sm animate-pulse shrink-0" />
            <div className="h-4 w-32 bg-[#222222] rounded-sm animate-pulse" />
            <div className="h-4 w-20 bg-[#222222] rounded-sm animate-pulse ml-auto" />
            <div className="h-4 w-16 bg-[#222222] rounded-sm animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
