export default function WatchLoading() {
  return (
    <div className="min-h-screen bg-[#141410] px-4 sm:px-6 py-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Video player placeholder (16:9) */}
        <div className="w-full aspect-video bg-[#1c1c16] border border-[#322f26] rounded-sm animate-pulse" />

        {/* Title + meta */}
        <div className="mt-6 space-y-3">
          <div className="h-8 w-2/3 max-w-md bg-[#242420] rounded-sm animate-pulse" />
          <div className="h-4 w-1/3 max-w-xs bg-[#1c1c16] rounded-sm animate-pulse" />
        </div>

        {/* Detail row */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#322f26]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1c1c16] p-5">
              <div className="h-3 w-16 bg-[#242420] rounded-sm animate-pulse mb-3" />
              <div className="h-6 w-20 bg-[#242420] rounded-sm animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
