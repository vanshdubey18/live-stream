import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import PageTransition from '@/components/layout/PageTransition'
import SearchProvider from '@/components/search/SearchProvider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

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
      <body className={`${geistSans.variable} antialiased bg-[#0a0a0a] text-white`}>
        <SearchProvider>
          <PageTransition>
            {children}
          </PageTransition>
        </SearchProvider>
      </body>
    </html>
  )
}
