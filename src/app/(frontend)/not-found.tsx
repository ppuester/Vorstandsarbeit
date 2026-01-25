import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Seite nicht gefunden
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Die angeforderte Seite existiert nicht mehr oder wurde verschoben.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Zum Dashboard
            </Link>
            <Link
              href="/kontobewegungen/uebersicht"
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Kontobewegungen
            </Link>
            <Link
              href="/flugzeuge"
              className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Flugzeuge
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
