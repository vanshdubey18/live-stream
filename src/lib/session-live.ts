// No real class runs longer than this. Guards against a session getting stuck in
// status='live' forever (crashed browser mid-stream, dropped network, etc.) and
// showing as a phantom "LIVE NOW" to members indefinitely.
export const LIVE_STALE_MS = 3 * 60 * 60 * 1000

export function isSessionLive(session: { status: string; scheduled_at: string }) {
  if (session.status !== 'live') return false
  return Date.now() - new Date(session.scheduled_at).getTime() < LIVE_STALE_MS
}

export function staleLiveCutoffISO() {
  return new Date(Date.now() - LIVE_STALE_MS).toISOString()
}
