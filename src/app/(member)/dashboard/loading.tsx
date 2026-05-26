export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] lg:ml-64 p-6">
      <div className="h-8 w-48 bg-[#222222] rounded-sm animate-pulse mb-8" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-6">
            <div className="h-3 w-24 bg-[#222222] rounded-sm animate-pulse mb-4" />
            <div className="h-10 w-16 bg-[#222222] rounded-sm animate-pulse" />
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="h-3 w-36 bg-[#222222] rounded-sm animate-pulse mb-4" />
        <div className="h-28 w-full bg-[#1A1A1A] border border-[#333333] rounded-sm animate-pulse" />
      </div>

      <div>
        <div className="h-3 w-32 bg-[#222222] rounded-sm animate-pulse mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1A1A1A] border border-[#333333] rounded-sm overflow-hidden">
              <div className="h-36 bg-[#222222] animate-pulse" />
              <div className="p-4">
                <div className="h-4 w-3/4 bg-[#222222] rounded-sm animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-[#222222] rounded-sm animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
