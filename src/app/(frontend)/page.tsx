import React from 'react'
import type { Metadata } from 'next'
import { OrganizationSelector } from '@/components/OrganizationSelector'
import { DashboardContent } from '@/components/DashboardContent'
import { getMeUser } from '@/utilities/getMeUser'

export default async function DashboardPage() {
  // Prüfe Authentifizierung - leite zur Login-Seite um, wenn nicht eingeloggt
  await getMeUser({ nullUserRedirect: '/login' })

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Vorstandsarbeit
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-slate-100">
                Dashboard
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                Überblick über Finanzen, Flugzeuge und Fix-Einnahmen – klar strukturiert für die
                tägliche Vorstandsarbeit.
              </p>
            </div>
            <div className="self-start md:self-auto">
              <OrganizationSelector />
            </div>
          </div>

          <DashboardContent />
        </div>
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Dashboard - Vorstandsarbeit',
  description: 'Verwaltungsdashboard für Kassierer-Aufgaben',
}
