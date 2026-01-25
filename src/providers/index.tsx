import React from 'react'

import { FavoritesProvider } from './Favorites'
import { HeaderThemeProvider } from './HeaderTheme'
import { OrganizationProvider } from './Organization'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <OrganizationProvider>
        <FavoritesProvider>
          <HeaderThemeProvider>{children}</HeaderThemeProvider>
        </FavoritesProvider>
      </OrganizationProvider>
    </ThemeProvider>
  )
}
