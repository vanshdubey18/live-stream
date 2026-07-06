'use client'

import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#141410] flex items-center justify-center p-6">
      <div className="bg-[#1c1c16] border border-[#322f26] rounded-sm p-8 max-w-md w-full text-center">
        <p className="font-mincho text-[11px] text-[#b3402f] tracking-[4px] uppercase mb-4">Error</p>
        <h2 className="font-mincho text-3xl text-[#f0eadc] tracking-[1px] mb-2">SOMETHING WENT WRONG</h2>
        <p className="font-mincho text-[#a29c8c] text-sm mb-6">
          We couldn&apos;t load your dashboard. This is usually temporary — give it another shot.
        </p>
        {error.digest && (
          <p className="font-mono text-[#7a7568] text-xs mb-6">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-[#f0eadc] hover:bg-[#e4dcc8] text-[#141410] font-mincho tracking-[2px] text-sm rounded-sm transition-colors"
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-[#1c1c16] border border-[#322f26] hover:bg-[#242420] text-[#f0eadc] font-mincho text-sm rounded-sm transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
