'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'

interface YearStats {
  year: number
  income: number
  expenses: number
  balance: number
  transactionCount: number
}

interface Aircraft {
  id: string
  registration: string
  name?: string
  active?: boolean
}

interface GeneralCost {
  id: string
  name: string
  availableForIncome: boolean
  availableForExpense: boolean
  active: boolean
  parent?: string | null
}

type GroupType = 'aircraft' | 'generalCost'

export default function KostenstellenvergleichPage() {
  const [groupType, setGroupType] = useState<GroupType>('generalCost')
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [generalCosts, setGeneralCosts] = useState<GeneralCost[]>([])
  const [selectedRootId, setSelectedRootId] = useState<string>('')
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedLabel, setSelectedLabel] = useState<string>('')
  const [stats, setStats] = useState<YearStats[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingStats, setLoadingStats] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupType, selectedId])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const [aircraftRes, generalCostsRes] = await Promise.all([
        fetch('/api/aircraft'),
        fetch('/api/general-costs?activeOnly=true'),
      ])

      if (aircraftRes.ok) {
        const data = await aircraftRes.json()
        setAircraft((data.docs || []).filter((ac: Aircraft) => ac.active !== false))
      }

      if (generalCostsRes.ok) {
        const data = await generalCostsRes.json()
        setGeneralCosts((data.docs || []).filter((gc: GeneralCost) => gc.active))
      }
    } catch (error) {
      console.error('Fehler beim Laden der Gruppen:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!selectedId) return
    try {
      setLoadingStats(true)
      const params = new URLSearchParams({
        groupType,
        groupId: selectedId,
      })
      const response = await fetch(`/api/transactions/group-stats?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Gruppenauswertung:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleGroupTypeChange = (type: GroupType) => {
    setGroupType(type)
    setSelectedRootId('')
    setSelectedId('')
    setSelectedLabel('')
    setStats([])
  }

  const handleAircraftSelectionChange = (id: string) => {
    setSelectedId(id)
    const ac = aircraft.find((a) => a.id === id)
    setSelectedLabel(ac ? `${ac.registration}${ac.name ? ` (${ac.name})` : ''}` : '')
  }

  const handleRootCostSelectionChange = (id: string) => {
    setSelectedRootId(id)

    if (!id) {
      setSelectedId('')
      setSelectedLabel('')
      return
    }

    const root = generalCosts.find((g) => g.id === id)
    setSelectedId(id)
    setSelectedLabel(root ? `${root.name} (Gesamt)` : '')
  }

  const handleDetailCostSelectionChange = (id: string) => {
    if (!selectedRootId) return

    if (!id) {
      // Gesamtansicht der Obergruppe
      const root = generalCosts.find((g) => g.id === selectedRootId)
      setSelectedId(selectedRootId)
      setSelectedLabel(root ? `${root.name} (Gesamt)` : '')
      return
    }

    setSelectedId(id)
    const gc = generalCosts.find((g) => g.id === id)
    setSelectedLabel(gc ? gc.name : '')
  }

  const totalIncome = stats.reduce((sum, s) => sum + s.income, 0)
  const totalExpenses = stats.reduce((sum, s) => sum + s.expenses, 0)
  const totalBalance = totalIncome - totalExpenses

  const maxValue = Math.max(
    ...stats.map((s) => Math.max(s.income, s.expenses)),
    0,
  )

  const rootGeneralCosts = generalCosts.filter((gc) => !gc.parent)
  const detailGeneralCosts = selectedRootId
    ? generalCosts.filter((gc) => gc.parent === selectedRootId)
    : []

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
                Kostenstellenvergleich
              </h1>
              <p className="text-lg text-slate-600">
                Vergleichen Sie die Kosten einer ausgewählten Kostenstelle über die Jahre.
              </p>
            </div>
            <Link
              href="/kontobewegungen/uebersicht"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Übersicht
            </Link>
          </div>

          {/* Auswahl */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gruppe
                </label>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => handleGroupTypeChange('generalCost')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                      groupType === 'generalCost'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Allgemeine Kosten
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGroupTypeChange('aircraft')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                      groupType === 'aircraft'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Flugzeuge
                  </button>
                </div>
              </div>
              {groupType === 'aircraft' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Flugzeug
                  </label>
                  <select
                    value={selectedId}
                    onChange={(e) => handleAircraftSelectionChange(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900"
                  >
                    <option value="">Bitte auswählen...</option>
                    {aircraft.map((ac) => (
                      <option key={ac.id} value={ac.id}>
                        {ac.registration}
                        {ac.name ? ` (${ac.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Obergruppe
                    </label>
                    <select
                      value={selectedRootId}
                      onChange={(e) => handleRootCostSelectionChange(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900"
                    >
                      <option value="">Bitte auswählen...</option>
                      {rootGeneralCosts.map((gc) => (
                        <option key={gc.id} value={gc.id}>
                          {gc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedRootId && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Detailgruppe
                      </label>
                      <select
                        value={
                          selectedId && selectedId !== selectedRootId ? selectedId : ''
                        }
                        onChange={(e) => handleDetailCostSelectionChange(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-900"
                      >
                        <option value="">Gesamt (alle Untergruppen)</option>
                        {detailGeneralCosts.map((gc) => (
                          <option key={gc.id} value={gc.id}>
                            {gc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
              <div>
                {selectedLabel && (
                  <div className="text-sm text-slate-500">
                    Auswahl:{' '}
                    <span className="font-medium text-slate-900">
                      {selectedLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {selectedId && stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Gesamt Einnahmen
                  </span>
                  <ArrowUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {totalIncome.toFixed(2)} €
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Gesamt Ausgaben
                  </span>
                  <ArrowDown className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {totalExpenses.toFixed(2)} €
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    Saldo
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {totalBalance >= 0 ? '+' : ''}
                  {totalBalance.toFixed(2)} €
                </p>
              </div>
            </div>
          )}

          {/* Tabelle & Balken */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-500" />
              <h2 className="text-xl font-bold text-slate-900">
                Jahresübersicht der ausgewählten Kostenstelle
              </h2>
            </div>
            {loadingStats ? (
              <div className="p-6 text-slate-600">Lade Auswertungen...</div>
            ) : !selectedId ? (
              <div className="p-6 text-slate-500">
                Bitte wählen Sie oben eine Kostengruppe oder ein Flugzeug aus.
              </div>
            ) : stats.length === 0 ? (
              <div className="p-6 text-slate-500">
                Für die ausgewählte Kostenstelle liegen noch keine Bewegungen vor.
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                          Jahr
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                          Einnahmen
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                          Ausgaben
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                          Saldo
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
                          Bewegungen
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats
                        .slice()
                        .sort((a, b) => b.year - a.year)
                        .map((s, index, arr) => {
                          const prev = index < arr.length - 1 ? arr[index + 1] : null
                          const expenseChange =
                            prev && prev.expenses !== 0
                              ? ((s.expenses - prev.expenses) / prev.expenses) * 100
                              : null

                          return (
                            <tr key={s.year} className="border-b border-slate-100">
                              <td className="py-3 px-4 text-sm font-medium text-slate-900">
                                {s.year}
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-emerald-600">
                                {s.income.toFixed(2)} €
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-red-600">
                                <div className="flex flex-col items-end gap-0.5">
                                  <span>{s.expenses.toFixed(2)} €</span>
                                  {expenseChange !== null && (
                                    <span
                                      className={`text-[11px] flex items-center gap-1 ${
                                        expenseChange > 0
                                          ? 'text-red-600'
                                          : 'text-emerald-600'
                                      }`}
                                    >
                                      {expenseChange > 0 ? '▲' : '▼'}{' '}
                                      {Math.abs(expenseChange).toFixed(1)}% ggü. Vorjahr
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td
                                className={`py-3 px-4 text-sm text-right font-semibold ${
                                  s.balance >= 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}
                              >
                                {s.balance >= 0 ? '+' : ''}
                                {s.balance.toFixed(2)} €
                              </td>
                              <td className="py-3 px-4 text-sm text-right text-slate-600">
                                {s.transactionCount}
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>

                {/* Visueller Vergleich */}
                <div className="space-y-4">
                  {stats
                    .slice()
                    .sort((a, b) => b.year - a.year)
                    .map((s) => {
                      const incomePercent =
                        maxValue > 0 ? (s.income / maxValue) * 100 : 0
                      const expensePercent =
                        maxValue > 0 ? (s.expenses / maxValue) * 100 : 0
                      const incomeWidth =
                        incomePercent > 0 ? Math.max(incomePercent, 4) : 0
                      const expenseWidth =
                        expensePercent > 0 ? Math.max(expensePercent, 4) : 0

                      return (
                        <div key={s.year}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900">
                              {s.year}
                            </span>
                            <div className="flex gap-4 text-sm">
                              <span className="text-emerald-600">
                                Einnahmen: {s.income.toFixed(2)} €
                              </span>
                              <span className="text-red-600">
                                Ausgaben: {s.expenses.toFixed(2)} €
                              </span>
                            </div>
                          </div>
                          <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
                            <div className="flex h-full w-full">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-end pr-3"
                                style={{ width: `${incomeWidth}%` }}
                              >
                                {incomePercent > 0 && (
                                  <span className="text-[11px] font-semibold text-white whitespace-nowrap drop-shadow-sm">
                                    {s.income.toFixed(0)} € (
                                    {incomePercent.toFixed(1)}%)
                                  </span>
                                )}
                              </div>
                              <div
                                className="h-full bg-gradient-to-r from-rose-400 to-rose-600 flex items-center justify-start pl-3"
                                style={{ width: `${expenseWidth}%` }}
                              >
                                {expensePercent > 0 && (
                                  <span className="text-[11px] font-semibold text-white whitespace-nowrap drop-shadow-sm">
                                    {s.expenses.toFixed(0)} € (
                                    {expensePercent.toFixed(1)}%)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

