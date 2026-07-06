export default function GymsLoading() {
  return (
    <div className="min-h-screen bg-[#141410] lg:ml-64 p-6">
      <div className="h-10 w-full max-w-md bg-[#1c1c16] border border-[#322f26] rounded-sm animate-pulse mb-6" />

      <div className="flex gap-6 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 bg-[#242420] rounded-sm animate-pulse" style={{ width: `${40 + (i % 3) * 16}px` }} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-5">
            <div className="h-4 w-3/4 bg-[#242420] rounded-sm animate-pulse mb-2" />
            <div className="h-3 w-1/2 bg-[#242420] rounded-sm animate-pulse mb-4" />
            <div className="h-3 w-full bg-[#242420] rounded-sm animate-pulse mb-4" />
            <div className="flex gap-4">
              <div className="h-8 w-16 bg-[#242420] rounded-sm animate-pulse" />
              <div className="h-8 w-16 bg-[#242420] rounded-sm animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
