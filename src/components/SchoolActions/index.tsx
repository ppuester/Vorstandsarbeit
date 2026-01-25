'use client'

import React from 'react'
import Link from 'next/link'
import { Send, Heart } from 'lucide-react'
import { useFavorites } from '@/providers/Favorites'

interface SchoolActionsProps {
  schoolId: string
  schoolName?: string
  schoolEmail?: string | null
}

export function SchoolActions({ schoolId, schoolEmail }: SchoolActionsProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(schoolId)

  return (
    <div className="space-y-4">
      {/* Anfrage senden Button */}
      <Link
        href={`/anfrage?schools=${schoolId}`}
        className="block w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl text-center transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40"
      >
        <Send className="w-5 h-5 inline mr-2" />
        Unverbindliche Anfrage senden
      </Link>

      {/* Merken Button */}
      <button
        onClick={() => toggleFavorite(schoolId)}
        className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-semibold transition-all border-2 ${
          favorited
            ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            : 'bg-white border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-700'
        }`}
      >
        <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500' : ''}`} />
        {favorited ? 'Auf deinem Merkzettel' : `Fahrschule merken`}
      </button>

      {/* Direkt kontaktieren */}
      {schoolEmail && (
        <a
          href={`mailto:${schoolEmail}?subject=Anfrage über FahrschulFinder`}
          className="block w-full px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl text-center transition-colors"
        >
          Direkt per E-Mail kontaktieren
        </a>
      )}

      <p className="text-xs text-slate-500 text-center">
        Kostenlos und unverbindlich anfragen
      </p>
    </div>
  )
}
