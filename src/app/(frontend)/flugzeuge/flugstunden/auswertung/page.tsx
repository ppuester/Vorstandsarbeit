'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'

interface Aircraft {
  id: string
  registration: string
  name?: string
  active?: boolean
}

interface FlightLog {
  id: string
  aircraft: string | {
    id: string
    registration: string
    name?: string
  }
  year: number
  starts: number
  flightHours: number
  notes?: string
}

interface AircraftYearData {
  year: number
  starts: number
  flightHours: number
  avgHoursPerStart: number
}

interface AircraftData {
  aircraft: Aircraft
  years: AircraftYearData[]
}

export default function FlugstundenAuswertungPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [aircraftRes, flightLogsRes] = await Promise.all([
        fetch('/api/aircraft'),
        fetch('/api/flight-logs'),
      ])

      if (aircraftRes.ok) {
        const data = await aircraftRes.json()
        setAircraft(data.docs || [])
      }

      if (flightLogsRes.ok) {
        const data = await flightLogsRes.json()
        setFlightLogs(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group flight logs by aircraft and year
  const groupedData: AircraftData[] = aircraft
    .filter((ac) => ac.active !== false)
    .map((ac) => {
      const logs = flightLogs.filter((log) => {
        const aircraftId = typeof log.aircraft === 'object' ? log.aircraft.id : log.aircraft
        return aircraftId === ac.id
      })

      const years: AircraftYearData[] = logs.map((log) => ({
        year: log.year,
        starts: log.starts,
        flightHours: log.flightHours,
        avgHoursPerStart: log.starts > 0 ? log.flightHours / log.starts : 0,
      })).sort((a, b) => b.year - a.year)

      return { aircraft: ac, years }
    })
    .filter((data) => data.years.length > 0)
    .sort((a, b) => a.aircraft.registration.localeCompare(b.aircraft.registration))

  // Get all unique years
  const allYears = Array.from(
    new Set(flightLogs.map((log) => log.year))
  ).sort((a, b) => b - a)

  // Calculate comparison data
  const getComparison = (current: AircraftYearData | undefined, previous: AircraftYearData | undefined) => {
    if (!current) return null
    if (!previous) return null

    return {
      starts: current.starts - previous.starts,
      flightHours: current.flightHours - previous.flightHours,
      avgHoursPerStart: current.avgHoursPerStart - previous.avgHoursPerStart,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Lade Auswertung...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Flugstunden Auswertung & Jahresvergleich
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Übersicht der Starts und Flugstunden pro Flugzeug mit Vergleich zu Vorjahren
            </p>
          </div>

          {/* Year Filter */}
          {allYears.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Jahr filtern:
                </label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Alle Jahre</option>
                  {allYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Aircraft Data */}
          {groupedData.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                Noch keine Flugbucheinträge vorhanden.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedData.map(({ aircraft: ac, years }) => {
                const filteredYears = selectedYear
                  ? years.filter((y) => y.year === selectedYear)
                  : years

                if (filteredYears.length === 0) return null

                return (
                  <div
                    key={ac.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="bg-slate-50 dark:bg-slate-700 px-6 py-4 border-b border-slate-200 dark:border-slate-600">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {ac.registration}
                        {ac.name && (
                          <span className="text-slate-500 dark:text-slate-400 ml-2 font-normal">
                            ({ac.name})
                          </span>
                        )}
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                          <tr>
                            <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Jahr</th>
                            <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Starts</th>
                            <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Flugstunden</th>
                            <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Ø Stunden/Start</th>
                            <th className="text-center py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">Vergleich zum Vorjahr</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {filteredYears.map((yearData, index) => {
                            const previousYear = years[index + 1]
                            const comparison = getComparison(yearData, previousYear)

                            return (
                              <tr
                                key={yearData.year}
                                className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                                  {yearData.year}
                                </td>
                                <td className="py-4 px-6 text-right text-slate-900 dark:text-slate-100">
                                  {yearData.starts.toLocaleString('de-DE')}
                                </td>
                                <td className="py-4 px-6 text-right text-slate-900 dark:text-slate-100">
                                  {yearData.flightHours.toFixed(2).replace('.', ',')}
                                </td>
                                <td className="py-4 px-6 text-right text-slate-600 dark:text-slate-400">
                                  {yearData.avgHoursPerStart > 0
                                    ? yearData.avgHoursPerStart.toFixed(2).replace('.', ',')
                                    : '–'}
                                </td>
                                <td className="py-4 px-6 text-center">
                                  {comparison ? (
                                    <div className="flex items-center justify-center gap-4 text-sm">
                                      <div className="flex items-center gap-1">
                                        {comparison.starts > 0 ? (
                                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        ) : comparison.starts < 0 ? (
                                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        ) : (
                                          <Minus className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        )}
                                        <span
                                          className={
                                            comparison.starts > 0
                                              ? 'text-green-600 dark:text-green-400'
                                              : comparison.starts < 0
                                              ? 'text-red-600 dark:text-red-400'
                                              : 'text-slate-600 dark:text-slate-400'
                                          }
                                        >
                                          {comparison.starts > 0 ? '+' : ''}
                                          {comparison.starts} Starts
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {comparison.flightHours > 0 ? (
                                          <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        ) : comparison.flightHours < 0 ? (
                                          <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        ) : (
                                          <Minus className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                        )}
                                        <span
                                          className={
                                            comparison.flightHours > 0
                                              ? 'text-green-600 dark:text-green-400'
                                              : comparison.flightHours < 0
                                              ? 'text-red-600 dark:text-red-400'
                                              : 'text-slate-600 dark:text-slate-400'
                                          }
                                        >
                                          {comparison.flightHours > 0 ? '+' : ''}
                                          {comparison.flightHours.toFixed(2).replace('.', ',')} h
                                        </span>
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 dark:text-slate-500 text-sm">–</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
