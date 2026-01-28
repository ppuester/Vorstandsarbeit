'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plane,
  Calculator,
  BarChart3,
  ArrowRight,
  Fuel,
  FolderTree,
  Users,
  Clock,
} from 'lucide-react'
import { useOrganization } from '@/providers/Organization'

type MemberYearSummary = {
  year: number
  members: number
  income: number
}

export function DashboardContent() {
  const { isFeatureEnabled } = useOrganization()
  const [memberSummary, setMemberSummary] = useState<MemberYearSummary[]>([])
  const [memberLoading, setMemberLoading] = useState(false)

  const stats = [
    {
      title: 'Kontobewegungen',
      value: 'Übersicht',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Einnahmen & Ausgaben verwalten',
      href: '/kontobewegungen/uebersicht',
      enabled: isFeatureEnabled('transactions'),
    },
    {
      title: 'Flugzeuge',
      value: 'Verwaltung',
      icon: Plane,
      gradient: 'from-violet-500 to-purple-500',
      description: 'Flugzeugstammdaten & Flugbücher',
      href: '/flugzeuge',
      enabled: isFeatureEnabled('aircraft'),
    },
    {
      title: 'Kostenermittlung',
      value: 'Berechnung',
      icon: Calculator,
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Kosten pro Flugzeug',
      href: '/flugzeuge/kostenermittlung',
      enabled: isFeatureEnabled('costCalculation'),
    },
    {
      title: 'Kraftstofferfassung',
      value: 'Tankvorgänge',
      icon: Fuel,
      gradient: 'from-orange-500 to-red-500',
      description: 'Kraftstoff erfassen',
      href: '/flugzeuge/kraftstofferfassung',
      enabled: isFeatureEnabled('fuelTracking'),
    },
    {
      title: 'Arbeitsstunden',
      value: 'Übersicht',
      icon: Clock,
      gradient: 'from-amber-500 to-yellow-500',
      description: 'Arbeitsstunden verwalten',
      href: '/arbeitsstunden',
      enabled: isFeatureEnabled('aircraft'),
    },
    {
      title: 'Mitglieder & Fix-Einnahmen',
      value: '',
      icon: Users,
      gradient: '',
      description: 'Verlauf der Mitgliederzahlen und Fix-Einnahmen',
      href: '/stammdaten/mitglieder-einnahmen',
      enabled: true,
    },
  ].filter((stat) => stat.enabled)

  const quickActions = [
    {
      title: 'CSV Import',
      description: 'Kontobewegungen importieren',
      href: '/kontobewegungen',
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      enabled: isFeatureEnabled('transactions'),
    },
    {
      title: 'Flugzeuge',
      description: 'Flugzeugstammdaten verwalten',
      href: '/flugzeuge',
      icon: Plane,
      iconBg: 'bg-slate-900/5',
      iconColor: 'text-slate-900',
      enabled: isFeatureEnabled('aircraft'),
    },
    {
      title: 'Mitglieder',
      description: 'Mitglieder verwalten',
      href: '/stammdaten/mitglieder',
      icon: Users,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      enabled: isFeatureEnabled('fuelTracking'), // Mitglieder werden für Kraftstofferfassung benötigt
    },
  ].filter((action) => action.enabled)

  useEffect(() => {
    const fetchMemberStats = async () => {
      try {
        setMemberLoading(true)
        const res = await fetch('/api/membership-fee-stats')
        if (!res.ok) return
        const data = await res.json()
        const map = new Map<number, { members: number; income: number }>()

        ;(data.docs || []).forEach((doc: any) => {
          const year = Number(doc.year)
          if (Number.isNaN(year)) return

          const memberCount = Number(doc.memberCount) || 0
          const totalIncome =
            doc.totalIncome != null
              ? Number(doc.totalIncome)
              : memberCount * (Number(doc.amountPerMember) || 0)

          if (!map.has(year)) {
            map.set(year, { members: 0, income: 0 })
          }

          const entry = map.get(year)!
          entry.members += memberCount
          entry.income += totalIncome
        })

        const summary: MemberYearSummary[] = Array.from(map.entries())
          .map(([year, value]) => ({
            year,
            members: value.members,
            income: value.income,
          }))
          .sort((a, b) => b.year - a.year)

        setMemberSummary(summary)
      } catch (error) {
        console.error('Fehler beim Laden der Fix-Einnahmen:', error)
      } finally {
        setMemberLoading(false)
      }
    }

    fetchMemberStats()
  }, [])

  return (
    <>
      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat, index) => {
            // Spezielle Kachel für Arbeitsstunden
            if (stat.title === 'Arbeitsstunden') {
              return (
                <div
                  key={index}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-900 text-white shadow-lg">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Link
                      href={stat.href}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                      title="Arbeitsstunden öffnen"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-4">
                    {stat.title}
                  </h3>
                  
                  {/* Arbeitsstunden Bereiche */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Berechnung der Arbeitsstunden</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">–</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Pflicht Arbeitsstunden</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">–</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Ergebnis Segelflug</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">–</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Ergebnis Motorflug</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">–</span>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/5 dark:group-hover:from-violet-500/10 group-hover:to-fuchsia-500/5 dark:group-hover:to-fuchsia-500/10 transition-all duration-300 pointer-events-none" />
                </div>
              )
            }

            if (stat.title === 'Mitglieder & Fix-Einnahmen') {
              const topYears = memberSummary.slice(0, 3)
              const latest = topYears[0]

              return (
                <div
                  key={index}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-slate-900 text-white shadow-lg">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Link
                      href={stat.href}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                      title="Fix-Einnahmen öffnen"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Mitglieder & Fix-Einnahmen
                  </h3>
                  {memberLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Lade Daten...
                    </p>
                  ) : topYears.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Noch keine Fix-Einnahmen erfasst.
                    </p>
                  ) : (
                    <>
                      {latest && (
                        <div className="mb-4">
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                            Letztes Jahr
                          </p>
                          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {latest.year}:{' '}
                            <span className="font-normal text-slate-700 dark:text-slate-300">
                              {latest.members} Mitglieder ·{' '}
                              {latest.income.toFixed(0)} € Fix-Einnahmen
                            </span>
                          </p>
                        </div>
                      )}
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Verlauf
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Mitglieder · Einnahmen
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {topYears.map((y) => (
                            <div
                              key={y.year}
                              className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-200"
                            >
                              <span className="w-10 text-slate-500 dark:text-slate-400">
                                {y.year}
                              </span>
                              <span className="flex-1 text-right">
                                {y.members} Pers.
                              </span>
                              <span className="flex-1 text-right text-emerald-600 dark:text-emerald-400">
                                {y.income.toFixed(0)} €
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            }

            // Standard-Kacheln
            return (
              <Link
                key={index}
                href={stat.href}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-900 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-2 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.description}</p>
                <div className="absolute inset-0 rounded-2xl bg-slate-900/0 group-hover:bg-slate-900/5 dark:group-hover:bg-slate-100/5 transition-all duration-300 pointer-events-none" />
              </Link>
            )
          })}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Stammdaten</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="group relative p-5 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-violet-400 dark:hover:border-violet-600 hover:bg-gradient-to-br hover:from-violet-50 dark:hover:from-violet-900/20 hover:to-fuchsia-50 dark:hover:to-fuchsia-900/20 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 ${action.iconBg} dark:opacity-80 rounded-lg group-hover:opacity-80 transition-colors`}>
                    <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {stats.length === 0 && quickActions.length === 0 && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-12 text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Für diese Organisation sind noch keine Funktionen aktiviert.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Bitte wenden Sie sich an den Administrator, um Funktionen zu aktivieren.
          </p>
        </div>
      )}
    </>
  )
}
