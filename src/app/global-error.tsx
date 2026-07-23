'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

// Catches errors that escape every route-segment error.tsx (e.g. a crash in
// the root layout itself). Must render its own <html>/<body> — this
// replaces the entire page when it fires.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body style={{ background: '#141410', color: '#f0eadc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 12, letterSpacing: 4, color: '#7a7568', textTransform: 'uppercase', marginBottom: 8 }}>Error</p>
          <h1 style={{ fontSize: 28, marginBottom: 16 }}>Something went wrong</h1>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#b3402f', color: '#f0eadc', border: 'none', padding: '12px 24px', borderRadius: 4, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
