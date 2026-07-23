'use client'

import { useState } from 'react'

// Temporary — remove after confirming Sentry receives events.
export default function SentryTestPage() {
  const [serverResult, setServerResult] = useState('')

  return (
    <main style={{ background: '#141410', color: '#f0eadc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'sans-serif' }}>
      <h1>Sentry Test Page</h1>
      <p style={{ color: '#a29c8c' }}>Temporary — delete after confirming errors show up in Sentry.</p>

      <button
        onClick={() => { throw new Error('[sentry-test] deliberate client-side test error') }}
        style={{ background: '#b3402f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 4, cursor: 'pointer' }}
      >
        Trigger client-side error
      </button>

      <button
        onClick={async () => {
          const res = await fetch('/api/sentry-test')
          setServerResult(`Server responded: ${res.status}`)
        }}
        style={{ background: '#b3402f', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 4, cursor: 'pointer' }}
      >
        Trigger server-side error
      </button>

      {serverResult && <p>{serverResult}</p>}
    </main>
  )
}
