'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  Calendar,
  ArrowUp,
  ArrowDown,
  Wallet,
  TrendingUp,
  Users,
  Plane,
  FileText,
  Printer,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { JhvReport } from '@/app/(frontend)/api/jhv-report/route'

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => CURRENT_YEAR - 10 + i)

function formatEur(value: number): string {
  return `${value >= 0 ? '' : '−'} ${Math.abs(value).toFixed(2).replace('.', ',')} €`
}

export default function JhvPage() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [compareYear, setCompareYear] = useState<number | ''>('')
  const [report, setReport] = useState<JhvReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams({ year: String(year) })
    if (compareYear !== '') params.set('compareYear', String(compareYear))

    setLoading(true)
    setError(null)
    fetch(`/api/jhv-report?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText)
        return res.json()
      })
      .then(setReport)
      .catch((e) => setError(e.message || 'Fehler beim Laden'))
      .finally(() => setLoading(false))
  }, [year, compareYear])

  if (loading && !report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Lade JHV-Auswertung …</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <ClipboardList className="w-8 h-8" />
                JHV-Auswertung
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                Finanz- und Vereinsauswertung für die Jahreshauptversammlung
              </p>
            </div>
            <Link
              href="/kontobewegungen/uebersicht"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 text-sm font-medium transition-colors"
            >
              Zurück zur Übersicht
            </Link>
          </div>

          {/* Year selection */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Jahr auswählen
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Berichtsjahr:</span>
                <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v, 10))}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Vorjahresvergleich:</span>
                <Select
                  value={compareYear === '' ? 'none' : String(compareYear)}
                  onValueChange={(v) => setCompareYear(v === 'none' ? '' : parseInt(v, 10))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Kein Vergleich" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Vergleich</SelectItem>
                    {YEAR_OPTIONS.filter((y) => y !== year).map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-8 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {report && (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Anfangsbestand</span>
                    <Wallet className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {formatEur(report.openingBalance)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kassenstand 01.01.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Einnahmen</span>
                    <ArrowUp className="w-5 h-5 text-green-500 dark:text-green-400" />
                  </div>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatEur(report.income)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gesamtjahr {report.year}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Ausgaben</span>
                    <ArrowDown className="w-5 h-5 text-red-500 dark:text-red-400" />
                  </div>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatEur(report.expenses)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gesamtjahr {report.year}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Jahresergebnis</span>
                    {report.result >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-500 dark:text-red-400" />
                    )}
                  </div>
                  <p
                    className={`text-xl font-bold ${
                      report.result >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {report.result >= 0 ? '+' : '−'} {Math.abs(report.result).toFixed(2).replace('.', ',')} €
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {report.result >= 0 ? 'Überschuss' : 'Defizit'}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Endbestand</span>
                    <Wallet className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {formatEur(report.closingBalance)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kassenstand 31.12.</p>
                </div>
              </div>

              {/* Einnahmen nach Kategorien */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Einnahmen nach Kategorien ({report.year})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {report.incomeByCategory.length === 0 ? (
                    <p className="p-6 text-slate-500 dark:text-slate-400">Keine kategorisierten Einnahmen im Berichtsjahr.</p>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                        <tr>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Kategorie</th>
                          <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Betrag</th>
                          <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Anteil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.incomeByCategory.map((row) => {
                          const pct = report.income > 0 ? (row.sum / report.income) * 100 : 0
                          return (
                            <tr key={row.category} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                              <td className="py-3 px-6 text-slate-900 dark:text-slate-100">{row.category}</td>
                              <td className="py-3 px-6 text-right font-medium text-green-600 dark:text-green-400">
                                {row.sum.toFixed(2).replace('.', ',')} €
                              </td>
                              <td className="py-3 px-6 text-right text-slate-600 dark:text-slate-400">
                                {pct.toFixed(1).replace('.', ',')} %
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="bg-slate-50 dark:bg-slate-700/50 font-semibold">
                          <td className="py-3 px-6 text-slate-900 dark:text-slate-100">Summe Einnahmen</td>
                          <td className="py-3 px-6 text-right text-green-600 dark:text-green-400">
                            {report.income.toFixed(2).replace('.', ',')} €
                          </td>
                          <td className="py-3 px-6 text-right">100,0 %</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              {/* Ausgaben nach Kategorien */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Ausgaben nach Kategorien ({report.year})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {report.expensesByCategory.length === 0 ? (
                    <p className="p-6 text-slate-500 dark:text-slate-400">Keine kategorisierten Ausgaben im Berichtsjahr.</p>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                        <tr>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Kategorie</th>
                          <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Betrag</th>
                          <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Anteil</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.expensesByCategory.map((row) => {
                          const pct = report.expenses > 0 ? (row.sum / report.expenses) * 100 : 0
                          return (
                            <tr key={row.category} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                              <td className="py-3 px-6 text-slate-900 dark:text-slate-100">{row.category}</td>
                              <td className="py-3 px-6 text-right font-medium text-red-600 dark:text-red-400">
                                {row.sum.toFixed(2).replace('.', ',')} €
                              </td>
                              <td className="py-3 px-6 text-right text-slate-600 dark:text-slate-400">
                                {pct.toFixed(1).replace('.', ',')} %
                              </td>
                            </tr>
                          )
                        })}
                        <tr className="bg-slate-50 dark:bg-slate-700/50 font-semibold">
                          <td className="py-3 px-6 text-slate-900 dark:text-slate-100">Summe Ausgaben</td>
                          <td className="py-3 px-6 text-right text-red-600 dark:text-red-400">
                            {report.expenses.toFixed(2).replace('.', ',')} €
                          </td>
                          <td className="py-3 px-6 text-right">100,0 %</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              {/* Offene Posten */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Offene Posten / Verbindlichkeiten
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  In der aktuellen Datenbasis sind offene Forderungen und Verbindlichkeiten nicht getrennt erfasst.
                  Sofern Sie diese führen, können Sie sie hier manuell ergänzen oder in einer separaten Übersicht pflegen.
                </p>
              </section>

              {/* Rücklagen / Vermögen */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Rücklagen / Vermögenssicht
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full max-w-md">
                    <tbody>
                      <tr className="border-b border-slate-200 dark:border-slate-600">
                        <td className="py-2 text-slate-700 dark:text-slate-300">Kassenstand zum Jahresende (aus Buchungen)</td>
                        <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">
                          {formatEur(report.closingBalance)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
                  Zweckgebundene Rücklagen und Investitionsrücklagen sind im aktuellen Datenmodell nicht abgebildet.
                  Der Kassenstand entspricht der kumulierten Bilanz aus allen erfassten Kontobewegungen.
                </p>
              </section>

              {/* Vereinskennzahlen */}
              <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Vereins- und Betriebskennzahlen ({report.year})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Beitragspflichtige Mitglieder (Stichtag)</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{report.memberCount}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Fix-Einnahmen Beiträge</span>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {report.membershipIncome.toFixed(2).replace('.', ',')} €
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Flugstunden (Gesamt)</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {report.totalFlightHours.toFixed(1).replace('.', ',')} h
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 p-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Starts (Gesamt)</span>
                    <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{report.totalStarts}</p>
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">
                  Mitglieder und Fix-Einnahmen stammen aus den Stammdaten „Fix-Einnahmen“; Flugstunden und Starts aus den Flugbüchern.
                </p>
              </section>

              {/* Vorjahresvergleich */}
              {report.priorYear && (
                <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 overflow-hidden mb-8">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Vorjahresvergleich {report.priorYear.year} → {report.year}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                        <tr>
                          <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Kennzahl</th>
                          <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">{report.priorYear.year}</th>
                          <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">{report.year}</th>
                          <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Veränderung</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-3 px-6 text-slate-900 dark:text-slate-100">Einnahmen</td>
                          <td className="py-3 px-6 text-right text-green-600 dark:text-green-400">{report.priorYear.income.toFixed(2).replace('.', ',')} €</td>
                          <td className="py-3 px-6 text-right text-green-600 dark:text-green-400">{report.income.toFixed(2).replace('.', ',')} €</td>
                          <td className="py-3 px-6 text-right">
                            {(() => {
                              const d = report.income - report.priorYear.income
                              const pct = report.priorYear.income ? ((d / report.priorYear.income) * 100) : 0
                              return (
                                <span className={d >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  {d >= 0 ? '+' : ''}{d.toFixed(2).replace('.', ',')} € ({pct >= 0 ? '+' : ''}{pct.toFixed(1).replace('.', ',')} %)
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-3 px-6 text-slate-900 dark:text-slate-100">Ausgaben</td>
                          <td className="py-3 px-6 text-right text-red-600 dark:text-red-400">{report.priorYear.expenses.toFixed(2).replace('.', ',')} €</td>
                          <td className="py-3 px-6 text-right text-red-600 dark:text-red-400">{report.expenses.toFixed(2).replace('.', ',')} €</td>
                          <td className="py-3 px-6 text-right">
                            {(() => {
                              const d = report.expenses - report.priorYear.expenses
                              const pct = report.priorYear.expenses ? ((d / report.priorYear.expenses) * 100) : 0
                              return (
                                <span className={d <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  {d >= 0 ? '+' : ''}{d.toFixed(2).replace('.', ',')} € ({pct >= 0 ? '+' : ''}{pct.toFixed(1).replace('.', ',')} %)
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-3 px-6 text-slate-900 dark:text-slate-100">Jahresergebnis</td>
                          <td className="py-3 px-6 text-right">{report.priorYear.result.toFixed(2).replace('.', ',')} €</td>
                          <td className="py-3 px-6 text-right">{report.result.toFixed(2).replace('.', ',')} €</td>
                          <td className="py-3 px-6 text-right">
                            {(() => {
                              const d = report.result - report.priorYear.result
                              return (
                                <span className={d >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  {d >= 0 ? '+' : ''}{d.toFixed(2).replace('.', ',')} €
                                </span>
                              )
                            })()}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-700">
                          <td className="py-3 px-6 text-slate-900 dark:text-slate-100">Mitglieder (Stichtag)</td>
                          <td className="py-3 px-6 text-right">{report.priorYear.memberCount}</td>
                          <td className="py-3 px-6 text-right">{report.memberCount}</td>
                          <td className="py-3 px-6 text-right">
                            {report.memberCount - report.priorYear.memberCount >= 0 ? '+' : ''}
                            {report.memberCount - report.priorYear.memberCount}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* JHV-Kompaktansicht (druckfreundlich) */}
              <section
                id="jhv-bericht"
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-8 mb-8 print:shadow-none print:border print:break-inside-avoid"
              >
                <div className="flex items-center justify-between mb-6 print:mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    JHV-Bericht – Kompaktansicht {report.year}
                  </h2>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-sm font-medium transition-colors print:hidden"
                  >
                    <Printer className="w-4 h-4" />
                    Drucken / PDF
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Finanzen</h3>
                    <ul className="space-y-1.5 text-slate-900 dark:text-slate-100">
                      <li>Kassenstand Jahresanfang: {formatEur(report.openingBalance)}</li>
                      <li>Einnahmen gesamt: {formatEur(report.income)}</li>
                      <li>Ausgaben gesamt: {formatEur(report.expenses)}</li>
                      <li>Jahresergebnis: {report.result >= 0 ? '+' : '−'} {Math.abs(report.result).toFixed(2).replace('.', ',')} €</li>
                      <li>Kassenstand Jahresende: {formatEur(report.closingBalance)}</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Verein</h3>
                    <ul className="space-y-1.5 text-slate-900 dark:text-slate-100">
                      <li>Beitragspflichtige Mitglieder: {report.memberCount}</li>
                      <li>Fix-Einnahmen Beiträge: {report.membershipIncome.toFixed(2).replace('.', ',')} €</li>
                      <li>Flugstunden: {report.totalFlightHours.toFixed(1).replace('.', ',')} h</li>
                      <li>Starts: {report.totalStarts}</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-6 pt-4 border-t border-slate-200 dark:border-slate-600">
                  Erzeugt aus den erfassten Kontobewegungen, Fix-Einnahmen und Flugbüchern. Stand: {new Date().toLocaleDateString('de-DE')}.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
