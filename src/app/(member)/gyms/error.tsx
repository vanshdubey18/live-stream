'use client'

import Link from 'next/link'

export default function GymsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6">
      <div className="bg-[#1A1A1A] border border-[#333333] rounded-sm p-8 max-w-md w-full text-center">
        <p className="font-inter text-[11px] text-[#FF3B3B] tracking-[4px] uppercase mb-4">Error</p>
        <h2 className="font-bebas text-3xl text-white tracking-[1px] mb-2">COULDN&apos;T LOAD GYMS</h2>
        <p className="font-inter text-[#999999] text-sm mb-6">
          Check your connection and try again.
        </p>
        {error.digest && (
          <p className="font-mono text-[#555555] text-xs mb-6">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-white hover:bg-[#E5E5E5] text-black font-bebas tracking-[2px] text-sm rounded-sm transition-colors"
          >
            TRY AGAIN
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-[#1A1A1A] border border-[#333333] hover:bg-[#222222] text-white font-inter text-sm rounded-sm transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
