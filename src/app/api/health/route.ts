import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Lightweight liveness/readiness check — verifies the app can actually
// reach the database, not just that the Next.js server process is up.
export async function GET() {
  const started = Date.now()
  try {
    const { error } = await adminClient().from('gyms').select('id', { head: true, count: 'exact' }).limit(1)
    if (error) throw error
    return NextResponse.json({ status: 'ok', db: 'ok', latency_ms: Date.now() - started })
  } catch (err) {
    return NextResponse.json(
      { status: 'error', db: 'unreachable', error: err instanceof Error ? err.message : 'unknown' },
      { status: 503 }
    )
  }
}
