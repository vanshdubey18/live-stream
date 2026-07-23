import { NextResponse } from 'next/server'

export async function GET() {
  throw new Error('[sentry-test] deliberate server-side test error')
  // eslint-disable-next-line no-unreachable
  return NextResponse.json({ ok: true })
}
