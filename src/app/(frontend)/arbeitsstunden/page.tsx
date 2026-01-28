import React from 'react'
import { Metadata } from 'next'
import { Clock } from 'lucide-react'
import { getMeUser } from '@/utilities/getMeUser'

export const metadata: Metadata = {
  title: 'Arbeitsstunden',
  description: 'Verwaltung und Berechnung von Arbeitsstunden',
}

export default async function ArbeitsstundenPage() {
  // Prüfe Authentifizierung
  await getMeUser({ nullUserRedirect: '/login' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                  Arbeitsstunden
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                  Verwaltung und Berechnung von Arbeitsstunden
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Bereiche
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Berechnung der Arbeitsstunden
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Hier wird die Berechnung der Arbeitsstunden angezeigt.
                    </p>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Pflicht Arbeitsstunden
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Hier werden die Pflicht-Arbeitsstunden angezeigt.
                    </p>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Ergebnis Segelflug
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Hier wird das Ergebnis für Segelflug angezeigt.
                    </p>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Ergebnis Motorflug
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Hier wird das Ergebnis für Motorflug angezeigt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
