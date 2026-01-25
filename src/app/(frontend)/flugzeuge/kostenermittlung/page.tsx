'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, Plane, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Aircraft {
  id: string
  registration: string
  name?: string
  aircraftGroup: string
  active: boolean
  insurance?: number
  hangar?: number
  annualInspection?: number
  fixedCosts?: number
  fuelConsumption?: number
  fuelPrice?: number
  maintenanceCostPerHour?: number
}

interface FlightLog {
  id: string
  aircraft: string | Aircraft
  year: number
  starts: number
  flightHours: number
}

interface AircraftCosts {
  aircraft: Aircraft
  year: number
  fixedCosts: number
  variableCosts: number
  totalCosts: number
  flightHours: number
  starts: number
  costPerHour: number
  costPerStart: number
}

export default function KostenermittlungPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedAircraft, setSelectedAircraft] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [aircraftRes, flightLogsRes, transactionsRes] = await Promise.all([
        fetch('/api/aircraft'),
        fetch('/api/flight-logs'),
        fetch('/api/transactions'),
      ])

      if (aircraftRes.ok) {
        const data = await aircraftRes.json()
        setAircraft(data.docs || [])
      }

      if (flightLogsRes.ok) {
        const data = await flightLogsRes.json()
        setFlightLogs(data.docs || [])
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json()
        setTransactions(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get available years
  const availableYears = Array.from(
    new Set([
      ...flightLogs.map((log) => log.year),
      ...transactions.map((t) => new Date(t.date).getFullYear()),
    ])
  ).sort((a, b) => b - a)

  // Calculate costs for each aircraft
  const calculateAircraftCosts = (): AircraftCosts[] => {
    const costs: AircraftCosts[] = []

    aircraft.forEach((ac) => {
      if (selectedAircraft !== 'all' && ac.id !== selectedAircraft) return

      // Get flight log for selected year
      const flightLog = flightLogs.find(
        (log) =>
          (typeof log.aircraft === 'object' ? log.aircraft.id : log.aircraft) === ac.id &&
          log.year === selectedYear
      )

      const flightHours = flightLog?.flightHours || 0
      const starts = flightLog?.starts || 0

      // Calculate fixed costs
      const fixedCosts =
        (ac.insurance || 0) +
        (ac.hangar || 0) +
        (ac.annualInspection || 0) +
        (ac.fixedCosts || 0)

      // Calculate variable costs
      let variableCosts = 0

      // Fuel costs
      if (ac.fuelConsumption && ac.fuelPrice) {
        variableCosts += flightHours * ac.fuelConsumption * ac.fuelPrice
      }

      // Maintenance costs
      if (ac.maintenanceCostPerHour) {
        variableCosts += flightHours * ac.maintenanceCostPerHour
      }

      // Get additional costs from transactions (filtered by aircraft category)
      // Assuming transactions have a category or reference that links to aircraft
      const aircraftTransactions = transactions.filter((t) => {
        if (t.type !== 'expense') return false
        const transactionYear = new Date(t.date).getFullYear()
        if (transactionYear !== selectedYear) return false

        // Check if transaction references this aircraft
        const ref = t.reference?.toLowerCase() || ''
        const desc = t.description?.toLowerCase() || ''
        const aircraftRef = ac.registration.toLowerCase()

        return ref.includes(aircraftRef) || desc.includes(aircraftRef)
      })

      const additionalCosts = aircraftTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      )

      variableCosts += additionalCosts

      const totalCosts = fixedCosts + variableCosts

      const costPerHour = flightHours > 0 ? totalCosts / flightHours : 0
      const costPerStart = starts > 0 ? totalCosts / starts : 0

      costs.push({
        aircraft: ac,
        year: selectedYear,
        fixedCosts,
        variableCosts,
        totalCosts,
        flightHours,
        starts,
        costPerHour,
        costPerStart,
      })
    })

    return costs.sort((a, b) => b.totalCosts - a.totalCosts)
  }

  const aircraftCosts = calculateAircraftCosts()

  // Calculate totals
  const totalFixedCosts = aircraftCosts.reduce((sum, c) => sum + c.fixedCosts, 0)
  const totalVariableCosts = aircraftCosts.reduce((sum, c) => sum + c.variableCosts, 0)
  const totalCosts = aircraftCosts.reduce((sum, c) => sum + c.totalCosts, 0)
  const totalFlightHours = aircraftCosts.reduce((sum, c) => sum + c.flightHours, 0)
  const totalStarts = aircraftCosts.reduce((sum, c) => sum + c.starts, 0)
  const avgCostPerHour = totalFlightHours > 0 ? totalCosts / totalFlightHours : 0
  const avgCostPerStart = totalStarts > 0 ? totalCosts / totalStarts : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Daten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Kostenermittlung
              </h1>
              <p className="text-lg text-slate-600">
                Berechnen Sie die Kosten Ihrer Flugzeuge pro Jahr
              </p>
            </div>
            <Link
              href="/flugzeuge"
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Zurück zu Flugzeugen
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jahr
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Flugzeug
                </label>
                <select
                  value={selectedAircraft}
                  onChange={(e) => setSelectedAircraft(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="all">Alle Flugzeuge</option>
                  {aircraft
                    .filter((ac) => ac.active)
                    .map((ac) => (
                      <option key={ac.id} value={ac.id}>
                        {ac.registration} {ac.name ? `(${ac.name})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Gesamtkosten</span>
                <DollarSign className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {totalCosts.toFixed(2)} €
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Fixkosten</span>
                <TrendingDown className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {totalFixedCosts.toFixed(2)} €
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Variable Kosten</span>
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {totalVariableCosts.toFixed(2)} €
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Ø Kosten/Stunde</span>
                <Calculator className="w-5 h-5 text-violet-500" />
              </div>
              <p className="text-3xl font-bold text-violet-600">
                {avgCostPerHour.toFixed(2)} €
              </p>
            </div>
          </div>

          {/* Aircraft Costs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Kostenübersicht pro Flugzeug ({selectedYear})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Flugzeug
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Fixkosten
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Variable Kosten
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Gesamtkosten
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Flugstunden
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Starts
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Kosten/Stunde
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Kosten/Start
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aircraftCosts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Keine Daten für das ausgewählte Jahr verfügbar.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {aircraftCosts.map((cost) => (
                        <tr
                          key={cost.aircraft.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="font-semibold text-slate-900">
                              {cost.aircraft.registration}
                            </div>
                            {cost.aircraft.name && (
                              <div className="text-sm text-slate-500">{cost.aircraft.name}</div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right text-blue-600 font-medium">
                            {cost.fixedCosts.toFixed(2)} €
                          </td>
                          <td className="py-4 px-6 text-right text-orange-600 font-medium">
                            {cost.variableCosts.toFixed(2)} €
                          </td>
                          <td className="py-4 px-6 text-right font-bold text-slate-900">
                            {cost.totalCosts.toFixed(2)} €
                          </td>
                          <td className="py-4 px-6 text-right text-slate-600">
                            {cost.flightHours.toFixed(1)} h
                          </td>
                          <td className="py-4 px-6 text-right text-slate-600">
                            {cost.starts}
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-violet-600">
                            {cost.costPerHour > 0 ? (
                              <>{cost.costPerHour.toFixed(2)} €</>
                            ) : (
                              <span className="text-slate-400">–</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-violet-600">
                            {cost.costPerStart > 0 ? (
                              <>{cost.costPerStart.toFixed(2)} €</>
                            ) : (
                              <span className="text-slate-400">–</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* Total Row */}
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-4 px-6">Gesamt</td>
                        <td className="py-4 px-6 text-right text-blue-600">
                          {totalFixedCosts.toFixed(2)} €
                        </td>
                        <td className="py-4 px-6 text-right text-orange-600">
                          {totalVariableCosts.toFixed(2)} €
                        </td>
                        <td className="py-4 px-6 text-right text-slate-900">
                          {totalCosts.toFixed(2)} €
                        </td>
                        <td className="py-4 px-6 text-right text-slate-600">
                          {totalFlightHours.toFixed(1)} h
                        </td>
                        <td className="py-4 px-6 text-right text-slate-600">
                          {totalStarts}
                        </td>
                        <td className="py-4 px-6 text-right text-violet-600">
                          {avgCostPerHour > 0 ? (
                            <>{avgCostPerHour.toFixed(2)} €</>
                          ) : (
                            <span className="text-slate-400">–</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right text-violet-600">
                          {avgCostPerStart > 0 ? (
                            <>{avgCostPerStart.toFixed(2)} €</>
                          ) : (
                            <span className="text-slate-400">–</span>
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
