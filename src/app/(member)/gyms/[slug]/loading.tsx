export default function GymDetailLoading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Cover banner */}
      <div className="w-full h-48 sm:h-64 bg-[#1A1A1A] border-b border-[#333333] animate-pulse" />

      <div className="max-w-[1280px] mx-auto px-6">
        {/* Gym header */}
        <div className="-mt-10 flex items-end gap-4">
          <div className="w-20 h-20 bg-[#222222] border border-[#333333] rounded-sm animate-pulse shrink-0" />
          <div className="flex-1 space-y-2 pb-1">
            <div className="h-9 w-1/2 max-w-sm bg-[#222222] rounded-sm animate-pulse" />
            <div className="h-4 w-1/3 max-w-xs bg-[#1A1A1A] rounded-sm animate-pulse" />
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#333333]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#1A1A1A] p-6">
              <div className="h-3 w-20 bg-[#222222] rounded-sm animate-pulse mb-3" />
              <div className="h-8 w-16 bg-[#222222] rounded-sm animate-pulse" />
            </div>
          ))}
        </div>

        {/* Sessions list */}
        <div className="mt-10 space-y-3">
          <div className="h-3 w-32 bg-[#222222] rounded-sm animate-pulse mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-[#1A1A1A] border border-[#333333] rounded-sm animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
