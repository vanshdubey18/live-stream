export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#141410] lg:ml-64">
      {/* Hero */}
      <div className="max-w-[1280px] mx-auto px-6 py-10 flex items-center justify-between gap-10">
        <div className="flex-1">
          <div className="h-3 w-32 bg-[#242420] rounded-sm animate-pulse mb-5" />
          <div className="h-20 w-24 bg-[#242420] rounded-sm animate-pulse mb-4" />
          <div className="h-3 w-48 bg-[#1c1c16] rounded-sm animate-pulse" />
        </div>
        <div className="hidden lg:block w-[180px] h-[180px] rounded-full bg-[#1c1c16] animate-pulse shrink-0" />
      </div>

      {/* Stats row */}
      <div className="border-t border-b border-[#322f26]">
        <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 bg-[#242420] rounded-sm animate-pulse mb-3" />
              <div className="h-10 w-14 bg-[#1c1c16] rounded-sm animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Feed + rail */}
      <div className="max-w-[1280px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <div className="h-3 w-40 bg-[#242420] rounded-sm animate-pulse mb-5" />
            <div className="h-48 w-full bg-[#1c1c16] border border-[#322f26] rounded-sm animate-pulse" />
          </div>
          <div>
            <div className="h-3 w-32 bg-[#242420] rounded-sm animate-pulse mb-5" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-[#322f26] rounded-sm overflow-hidden">
                  <div className="h-32 bg-[#1c1c16] animate-pulse" />
                  <div className="p-4">
                    <div className="h-4 w-3/4 bg-[#242420] rounded-sm animate-pulse mb-2" />
                    <div className="h-3 w-1/2 bg-[#1c1c16] rounded-sm animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="h-3 w-24 bg-[#242420] rounded-sm animate-pulse mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 w-full bg-[#1c1c16] border border-[#322f26] rounded-sm animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
