import type { Metadata, Viewport } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { CookieBanner } from '@/components/CookieBanner'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let isEnabled = false
  try {
    const draftModeResult = await draftMode()
    isEnabled = draftModeResult.isEnabled
  } catch (_ignore) {
    // Draft-Mode-Fehler ignorieren
  }

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="de" suppressHydrationWarning>
      <head>
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  )
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#7c3aed', // Violet
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'FahrschulFinder - Finde die beste Fahrschule in deiner Nähe',
    template: '%s | FahrschulFinder',
  },
  description:
    'Die #1 Plattform für die Fahrschulsuche in Deutschland. Vergleiche über 3.000 Fahrschulen, lies echte Bewertungen und finde die perfekte Fahrschule für deinen Führerschein.',
  keywords: [
    'Fahrschule',
    'Fahrschule finden',
    'Fahrschule vergleichen',
    'Führerschein',
    'Fahrschule Bewertungen',
    'Fahrschule in der Nähe',
    'PKW Führerschein',
    'Motorrad Führerschein',
    'Führerschein Klasse B',
    'Fahrschulpreise',
    'Fahrausbildung',
    'Intensivkurs Fahrschule',
  ],
  authors: [{ name: 'FahrschulFinder' }],
  creator: 'FahrschulFinder',
  publisher: 'FahrschulFinder',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: mergeOpenGraph({
    title: 'FahrschulFinder - Finde die beste Fahrschule in deiner Nähe',
    description: 'Vergleiche Fahrschulen, lies echte Bewertungen und finde die perfekte Fahrschule für deinen Führerschein.',
    type: 'website',
    locale: 'de_DE',
    siteName: 'FahrschulFinder',
  }),
  twitter: {
    card: 'summary_large_image',
    title: 'FahrschulFinder - Finde die beste Fahrschule in deiner Nähe',
    description: 'Vergleiche Fahrschulen, lies echte Bewertungen und finde die perfekte Fahrschule für deinen Führerschein.',
  },
  alternates: {
    canonical: getServerSideURL(),
  },
  category: 'automotive',
}
