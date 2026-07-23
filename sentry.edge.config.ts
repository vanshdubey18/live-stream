import * as Sentry from '@sentry/nextjs'

// Covers src/middleware.ts, which runs on the Edge runtime and is
// otherwise invisible to sentry.server.config.ts (Node runtime only).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
})
