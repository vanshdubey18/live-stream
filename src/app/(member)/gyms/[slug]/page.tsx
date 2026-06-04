import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getGymBySlug, getGymCoaches, getGymSessions, getGymMemberCount, getMembershipForGym } from '@/lib/supabase/queries'
import GymDetailClient from './GymDetailClient'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const gym = await getGymBySlug(params.slug)
  if (!gym) return {}

  const disciplines = (gym.disciplines ?? []).join(', ')
  const location = [gym.city, gym.location].filter(Boolean).join(', ')
  const title = `${gym.name} — Live Classes & Replays on Matpeak`
  const description = gym.description
    ?? `Train with ${gym.name}${location ? ` in ${location}` : ''}. Watch live ${disciplines || 'martial arts'} classes and replays online. Join now on Matpeak.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Matpeak',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function GymDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const gym = await getGymBySlug(params.slug)
  if (!gym) notFound()

  const [gymCoaches, gymSessions, memberCount, membership] = await Promise.all([
    getGymCoaches(gym.id),
    getGymSessions(gym.id),
    getGymMemberCount(gym.id),
    user ? getMembershipForGym(user.id, gym.id) : Promise.resolve(null),
  ])

  // JSON-LD structured data for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsClub',
    name: gym.name,
    description: gym.description ?? undefined,
    address: gym.city ? {
      '@type': 'PostalAddress',
      addressLocality: gym.city,
      addressRegion: gym.location ?? undefined,
    } : undefined,
    sport: (gym.disciplines ?? []).join(', ') || 'Martial Arts',
    url: `https://matpeak.com/gyms/${gym.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GymDetailClient
        gym={gym}
        coaches={gymCoaches}
        sessions={gymSessions}
        memberCount={memberCount}
        membership={membership}
        isLoggedIn={!!user}
      />
    </>
  )
}

