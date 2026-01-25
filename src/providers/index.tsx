import React from 'react'

import { FavoritesProvider } from './Favorites'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </FavoritesProvider>
    </ThemeProvider>
  )
}
