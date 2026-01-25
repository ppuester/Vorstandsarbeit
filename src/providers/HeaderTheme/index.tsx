'use client'

import React, { createContext, use, useState, useCallback } from 'react'

export type HeaderTheme = 'light' | 'dark' | null

export interface ContextType {
  headerTheme: HeaderTheme
  setHeaderTheme: (theme: HeaderTheme) => void
}

const initialContext: ContextType = {
  headerTheme: 'light',
  setHeaderTheme: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setHeaderThemeState] = useState<HeaderTheme>('light')

  const setHeaderTheme = useCallback((theme: HeaderTheme) => {
    setHeaderThemeState(theme)
  }, [])

  return (
    <HeaderThemeContext value={{ headerTheme, setHeaderTheme }}>
      {children}
    </HeaderThemeContext>
  )
}

export const useHeaderTheme = (): ContextType => use(HeaderThemeContext)
