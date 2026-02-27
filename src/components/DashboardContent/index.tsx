'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plane,
  ArrowRight,
  Fuel,
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
      title: 'Finanzen',
      value: 'Übersicht',
      icon: FileText,
      description: 'Einnahmen & Ausgaben verwalten',
      href: '/kontobewegungen/uebersicht',
      enabled: isFeatureEnabled('transactions'),
    },
    {
      title: 'Flugzeuge',
      value: 'Verwaltung',
      icon: Plane,
      description: 'Flugzeugstammdaten & Flugbücher',
      href: '/flugzeuge',
      enabled: isFeatureEnabled('aircraft'),
    },
    {
      title: 'Kraftstofferfassung',
      value: 'Tankvorgänge',
      icon: Fuel,
      description: 'Kraftstoff erfassen',
      href: '/flugzeuge/kraftstofferfassung',
      enabled: isFeatureEnabled('fuelTracking'),
    },
    {
      title: 'Arbeitsstunden',
      value: 'Übersicht',
      icon: Clock,
      description: 'Arbeitsstunden verwalten',
      href: '/arbeitsstunden',
      enabled: isFeatureEnabled('aircraft'),
    },
    {
      title: 'Mitglieder',
      value: '',
      icon: Users,
      description: 'Mitgliederzahlen und Fix-Einnahmen',
      href: '/stammdaten/mitglieder-einnahmen',
      enabled: true,
    },
  ].filter((stat) => stat.enabled)

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
            if (stat.title === 'Mitglieder') {
              const verlaufYears = memberSummary.slice(0, 6)

              return (
                <Link
                  key={index}
                  href={stat.href}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/60 p-6 flex flex-col hover:shadow-md hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-slate-900 text-white shadow-lg">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">
                    Mitglieder
                  </h3>
                  {memberLoading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Lade Daten...
                    </p>
                  ) : verlaufYears.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Noch keine Daten erfasst. Details im Eintrag.
                    </p>
                  ) : (
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 px-3 py-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Verlauf
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          Pers. · Einnahmen
                        </span>
                      </div>
                      <div className="space-y-1">
                        {verlaufYears.map((y) => (
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
                  )}
                </Link>
              )
            }

            // Standard-Kacheln
            return (
              <Link
                key={index}
                href={stat.href}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-6 hover:shadow-md hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-900 text-white shadow-sm">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  {stat.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.description}</p>
                {stat.value && (
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    {stat.value}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {stats.length === 0 && (
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
