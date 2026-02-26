'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart3, ChevronLeft, Download, X } from 'lucide-react'

interface MemberSummaryItem {
  memberId: string | null
  memberName: string
  matched: boolean
  totals: {
    gliderMin: number
    motorMin: number
    towMin: number
    gliderHours: number
    motorHours: number
    towHours: number
  }
  detailsCount: { glider: number; motor: number; tow: number }
}

interface FlightDetailItem {
  id: string
  date: string
  aircraftRegistration: string
  pilotName: string
  workingMinutesGlider: number
  workingMinutesMotor: number
  workingMinutesTow: number
  sourceTowAircraftRegistration?: string
  departureLocation?: string
  landingLocation?: string
  notes?: string
}

function formatMinHours(min: number): string {
  const h = Number((min / 60).toFixed(2))
  return `${min} min (${h.toLocaleString('de-DE')} h)`
}

export default function FlugbewegungenAuswertungPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [list, setList] = useState<MemberSummaryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [includeUnmatched, setIncludeUnmatched] = useState(true)
  const [drilldown, setDrilldown] = useState<{
    memberId: string | null
    pilotName: string
    category: 'glider' | 'motor' | 'tow'
    label: string
  } | null>(null)
  const [details, setDetails] = useState<FlightDetailItem[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ year: String(year) })
        if (includeUnmatched) params.append('includeUnmatched', 'true')
        const res = await fetch(
          `/api/working-hours/flight-based/member-summary?${params.toString()}`
        )
        if (res.ok) {
          const data = await res.json()
          setList(Array.isArray(data) ? data : [])
        } else {
          setList([])
        }
      } catch (_err) {
        setList([])
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [year, includeUnmatched])

  useEffect(() => {
    if (!drilldown) {
      setDetails([])
      return
    }
    setDetailsLoading(true)
    const params = new URLSearchParams({
      year: String(year),
      category: drilldown.category,
    })
    if (drilldown.memberId) params.append('memberId', drilldown.memberId)
    else if (drilldown.pilotName) params.append('pilotName', drilldown.pilotName)
    fetch(`/api/working-hours/flight-based/member-details?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDetails(Array.isArray(data) ? data : []))
      .catch(() => setDetails([]))
      .finally(() => setDetailsLoading(false))
  }, [drilldown, year])

  const openDrilldown = (
    memberId: string | null,
    pilotName: string,
    category: 'glider' | 'motor' | 'tow',
    label: string
  ) => {
    setDrilldown({ memberId, pilotName, category, label })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/arbeitsstunden"
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                title="Zurück zu Arbeitsstunden"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div className="p-3 bg-slate-900 dark:bg-slate-100 rounded-xl shadow-sm">
                <BarChart3 className="w-8 h-8 text-white dark:text-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Arbeitsstunden aus Flugbewegungen
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Auswertung je Mitglied (Segelflug, Motorflug, Schlepp) – Klick öffnet Detail-Liste
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={includeUnmatched}
                  onChange={(e) => setIncludeUnmatched(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                Unzugeordnete anzeigen
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
              >
                {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={async () => {
                  const url = `/api/working-hours/flight-based/export?year=${year}&includeUnmatched=${includeUnmatched}`
                  const res = await fetch(url)
                  if (!res.ok) return
                  const blob = await res.blob()
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(blob)
                  a.download = `arbeitsstunden_${year}.xlsx`
                  a.click()
                  URL.revokeObjectURL(a.href)
                }}
                disabled={!year}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                Export (XLSX)
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-slate-600 dark:text-slate-400">Lade Auswertung...</span>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Mitglied
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Segelflug
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Motorflug
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Schlepp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {list.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-slate-500 dark:text-slate-400"
                        >
                          Keine Daten für {year}. Bitte zuerst Flugbewegungen importieren.
                        </td>
                      </tr>
                    ) : (
                      list.map((row) => (
                        <tr
                          key={row.memberId ?? `name:${row.memberName}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/30"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {row.memberName}
                            </span>
                            {!row.matched && (
                              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                (nicht zugeordnet)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {(row.totals.gliderMin > 0 || row.detailsCount.glider > 0) ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openDrilldown(
                                    row.memberId,
                                    row.memberName,
                                    'glider',
                                    'Segelflug'
                                  )
                                }
                                className="text-left text-violet-600 dark:text-violet-400 hover:underline font-medium"
                              >
                                {formatMinHours(row.totals.gliderMin)}
                              </button>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">–</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {(row.totals.motorMin > 0 || row.detailsCount.motor > 0) ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openDrilldown(
                                    row.memberId,
                                    row.memberName,
                                    'motor',
                                    'Motorflug'
                                  )
                                }
                                className="text-left text-violet-600 dark:text-violet-400 hover:underline font-medium"
                              >
                                {formatMinHours(row.totals.motorMin)}
                              </button>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">–</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {(row.totals.towMin > 0 || row.detailsCount.tow > 0) ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openDrilldown(
                                    row.memberId,
                                    row.memberName,
                                    'tow',
                                    'Schlepp'
                                  )
                                }
                                className="text-left text-violet-600 dark:text-violet-400 hover:underline font-medium"
                              >
                                {formatMinHours(row.totals.towMin)}
                              </button>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">–</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 px-4 pb-4">
                Mitglieder mit Kostenstufe &quot;Barzahler&quot; sind von Arbeitsstunden ausgenommen und werden nicht angezeigt.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Drilldown Dialog */}
      {drilldown && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Detail-Liste"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {drilldown.label} – {drilldown.pilotName}
              </h2>
              <button
                type="button"
                onClick={() => setDrilldown(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : details.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  Keine Einträge
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        Datum
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        LFZ
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        Min
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        Schlepp-LFZ
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        Start / Landeort
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {details.map((f) => (
                      <tr key={f.id}>
                        <td className="py-2 px-2 text-slate-900 dark:text-slate-100">
                          {f.date ? new Date(f.date).toLocaleDateString('de-DE') : '–'}
                        </td>
                        <td className="py-2 px-2 text-slate-700 dark:text-slate-300">
                          {f.aircraftRegistration || '–'}
                        </td>
                        <td className="py-2 px-2">
                          {drilldown.category === 'glider' && f.workingMinutesGlider}
                          {drilldown.category === 'motor' && f.workingMinutesMotor}
                          {drilldown.category === 'tow' && f.workingMinutesTow}
                          {' min'}
                        </td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                          {f.sourceTowAircraftRegistration || '–'}
                        </td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                          {[f.departureLocation, f.landingLocation].filter(Boolean).join(' → ') || '–'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
