'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface FavoritesContextType {
  favorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEY = 'favoriteSchools'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Lade Favoriten aus LocalStorage nach Hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Fehler beim Laden der Favoriten:', e)
    }
    setIsHydrated(true)
  }, [])

  // Speichere Favoriten in LocalStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
      } catch (e) {
        console.error('Fehler beim Speichern der Favoriten:', e)
      }
    }
  }, [favorites, isHydrated])

  const addFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(fav => fav !== id))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      if (prev.includes(id)) {
        return prev.filter(fav => fav !== id)
      }
      return [...prev, id]
    })
  }, [])

  const isFavorite = useCallback((id: string) => {
    return favorites.includes(id)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
