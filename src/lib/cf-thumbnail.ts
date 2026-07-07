/** Cloudflare Stream auto-generates a poster frame per video — no extra encode step needed. */
export function cfThumbnailUrl(uid: string | null | undefined, height = 400): string | null {
  if (!uid) return null
  const subdomain = process.env.NEXT_PUBLIC_CF_CUSTOMER_SUBDOMAIN
  if (!subdomain) return null
  return `https://customer-${subdomain}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg?time=2s&height=${height}`
}
