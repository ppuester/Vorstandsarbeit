'use client'

import React, { createContext, use, useState, useEffect, useCallback } from 'react'

import type { ThemeContextType, Theme } from './types'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: 'light',
}

const ThemeContext = createContext(initialContext)

const STORAGE_KEY = 'theme'
const THEME_ATTRIBUTE = 'data-theme'

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Lade Theme aus LocalStorage nach Hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && themeIsValid(stored)) {
        setThemeState(stored)
        document.documentElement.setAttribute(THEME_ATTRIBUTE, stored)
      } else {
        // Prüfe System-Präferenz
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const initialTheme: Theme = prefersDark ? 'dark' : 'light'
        setThemeState(initialTheme)
        document.documentElement.setAttribute(THEME_ATTRIBUTE, initialTheme)
      }
    } catch (e) {
      console.error('Fehler beim Laden des Themes:', e)
      setThemeState('light')
      document.documentElement.setAttribute(THEME_ATTRIBUTE, 'light')
    }
    setIsHydrated(true)
  }, [])

  // Speichere Theme in LocalStorage und aktualisiere HTML-Attribut
  useEffect(() => {
    if (isHydrated && theme) {
      try {
        localStorage.setItem(STORAGE_KEY, theme)
        document.documentElement.setAttribute(THEME_ATTRIBUTE, theme)
      } catch (e) {
        console.error('Fehler beim Speichern des Themes:', e)
      }
    }
  }, [theme, isHydrated])

  const setTheme = useCallback((newTheme: Theme | null) => {
    if (newTheme && themeIsValid(newTheme)) {
      setThemeState(newTheme)
    }
  }, [])

  const currentTheme = theme || 'light'

  return (
    <ThemeContext.Provider value={{ setTheme, theme: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
