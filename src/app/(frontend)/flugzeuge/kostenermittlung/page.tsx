'use client'

import React, { useState, useEffect } from 'react'
import {
  Calculator,
  Plane,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Fuel,
  Wrench,
} from 'lucide-react'
import Link from 'next/link'

type Aircraft = {
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

type TransactionData = {
  id: string
  date: string
  amount: number
  type: 'income' | 'expense'
  description?: string
  reference?: string
  category?: {
    id: string
    name: string
  }
  costAllocations?: Array<{
    allocationType?: 'aircraft' | 'generalCost'
    aircraft?: string | Aircraft
    generalCost?: string | { id: string; name: string }
    weight: number
  }>
}

type FlightLog = {
  id: string
  aircraft: string | Aircraft
  year: number
  starts: number
  flightHours: number
}

type FuelEntry = {
  id: string
  date: string
  aircraft: string | Aircraft
  fuelType: 'avgas' | 'mogas'
  liters: number
  totalPrice: number
  pricePerLiter: number
}

type AircraftFinancialData = {
  aircraft: Aircraft
  year: number
  revenues: {
    total: number
    transactions: TransactionData[]
  }
  costs: {
    fixed: number
    variable: number
    fuel: number
    maintenance: number
    depreciation: number
    fromTransactions: number
    total: number
    transactions: TransactionData[]
  }
  flightHours: number
  starts: number
  fuelConsumption: number
  fuelEntries: {
    totalLiters: number
    totalCost: number
    avgasLiters: number
    avgasCost: number
    mogasLiters: number
    mogasCost: number
    entries: FuelEntry[]
  }
  costPerHour: number
  costPerStart: number
  profit: number
}

export default function KostenermittlungPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([])
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [fuelEntries, setFuelEntries] = useState<FuelEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYears, setSelectedYears] = useState<number[]>([new Date().getFullYear()])
  const [selectedAircraft, setSelectedAircraft] = useState<string>('all')
  const [expandedAircraft, setExpandedAircraft] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [aircraftRes, flightLogsRes, transactionsRes, fuelEntriesRes] = await Promise.all([
        fetch('/api/aircraft'),
        fetch('/api/flight-logs'),
        fetch('/api/transactions?depth=2'),
        fetch('/api/fuel-entries'),
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
        // Debug: Log transactions with allocations
        const transactionsWithAllocations = (data.docs || []).filter((t: TransactionData) => 
          t.costAllocations && Array.isArray(t.costAllocations) && t.costAllocations.length > 0
        )
        if (transactionsWithAllocations.length > 0) {
          console.log('Transaktionen mit Zuordnungen gefunden:', transactionsWithAllocations.length)
          console.log('Beispiel-Transaktion:', transactionsWithAllocations[0])
        }
      }

      if (fuelEntriesRes.ok) {
        const data = await fuelEntriesRes.json()
        setFuelEntries(data.docs || [])
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
      ...flightLogs.map((log: FlightLog) => log.year),
      ...transactions.map((t: TransactionData) => new Date(t.date).getFullYear()),
      ...fuelEntries.map((fe: FuelEntry) => new Date(fe.date).getFullYear()),
    ])
  ).sort((a: number, b: number) => b - a)

  // Calculate financial data for each aircraft
  const calculateAircraftFinancials = (): AircraftFinancialData[] => {
    const financials: AircraftFinancialData[] = []

    aircraft.forEach((ac: Aircraft) => {
      if (selectedAircraft !== 'all' && ac.id !== selectedAircraft) return

      selectedYears.forEach((year: number) => {
        // Get flight log for this year
        const flightLog = flightLogs.find(
          (log: FlightLog) =>
            (typeof log.aircraft === 'object' ? log.aircraft.id : log.aircraft) === ac.id &&
            log.year === year
        )

        const flightHours = flightLog?.flightHours || 0
        const starts = flightLog?.starts || 0

        // Calculate fixed costs
        const fixedCosts =
          (ac.insurance || 0) + (ac.hangar || 0) + (ac.annualInspection || 0) + (ac.fixedCosts || 0)

        // Get fuel entries for this aircraft and year
        const aircraftFuelEntries = fuelEntries.filter((fe: FuelEntry) => {
          const aircraftId = typeof fe.aircraft === 'object' ? fe.aircraft.id : fe.aircraft
          const entryYear = new Date(fe.date).getFullYear()
          return aircraftId === ac.id && entryYear === year
        })

        // Calculate fuel costs from actual fuel entries
        const fuelCostsFromEntries = aircraftFuelEntries.reduce(
          (sum: number, fe: FuelEntry) => sum + (fe.totalPrice || 0),
          0
        )

        // Calculate fuel costs (use actual entries if available, otherwise use estimated)
        const fuelCosts =
          fuelCostsFromEntries > 0
            ? fuelCostsFromEntries
            : ac.fuelConsumption && ac.fuelPrice
              ? flightHours * ac.fuelConsumption * ac.fuelPrice
              : 0

        // Calculate fuel consumption from entries
        const fuelLitersFromEntries = aircraftFuelEntries.reduce(
          (sum: number, fe: FuelEntry) => sum + (fe.liters || 0),
          0
        )

        // Separate Avgas and Mogas
        const avgasEntries = aircraftFuelEntries.filter((fe: FuelEntry) => fe.fuelType === 'avgas')
        const mogasEntries = aircraftFuelEntries.filter((fe: FuelEntry) => fe.fuelType === 'mogas')

        const avgasLiters = avgasEntries.reduce((sum: number, fe: FuelEntry) => sum + (fe.liters || 0), 0)
        const avgasCost = avgasEntries.reduce((sum: number, fe: FuelEntry) => sum + (fe.totalPrice || 0), 0)

        const mogasLiters = mogasEntries.reduce((sum: number, fe: FuelEntry) => sum + (fe.liters || 0), 0)
        const mogasCost = mogasEntries.reduce((sum: number, fe: FuelEntry) => sum + (fe.totalPrice || 0), 0)

        // Calculate maintenance costs
        const maintenanceCosts = ac.maintenanceCostPerHour ? flightHours * ac.maintenanceCostPerHour : 0

        // Get revenues from transactions
        const revenueTransactions = transactions.filter((t: TransactionData) => {
          if (t.type !== 'income') return false
          const transactionYear = new Date(t.date).getFullYear()
          if (transactionYear !== year) return false

          // Check if transaction has cost allocations for this aircraft
          if (t.costAllocations && Array.isArray(t.costAllocations)) {
            return t.costAllocations.some((allocation) => {
              const allocationType = allocation.allocationType || (allocation.aircraft ? 'aircraft' : 'generalCost')
              if (allocationType !== 'aircraft') return false
              const aircraftId =
                typeof allocation.aircraft === 'object' ? allocation.aircraft.id : allocation.aircraft
              return aircraftId === ac.id
            })
          }

          // Fallback: Check if transaction references this aircraft
          const ref = t.reference?.toLowerCase() || ''
          const desc = t.description?.toLowerCase() || ''
          const aircraftRef = ac.registration.toLowerCase()

          return ref.includes(aircraftRef) || desc.includes(aircraftRef)
        })

        // Calculate weighted revenues
        const totalRevenue = revenueTransactions.reduce((sum: number, t: TransactionData) => {
          if (t.costAllocations && Array.isArray(t.costAllocations)) {
            const allocation = t.costAllocations.find((alloc) => {
              const allocationType = alloc.allocationType || (alloc.aircraft ? 'aircraft' : 'generalCost')
              if (allocationType !== 'aircraft') return false
              const aircraftId =
                typeof alloc.aircraft === 'object' ? alloc.aircraft.id : alloc.aircraft
              return aircraftId === ac.id
            })
            if (allocation) {
              return sum + (t.amount * allocation.weight) / 100
            }
          }
          return sum + t.amount
        }, 0)

        // Get costs from transactions
        const costTransactions = transactions.filter((t: TransactionData) => {
          if (t.type !== 'expense') return false
          const transactionYear = new Date(t.date).getFullYear()
          if (transactionYear !== year) return false

          // Check if transaction has cost allocations for this aircraft
          if (t.costAllocations && Array.isArray(t.costAllocations) && t.costAllocations.length > 0) {
            const hasAllocation = t.costAllocations.some((allocation) => {
              const allocationType = allocation.allocationType || (allocation.aircraft ? 'aircraft' : 'generalCost')
              if (allocationType !== 'aircraft') return false
              
              // Handle both string ID and populated object
              let aircraftId: string | null = null
              if (typeof allocation.aircraft === 'string') {
                aircraftId = allocation.aircraft
              } else if (allocation.aircraft && typeof allocation.aircraft === 'object' && 'id' in allocation.aircraft) {
                aircraftId = allocation.aircraft.id
              }
              
              return aircraftId === ac.id
            })
            
            // Debug logging for first transaction
            if (hasAllocation && costTransactions.length === 0) {
              console.log('Gefundene Transaktion mit Zuordnung:', {
                transactionId: t.id,
                description: t.description,
                amount: t.amount,
                allocations: t.costAllocations,
                aircraftId: ac.id,
                registration: ac.registration
              })
            }
            
            return hasAllocation
          }

          // Fallback: Check if transaction references this aircraft
          const ref = t.reference?.toLowerCase() || ''
          const desc = t.description?.toLowerCase() || ''
          const aircraftRef = ac.registration.toLowerCase()

          return ref.includes(aircraftRef) || desc.includes(aircraftRef)
        })

        // Calculate weighted costs from transactions
        const costsFromTransactions = costTransactions.reduce((sum: number, t: TransactionData) => {
          if (t.costAllocations && Array.isArray(t.costAllocations) && t.costAllocations.length > 0) {
            const allocation = t.costAllocations.find((alloc) => {
              const allocationType = alloc.allocationType || (alloc.aircraft ? 'aircraft' : 'generalCost')
              if (allocationType !== 'aircraft') return false
              
              // Handle both string ID and populated object
              let aircraftId: string | null = null
              if (typeof alloc.aircraft === 'string') {
                aircraftId = alloc.aircraft
              } else if (alloc.aircraft && typeof alloc.aircraft === 'object' && 'id' in alloc.aircraft) {
                aircraftId = alloc.aircraft.id
              }
              
              return aircraftId === ac.id
            })
            if (allocation) {
              // Betrag ist bereits positiv (durch beforeChange Hook), daher direkt verwenden
              const weightedAmount = (t.amount * allocation.weight) / 100
              return sum + weightedAmount
            }
            // Wenn keine passende Zuordnung gefunden wurde, nicht addieren (nur zugeordnete Kosten zählen)
            return sum
          }
          // Wenn keine costAllocations vorhanden sind, nicht addieren (nur zugeordnete Kosten zählen)
          return sum
        }, 0)

        const variableCosts = fuelCosts + maintenanceCosts
        const totalCosts = fixedCosts + variableCosts + costsFromTransactions

        const costPerHour = flightHours > 0 ? totalCosts / flightHours : 0
        const costPerStart = starts > 0 ? totalCosts / starts : 0
        const profit = totalRevenue - totalCosts

        financials.push({
          aircraft: ac,
          year,
          revenues: {
            total: totalRevenue,
            transactions: revenueTransactions,
          },
          costs: {
            fixed: fixedCosts,
            variable: variableCosts,
            fuel: fuelCosts,
            maintenance: maintenanceCosts,
            depreciation: 0, // TODO: Implement depreciation calculation
            fromTransactions: costsFromTransactions,
            total: totalCosts,
            transactions: costTransactions,
          },
          flightHours,
          starts,
          fuelConsumption: ac.fuelConsumption || 0,
          fuelEntries: {
            totalLiters: fuelLitersFromEntries,
            totalCost: fuelCostsFromEntries,
            avgasLiters,
            avgasCost,
            mogasLiters,
            mogasCost,
            entries: aircraftFuelEntries,
          },
          costPerHour,
          costPerStart,
          profit,
        })
      })
    })

    return financials.sort((a, b) => {
      if (a.aircraft.registration < b.aircraft.registration) return -1
      if (a.aircraft.registration > b.aircraft.registration) return 1
      return b.year - a.year
    })
  }

  const financialData = calculateAircraftFinancials()

  // Group by aircraft
  const groupedByAircraft = financialData.reduce((acc, data) => {
    const key = data.aircraft.id
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(data)
    return acc
  }, {} as Record<string, AircraftFinancialData[]>)

  // Group aircraft by type
  const aircraftByGroup = aircraft.reduce((acc: Record<string, Aircraft[]>, ac: Aircraft) => {
    if (!acc[ac.aircraftGroup]) {
      acc[ac.aircraftGroup] = []
    }
    acc[ac.aircraftGroup].push(ac)
    return acc
  }, {} as Record<string, Aircraft[]>)

  const groupLabels: Record<string, string> = {
    ul: 'Ultraleicht (UL)',
    glider: 'Segelflugzeug',
    motor: 'Motorflugzeug',
    'motor-glider': 'Motorsegler',
    helicopter: 'Hubschrauber',
    other: 'Sonstige',
  }

  const toggleAircraft = (aircraftId: string) => {
    const newExpanded = new Set(expandedAircraft)
    if (newExpanded.has(aircraftId)) {
      newExpanded.delete(aircraftId)
    } else {
      newExpanded.add(aircraftId)
    }
    setExpandedAircraft(newExpanded)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Lade Daten...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/flugzeuge"
              className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zu Flugzeugen
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                  Flugzeugkosten
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Erlöse und Kosten pro Flugzeug</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Jahr(e) auswählen
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        if (selectedYears.includes(year)) {
                          setSelectedYears(selectedYears.filter((y: number) => y !== year))
                        } else {
                          setSelectedYears([...selectedYears, year].sort((a: number, b: number) => b - a))
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedYears.includes(year)
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Flugzeug filtern
                </label>
                <select
                  value={selectedAircraft}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAircraft(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">Alle Flugzeuge</option>
                  {aircraft
                    .filter((ac: Aircraft) => ac.active)
                    .map((ac: Aircraft) => (
                      <option key={ac.id} value={ac.id}>
                        {ac.registration} {ac.name ? `(${ac.name})` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Financial Overview by Aircraft Group */}
          {Object.entries(aircraftByGroup).map(([group, groupAircraft]) => {
            const aircraftList = groupAircraft as Aircraft[]
            const groupFinancials = financialData.filter((f) =>
              aircraftList.some((ac) => ac.id === f.aircraft.id)
            )

            if (groupFinancials.length === 0) return null

            const groupRevenue = groupFinancials.reduce((sum, f) => sum + f.revenues.total, 0)
            const groupCosts = groupFinancials.reduce((sum, f) => sum + f.costs.total, 0)
            const groupProfit = groupRevenue - groupCosts

            return (
              <div key={group} className="mb-8">
                {/* Group Header */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-6 mb-4">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    {groupLabels[group] || group}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Gesamterlöse</div>
                      <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        {groupRevenue.toFixed(2)} €
                      </div>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                      <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Gesamtkosten</div>
                      <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {groupCosts.toFixed(2)} €
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-xl border ${
                        groupProfit >= 0
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      }`}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          groupProfit >= 0 ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'
                        }`}
                      >
                        {groupProfit >= 0 ? 'Gewinn' : 'Verlust'}
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          groupProfit >= 0 ? 'text-blue-900 dark:text-blue-100' : 'text-orange-900 dark:text-orange-100'
                        }`}
                      >
                        {groupProfit >= 0 ? '+' : ''}
                        {groupProfit.toFixed(2)} €
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aircraft Details */}
                {aircraftList
                  .filter((ac: Aircraft) => selectedAircraft === 'all' || ac.id === selectedAircraft)
                  .map((ac: Aircraft) => {
                    const aircraftFinancials = groupedByAircraft[ac.id] || []
                    if (aircraftFinancials.length === 0) return null

                    const isExpanded = expandedAircraft.has(ac.id)

                    // Calculate totals across all years
                    const totalRevenue = aircraftFinancials.reduce(
                      (sum, f) => sum + f.revenues.total,
                      0
                    )
                    const totalCosts = aircraftFinancials.reduce((sum, f) => sum + f.costs.total, 0)
                    const totalProfit = totalRevenue - totalCosts

                    return (
                      <div
                        key={ac.id}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden mb-4"
                      >
                        {/* Aircraft Header */}
                        <button
                          onClick={() => toggleAircraft(ac.id)}
                          className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl">
                              <Plane className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                {ac.registration}
                              </h3>
                              {ac.name && (
                                <p className="text-sm text-slate-600 dark:text-slate-400">{ac.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-sm text-slate-600 dark:text-slate-400">Erlöse</div>
                              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                {totalRevenue.toFixed(2)} €
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-slate-600 dark:text-slate-400">Kosten</div>
                              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {totalCosts.toFixed(2)} €
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {totalProfit >= 0 ? 'Gewinn' : 'Verlust'}
                              </div>
                              <div
                                className={`text-lg font-bold ${
                                  totalProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'
                                }`}
                              >
                                {totalProfit >= 0 ? '+' : ''}
                                {totalProfit.toFixed(2)} €
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="border-t border-slate-200 dark:border-slate-700 p-6">
                            {selectedYears.map((year: number) => {
                              const yearData = aircraftFinancials.find((f: AircraftFinancialData) => f.year === year)
                              if (!yearData) return null

                              return (
                                <div key={year} className="mb-6 last:mb-0">
                                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                                    {year}
                                  </h4>

                                  {/* Revenues Section */}
                                  <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                      <h5 className="font-semibold text-emerald-700 dark:text-emerald-300">Erlöse</h5>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 mb-2">
                                      {yearData.revenues.transactions.length > 0 ? (
                                        <div className="space-y-2">
                                          {yearData.revenues.transactions.map((t) => (
                                            <div
                                              key={t.id}
                                              className="flex justify-between items-center text-sm"
                                            >
                                              <span className="text-slate-700 dark:text-slate-300">
                                                {t.description || t.reference || 'Erlös'}
                                              </span>
                                              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                                {t.amount.toFixed(2)} €
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-slate-500 dark:text-slate-400">Keine Erlöse</div>
                                      )}
                                      <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 flex justify-between items-center font-bold">
                                        <span className="text-emerald-900 dark:text-emerald-100">Gesamtsumme</span>
                                        <span className="text-emerald-900 dark:text-emerald-100">
                                          {yearData.revenues.total.toFixed(2)} €
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Costs Section */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                                      <h5 className="font-semibold text-red-700 dark:text-red-300">Kosten</h5>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 space-y-3">
                                      {/* Fixed Costs */}
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-700 dark:text-slate-300">Fixkosten</span>
                                        <span className="font-medium text-red-700 dark:text-red-300">
                                          {yearData.costs.fixed.toFixed(2)} €
                                        </span>
                                      </div>

                                      {/* Fuel Costs */}
                                      {yearData.costs.fuel > 0 && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                              <Fuel className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                              <span className="text-slate-700 dark:text-slate-300">
                                                Kraftstoff
                                                {yearData.fuelEntries.totalLiters > 0
                                                  ? ` (${yearData.fuelEntries.totalLiters.toFixed(2)} l)`
                                                  : yearData.fuelConsumption
                                                    ? ` (${yearData.fuelConsumption} l/h geschätzt)`
                                                    : ''}
                                              </span>
                                            </div>
                                            <span className="font-medium text-red-700 dark:text-red-300">
                                              {yearData.costs.fuel.toFixed(2)} €
                                            </span>
                                          </div>
                                          {/* Fuel Details */}
                                          {yearData.fuelEntries.totalLiters > 0 && (
                                            <div className="ml-6 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                              {yearData.fuelEntries.avgasLiters > 0 && (
                                                <div className="flex justify-between">
                                                  <span>Avgas: {yearData.fuelEntries.avgasLiters.toFixed(2)} l</span>
                                                  <span>{yearData.fuelEntries.avgasCost.toFixed(2)} €</span>
                                                </div>
                                              )}
                                              {yearData.fuelEntries.mogasLiters > 0 && (
                                                <div className="flex justify-between">
                                                  <span>Mogas: {yearData.fuelEntries.mogasLiters.toFixed(2)} l</span>
                                                  <span>{yearData.fuelEntries.mogasCost.toFixed(2)} €</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Maintenance Costs */}
                                      {yearData.costs.maintenance > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                          <div className="flex items-center gap-2">
                                            <Wrench className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            <span className="text-slate-700 dark:text-slate-300">Wartung</span>
                                          </div>
                                          <span className="font-medium text-red-700 dark:text-red-300">
                                            {yearData.costs.maintenance.toFixed(2)} €
                                          </span>
                                        </div>
                                      )}

                                      {/* Costs from Transactions */}
                                      {yearData.costs.transactions.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                                            Weitere Kosten aus Transaktionen:
                                          </div>
                                          {yearData.costs.transactions.map((t) => {
                                            // Berechne den gewichteten Betrag für diese Transaktion
                                            const allocation = t.costAllocations?.find((alloc) => {
                                              const allocationType = alloc.allocationType || (alloc.aircraft ? 'aircraft' : 'generalCost')
                                              if (allocationType !== 'aircraft') return false
                                              
                                              // Handle both string ID and populated object
                                              let aircraftId: string | null = null
                                              if (typeof alloc.aircraft === 'string') {
                                                aircraftId = alloc.aircraft
                                              } else if (alloc.aircraft && typeof alloc.aircraft === 'object' && 'id' in alloc.aircraft) {
                                                aircraftId = alloc.aircraft.id
                                              }
                                              
                                              return aircraftId === ac.id
                                            })
                                            const weightedAmount = allocation 
                                              ? (t.amount * allocation.weight) / 100
                                              : t.amount
                                            
                                            return (
                                              <div
                                                key={t.id}
                                                className="flex justify-between items-center text-sm mb-1"
                                              >
                                                <span className="text-slate-700 dark:text-slate-300">
                                                  {t.description || t.reference || 'Kosten'}
                                                  {allocation && allocation.weight < 100 && (
                                                    <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                                      ({allocation.weight.toFixed(0)}%)
                                                    </span>
                                                  )}
                                                </span>
                                                <span className="font-medium text-red-700 dark:text-red-300">
                                                  {weightedAmount.toFixed(2)} €
                                                </span>
                                              </div>
                                            )
                                          })}
                                          <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800 flex justify-between items-center text-sm font-medium">
                                            <span className="text-slate-700 dark:text-slate-300">Summe</span>
                                            <span className="text-red-700 dark:text-red-300">
                                              {yearData.costs.fromTransactions.toFixed(2)} €
                                            </span>
                                          </div>
                                        </div>
                                      )}

                                      {/* Total Costs */}
                                      <div className="mt-3 pt-3 border-t-2 border-red-300 dark:border-red-700 flex justify-between items-center font-bold">
                                        <span className="text-red-900 dark:text-red-100">Gesamtsumme</span>
                                        <span className="text-red-900 dark:text-red-100">
                                          {yearData.costs.total.toFixed(2)} €
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Summary */}
                                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Flugstunden</div>
                                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {yearData.flightHours.toFixed(1)} h
                                      </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Starts</div>
                                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                        {yearData.starts}
                                      </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Kosten/Stunde</div>
                                      <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                                        {yearData.costPerHour > 0
                                          ? `${yearData.costPerHour.toFixed(2)} €`
                                          : '–'}
                                      </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Kosten/Start</div>
                                      <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                                        {yearData.costPerStart > 0
                                          ? `${yearData.costPerStart.toFixed(2)} €`
                                          : '–'}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            )
          })}

          {financialData.length === 0 && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-12 text-center">
              <Plane className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Keine Daten für die ausgewählten Filter verfügbar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
