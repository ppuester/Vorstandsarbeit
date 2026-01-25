import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import {
  TrendingUp,
  FileText,
  Plane,
  Calculator,
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { OrganizationSelector } from '@/components/OrganizationSelector'
import { DashboardContent } from '@/components/DashboardContent'

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                    Willkommen zurück!
                  </h1>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
                    Ihr Dashboard für die Vorstandsarbeit
                  </p>
                </div>
              </div>
              <OrganizationSelector />
            </div>
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
              Verwalten Sie Ihre Finanzen, Flugzeuge und Kontobewegungen auf einen Blick. Alles
              übersichtlich und professionell organisiert.
            </p>
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
