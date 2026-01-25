'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Analytics } from '@vercel/analytics/react'

const COOKIE_CONSENT_KEY = 'msc-lennetal-cookie-consent'

type ConsentType = 'all' | 'necessary' | null

interface CookieConsent {
  type: ConsentType
  timestamp: number
}

// Globaler Event-Name zum Öffnen des Banners
const OPEN_COOKIE_BANNER_EVENT = 'openCookieBanner'

// Funktion zum Öffnen des Cookie-Banners von außen
export const openCookieBanner = () => {
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_BANNER_EVENT))
}

// Helper um Consent-Status zu prüfen
export const hasAnalyticsConsent = (): boolean => {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (!stored) return false
  try {
    const consent: CookieConsent = JSON.parse(stored)
    return consent.type === 'all'
  } catch {
    return false
  }
}

export const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)

  const showBanner = useCallback(() => {
    setIsClosing(false)
    setIsVisible(true)
  }, [])

  useEffect(() => {
    // Prüfen ob bereits Consent gegeben wurde
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!stored) {
      const timer = setTimeout(() => showBanner(), 1000)
      return () => clearTimeout(timer)
    } else {
      // Prüfe ob Analytics erlaubt sind
      try {
        const consent: CookieConsent = JSON.parse(stored)
        setAnalyticsEnabled(consent.type === 'all')
      } catch {
        setAnalyticsEnabled(false)
      }
    }
  }, [showBanner])

  // Event-Listener für externes Öffnen
  useEffect(() => {
    const handleOpen = () => showBanner()
    window.addEventListener(OPEN_COOKIE_BANNER_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_COOKIE_BANNER_EVENT, handleOpen)
  }, [showBanner])

  const saveConsent = (type: ConsentType) => {
    const consent: CookieConsent = {
      type,
      timestamp: Date.now(),
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent))

    // Analytics aktivieren/deaktivieren
    setAnalyticsEnabled(type === 'all')

    setIsClosing(true)
    setTimeout(() => setIsVisible(false), 300)
  }

  const acceptAll = () => saveConsent('all')
  const acceptNecessary = () => saveConsent('necessary')

  return (
    <>
      {/* Vercel Analytics - nur wenn Consent gegeben */}
      {analyticsEnabled && <Analytics />}

      {/* Cookie Banner */}
      {isVisible && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-[9999]">
          <div
            className={`
              w-full md:w-[400px] max-w-full
              bg-background border border-border
              rounded-2xl md:rounded-3xl
              shadow-2xl
              p-5 md:p-6
              transition-all duration-300 ease-out
              ${isClosing ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}
            `}
            style={{
              animation: !isClosing ? 'cookieSlideUp 400ms ease-out' : undefined,
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground">Cookie-Einstellungen</h3>
            </div>

            {/* Text */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Wir verwenden Cookies, um dir die bestmögliche Erfahrung auf unserer Website zu bieten.{' '}
              <Link
                href="/datenschutz"
                className="text-primary hover:underline underline-offset-2 font-medium"
              >
                Mehr erfahren
              </Link>
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptNecessary}
                className="flex-1 px-5 py-3 text-sm font-semibold text-muted-foreground bg-muted hover:bg-muted/80 border border-border rounded-full transition-all duration-200 hover:scale-[1.02]"
              >
                Nur notwendige
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-5 py-3 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Button-Komponente für Footer etc.
export const CookieSettingsButton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <button
      onClick={openCookieBanner}
      className={className}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        font: 'inherit',
        color: 'inherit',
      }}
    >
      Cookie-Einstellungen
    </button>
  )
}
