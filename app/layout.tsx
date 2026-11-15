import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { ScrollAnimationProvider } from '@/components/common/ScrollAnimationProvider'
import { BrandLoader } from '@/components/common/BrandLoader'
import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://velavancatering.com'),
  title: 'Velavan Catering Services | Grand Feasts, Timeless Hospitality',
  description: 'Velavan Catering Services — grand wedding feasts, traditional South Indian banana leaf virundhu, modern buffets, and memorable hospitality for celebrations of every scale.',
  keywords: [
    'Velavan Catering',
    'Coimbatore Catering Services',
    'South Indian Wedding Caterers',
    'Muhurtham Feast',
    'Banana Leaf Catering',
    'Chettipalayam Catering',
    'Traditional Tamil Catering',
    'Pure Vegetarian Caterer Coimbatore'
  ],
  authors: [{ name: 'Velavan Catering Services' }, { name: 'AXY Technologies' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Velavan Catering Services | Grand Feasts, Timeless Hospitality',
    description: 'Velavan Catering Services — grand wedding feasts, traditional South Indian banana leaf virundhu, modern buffets, and memorable hospitality for celebrations of every scale.',
    url: 'https://velavancatering.com',
    siteName: 'Velavan Catering Services',
    images: [
      {
        url: '/images/logo/logo.png',
        width: 1200,
        height: 630,
        alt: 'Velavan Catering Services Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BrandLoader />
        <LanguageProvider>
          <ScrollAnimationProvider>
            <TopBar />
            <Header />
            {children}
            <Footer />
          </ScrollAnimationProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
