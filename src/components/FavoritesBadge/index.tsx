'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, Send } from 'lucide-react'
import { useFavorites } from '@/providers/Favorites'

export function FavoritesBadge() {
  const { favorites } = useFavorites()

  if (favorites.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4">
      <div className="glass-dark rounded-2xl p-4 shadow-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="font-semibold">{favorites.length} Fahrschule{favorites.length > 1 ? 'n' : ''}</p>
              <p className="text-xs text-white/60">auf deinem Merkzettel</p>
            </div>
          </div>
          <Link
            href={`/anfrage?schools=${favorites.join(',')}`}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all"
          >
            <Send className="w-4 h-4" />
            Anfrage senden
          </Link>
        </div>
      </div>
    </div>
  )
}
