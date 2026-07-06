import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Inter, Shippori_Mincho } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/layout/PageTransition'
import SearchProvider from '@/components/search/SearchProvider'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const shippori = Shippori_Mincho({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mincho',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#141410',
}

export const metadata: Metadata = {
  title: 'MATPEAK — Train with the best',
  description: 'Watch live MMA, boxing, and combat sports from top gyms across India.',
  keywords: ['combat sports', 'MMA', 'boxing', 'live streaming', 'gym', 'training'],
  openGraph: {
    title: 'MATPEAK — Train with the best',
    description: 'Watch live MMA, boxing, and combat sports from top gyms across India.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${inter.variable} ${shippori.variable} font-inter antialiased bg-[#141410] text-[#f0eadc]`}>
        <SearchProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </SearchProvider>
      </body>
    </html>
  )
}
