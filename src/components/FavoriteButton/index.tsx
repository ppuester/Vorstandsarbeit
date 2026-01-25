'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/providers/Favorites'

interface FavoriteButtonProps {
  schoolId: string
  schoolName?: string
  variant?: 'icon' | 'button' | 'card'
  className?: string
}

export function FavoriteButton({
  schoolId,
  schoolName,
  variant = 'icon',
  className = '',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(schoolId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(schoolId)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full transition-all ${
          favorited
            ? 'bg-rose-100 text-rose-500 hover:bg-rose-200'
            : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white'
        } ${className}`}
        aria-label={favorited ? 'Von Merkzettel entfernen' : 'Auf Merkzettel setzen'}
        title={favorited ? 'Von Merkzettel entfernen' : 'Auf Merkzettel setzen'}
      >
        <Heart
          className={`w-5 h-5 ${favorited ? 'fill-rose-500' : ''}`}
        />
      </button>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
          favorited
            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        } ${className}`}
      >
        <Heart
          className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`}
        />
        {favorited ? 'Gemerkt' : 'Merken'}
      </button>
    )
  }

  // variant === 'card'
  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl font-medium transition-all border-2 ${
        favorited
          ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
          : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-700'
      } ${className}`}
    >
      <Heart
        className={`w-5 h-5 ${favorited ? 'fill-rose-500' : ''}`}
      />
      {favorited ? 'Auf deinem Merkzettel' : `${schoolName || 'Fahrschule'} merken`}
    </button>
  )
}
