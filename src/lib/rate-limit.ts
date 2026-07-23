import { adminClient } from '@/lib/supabase/admin'

/**
 * Fixed-window rate limit backed by Postgres. Best-effort — a small race
 * window exists between the read and write (same tradeoff as
 * claimCouponUse in admin.ts), which is fine at this app's volume; move to
 * Upstash/Redis if this ever becomes a bottleneck or needs exactness.
 *
 * Returns true if the request is allowed, false if the caller is over limit.
 */
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const client = adminClient()
  const now = Date.now()

  const { data: row } = await client.from('rate_limits').select('window_start, count').eq('key', key).maybeSingle()

  if (!row || now - new Date(row.window_start).getTime() > windowSeconds * 1000) {
    await client.from('rate_limits').upsert({ key, window_start: new Date().toISOString(), count: 1 })
    return true
  }

  if (row.count >= limit) return false

  await client.from('rate_limits').update({ count: row.count + 1 }).eq('key', key)
  return true
}

/** Best-effort caller IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
