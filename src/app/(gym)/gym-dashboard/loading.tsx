export default function GymDashboardLoading() {
  return (
    <div className="min-h-screen bg-[#141410] lg:ml-64 p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-6">
            <div className="h-3 w-24 bg-[#242420] rounded-sm animate-pulse mb-4" />
            <div className="h-10 w-16 bg-[#242420] rounded-sm animate-pulse" />
          </div>
        ))}
      </div>

      <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm overflow-hidden">
        <div className="flex gap-6 px-5 py-4 border-b border-[#322f26]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-3 w-24 bg-[#242420] rounded-sm animate-pulse" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center px-5 py-4 border-b border-[#242420] last:border-0">
            <div className="h-8 w-8 bg-[#242420] rounded-sm animate-pulse shrink-0" />
            <div className="h-4 w-32 bg-[#242420] rounded-sm animate-pulse" />
            <div className="h-4 w-20 bg-[#242420] rounded-sm animate-pulse ml-auto" />
            <div className="h-4 w-16 bg-[#242420] rounded-sm animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
