import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Wallet, TrendingUp, FileText, Users, Calendar, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Vorstandsarbeit Dashboard
            </h1>
            <p className="text-xl text-slate-600">
              Willkommen im Verwaltungsbereich für Ihre Kassierer-Aufgaben
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Kassenstand',
                value: '0,00 €',
                icon: Wallet,
                color: 'bg-green-500',
                description: 'Aktueller Kontostand',
              },
              {
                title: 'Offene Rechnungen',
                value: '0',
                icon: FileText,
                color: 'bg-blue-500',
                description: 'Noch nicht bezahlt',
              },
              {
                title: 'Mitglieder',
                value: '0',
                icon: Users,
                color: 'bg-purple-500',
                description: 'Aktive Mitglieder',
              },
              {
                title: 'Monatliche Einnahmen',
                value: '0,00 €',
                icon: TrendingUp,
                color: 'bg-emerald-500',
                description: 'Dieser Monat',
              },
              {
                title: 'Ausstehende Zahlungen',
                value: '0',
                icon: DollarSign,
                color: 'bg-amber-500',
                description: 'Überfällig',
              },
              {
                title: 'Termine',
                value: '0',
                icon: Calendar,
                color: 'bg-indigo-500',
                description: 'Diese Woche',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-slate-600 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Schnellzugriff</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/kontobewegungen"
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-slate-900 mb-1">Kontobewegungen</h3>
                <p className="text-sm text-slate-600">CSV importieren und verwalten</p>
              </Link>
              <Link
                href="/kontobewegungen/uebersicht"
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-slate-900 mb-1">Einnahmen & Ausgaben</h3>
                <p className="text-sm text-slate-600">Übersicht in Reitern anzeigen</p>
              </Link>
              <Link
                href="/kontobewegungen/jahresvergleich"
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-slate-900 mb-1">Jahresvergleich</h3>
                <p className="text-sm text-slate-600">Jahre vergleichen & Trends</p>
              </Link>
              <Link
                href="/flugzeuge"
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-slate-900 mb-1">Flugzeuge</h3>
                <p className="text-sm text-slate-600">Flugzeugstammdaten verwalten</p>
              </Link>
              <Link
                href="/flugzeuge/kostenermittlung"
                className="p-4 border-2 border-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-colors text-left"
              >
                <h3 className="font-semibold text-slate-900 mb-1">Kostenermittlung</h3>
                <p className="text-sm text-slate-600">Flugzeugkosten berechnen</p>
              </Link>
              <button className="p-4 border-2 border-slate-200 rounded-lg hover:border-violet-500 hover:bg-violet-50 transition-colors text-left">
                <h3 className="font-semibold text-slate-900 mb-1">Berichte</h3>
                <p className="text-sm text-slate-600">Finanzübersicht anzeigen</p>
              </button>
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
