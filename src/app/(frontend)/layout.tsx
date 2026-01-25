import type { Metadata, Viewport } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
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
          <main className="flex-1">{children}</main>
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
    default: 'Vorstandsarbeit - Verwaltungsdashboard',
    template: '%s | Vorstandsarbeit',
  },
  description: 'Verwaltungsdashboard für Vorstandsarbeit und Kassierer-Aufgaben',
  keywords: ['Vorstand', 'Kassierer', 'Verwaltung', 'Finanzen', 'Mitglieder'],
  authors: [{ name: 'Vorstandsarbeit' }],
  creator: 'Vorstandsarbeit',
  publisher: 'Vorstandsarbeit',
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
    title: 'Vorstandsarbeit - Verwaltungsdashboard',
    description: 'Verwaltungsdashboard für Vorstandsarbeit und Kassierer-Aufgaben',
    type: 'website',
    locale: 'de_DE',
    siteName: 'Vorstandsarbeit',
  }),
  twitter: {
    card: 'summary_large_image',
    title: 'Vorstandsarbeit - Verwaltungsdashboard',
    description: 'Verwaltungsdashboard für Vorstandsarbeit und Kassierer-Aufgaben',
  },
  alternates: {
    canonical: getServerSideURL(),
  },
  category: 'business',
}
