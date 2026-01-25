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

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Willkommen zurück!
                </h1>
                <p className="text-sm md:text-base text-slate-600 mt-1">
                  Ihr Dashboard für die Vorstandsarbeit
                </p>
              </div>
            </div>
            <p className="text-lg md:text-xl text-slate-700 max-w-2xl leading-relaxed">
              Verwalten Sie Ihre Finanzen, Flugzeuge und Kontobewegungen auf einen Blick. Alles
              übersichtlich und professionell organisiert.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
            {[
              {
                title: 'Kontobewegungen',
                value: 'Übersicht',
                icon: FileText,
                gradient: 'from-blue-500 to-cyan-500',
                description: 'Einnahmen & Ausgaben verwalten',
                href: '/kontobewegungen/uebersicht',
              },
              {
                title: 'Flugzeuge',
                value: 'Verwaltung',
                icon: Plane,
                gradient: 'from-violet-500 to-purple-500',
                description: 'Flugzeugstammdaten & Flugbücher',
                href: '/flugzeuge',
              },
              {
                title: 'Kostenermittlung',
                value: 'Berechnung',
                icon: Calculator,
                gradient: 'from-emerald-500 to-teal-500',
                description: 'Kosten pro Flugzeug',
                href: '/flugzeuge/kostenermittlung',
              },
            ].map((stat, index) => (
              <Link
                key={index}
                href={stat.href}
                className="group relative bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 hover:shadow-xl hover:border-violet-300 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="text-base font-semibold text-slate-700 mb-2 group-hover:text-violet-600 transition-colors">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.description}</p>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/5 group-hover:to-fuchsia-500/5 transition-all duration-300 pointer-events-none" />
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Schnellzugriff</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/kontobewegungen"
                className="group relative p-5 border-2 border-slate-200 rounded-xl hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                  CSV Import
                </h3>
                <p className="text-sm text-slate-600">Kontobewegungen importieren</p>
              </Link>

              <Link
                href="/kontobewegungen/uebersicht"
                className="group relative p-5 border-2 border-slate-200 rounded-xl hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                  Einnahmen & Ausgaben
                </h3>
                <p className="text-sm text-slate-600">Übersicht in Reitern anzeigen</p>
              </Link>

              <Link
                href="/kontobewegungen/jahresvergleich"
                className="group relative p-5 border-2 border-slate-200 rounded-xl hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                  Jahresvergleich
                </h3>
                <p className="text-sm text-slate-600">Jahre vergleichen & Trends</p>
              </Link>

              <Link
                href="/flugzeuge"
                className="group relative p-5 border-2 border-slate-200 rounded-xl hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-violet-100 rounded-lg group-hover:bg-violet-200 transition-colors">
                    <Plane className="w-5 h-5 text-violet-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                  Flugzeuge
                </h3>
                <p className="text-sm text-slate-600">Flugzeugstammdaten verwalten</p>
              </Link>

              <Link
                href="/flugzeuge/kostenermittlung"
                className="group relative p-5 border-2 border-slate-200 rounded-xl hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <Calculator className="w-5 h-5 text-teal-600" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-violet-600 transition-colors">
                  Kostenermittlung
                </h3>
                <p className="text-sm text-slate-600">Flugzeugkosten berechnen</p>
              </Link>

              <div className="group relative p-5 border-2 border-dashed border-slate-300 rounded-xl hover:border-violet-400 hover:bg-gradient-to-br hover:from-violet-50 hover:to-fuchsia-50 transition-all duration-300 cursor-not-allowed opacity-60">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-slate-500 mb-1">Berichte</h3>
                <p className="text-sm text-slate-400">In Kürze verfügbar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Dashboard - Vorstandsarbeit',
  description: 'Verwaltungsdashboard für Kassierer-Aufgaben',
}
