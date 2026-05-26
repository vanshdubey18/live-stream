'use client'

import Link from 'next/link'

export default function GymDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-6">
      <div className="bg-[#111] border border-red-500/20 rounded-sm p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
        <p className="text-white/50 text-sm mb-6">
          We couldn&apos;t load your gym dashboard. Your data is safe — please try again.
        </p>
        {error.digest && (
          <p className="text-white/20 text-xs mb-6 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-sm transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-sm transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
