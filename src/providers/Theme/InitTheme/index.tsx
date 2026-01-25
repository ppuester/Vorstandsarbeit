'use client'

import React, { useEffect } from 'react'

// Verhindert Flash of Unstyled Content (FOUC) beim Theme-Wechsel
export const InitTheme: React.FC = () => {
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark' || theme === 'light') {
      document.documentElement.setAttribute('data-theme', theme)
    } else {
      // System-Präferenz prüfen
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }
  }, [])

  return null
}
