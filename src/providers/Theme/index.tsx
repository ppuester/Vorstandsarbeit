'use client'

import React, { createContext, use } from 'react'

import type { ThemeContextType } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: 'light',
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Kein Dark Mode - nur Light Theme
  return (
    <ThemeContext value={{ setTheme: () => null, theme: 'light' }}>
      {children}
    </ThemeContext>
  )
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
