function pad(n: number) { return String(n).padStart(2, '0') }

// Countdown to a scheduled class: "Xh Ym" while far out, a live ticking
// MM:SS once under an hour away, or "Starting now" once past start time.
export function formatCountdown(scheduledAt: string, nowMs: number) {
  const diffMs = new Date(scheduledAt).getTime() - nowMs
  if (diffMs <= 0) return 'Starting now'
  const totalSeconds = Math.floor(diffMs / 1000)
  if (totalSeconds >= 3600) {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.round((totalSeconds % 3600) / 60)
    return `${hrs}h ${mins}m`
  }
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${pad(mins)}:${pad(secs)}`
}
