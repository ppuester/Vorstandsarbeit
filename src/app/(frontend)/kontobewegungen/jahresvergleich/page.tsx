'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Calendar, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface YearStats {
  year: number
  income: number
  expenses: number
  balance: number
  transactionCount: number
}

export default function JahresvergleichPage() {
  const [yearStats, setYearStats] = useState<YearStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYears, setSelectedYears] = useState<number[]>([])

  useEffect(() => {
    fetchYearStats()
  }, [])

  const fetchYearStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions/yearly-stats')
      if (response.ok) {
        const data = await response.json()
        setYearStats(data)
        // Select all years by default
        setSelectedYears(data.map((stat: YearStats) => stat.year))
      }
    } catch (error) {
      console.error('Fehler beim Laden der Jahresstatistiken:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    )
  }

  const selectedStats = yearStats.filter((stat) => selectedYears.includes(stat.year))

  // Calculate totals for selected years
  const totalIncome = selectedStats.reduce((sum, stat) => sum + stat.income, 0)
  const totalExpenses = selectedStats.reduce((sum, stat) => sum + stat.expenses, 0)
  const totalBalance = totalIncome - totalExpenses
  const avgIncome = selectedStats.length > 0 ? totalIncome / selectedStats.length : 0
  const avgExpenses = selectedStats.length > 0 ? totalExpenses / selectedStats.length : 0
  const avgBalance = selectedStats.length > 0 ? totalBalance / selectedStats.length : 0

  // Find min/max values for chart scaling
  const maxValue = Math.max(
    ...yearStats.map((s) => Math.max(s.income, s.expenses)),
    0
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Jahresstatistiken...</p>
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
                Jahresvergleich
              </h1>
              <p className="text-lg text-slate-600">
                Vergleichen Sie Einnahmen, Ausgaben und Überschüsse über die Jahre
              </p>
            </div>
            <Link
              href="/kontobewegungen/uebersicht"
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Zurück zur Übersicht
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Gesamt Einnahmen</span>
                <ArrowUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {totalIncome.toFixed(2)} €
              </p>
              {selectedStats.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Ø {avgIncome.toFixed(2)} € pro Jahr
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Gesamt Ausgaben</span>
                <ArrowDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {totalExpenses.toFixed(2)} €
              </p>
              {selectedStats.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Ø {avgExpenses.toFixed(2)} € pro Jahr
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Gesamt Saldo</span>
                <span
                  className={`text-2xl font-bold ${
                    totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {totalBalance >= 0 ? '+' : ''}
                  {totalBalance.toFixed(2)} €
                </span>
              </div>
              {selectedStats.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Ø {avgBalance >= 0 ? '+' : ''}
                  {avgBalance.toFixed(2)} € pro Jahr
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Anzahl Jahre</span>
                <Calendar className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {selectedStats.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {yearStats.length} Jahre verfügbar
              </p>
            </div>
          </div>

          {/* Year Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Jahre auswählen</h2>
            <div className="flex flex-wrap gap-3">
              {yearStats
                .sort((a, b) => b.year - a.year)
                .map((stat) => (
                  <button
                    key={stat.year}
                    onClick={() => toggleYear(stat.year)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      selectedYears.includes(stat.year)
                        ? 'border-violet-600 bg-violet-50 text-violet-700 font-semibold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {stat.year}
                  </button>
                ))}
              <button
                onClick={() =>
                  setSelectedYears(
                    selectedYears.length === yearStats.length
                      ? []
                      : yearStats.map((s) => s.year)
                  )
                }
                className="px-4 py-2 rounded-lg border-2 border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 text-sm"
              >
                {selectedYears.length === yearStats.length ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
            </div>
          </div>

          {/* Year Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Jahresvergleich
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Jahr</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Einnahmen
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Ausgaben
                    </th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">Saldo</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">
                      Bewegungen
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Wählen Sie mindestens ein Jahr aus, um den Vergleich anzuzeigen.
                      </td>
                    </tr>
                  ) : (
                    selectedStats
                      .sort((a, b) => b.year - a.year)
                      .map((stat, index) => {
                        const prevStat =
                          index < selectedStats.length - 1
                            ? selectedStats[index + 1]
                            : null
                        const incomeChange = prevStat
                          ? ((stat.income - prevStat.income) / prevStat.income) * 100
                          : 0
                        const expenseChange = prevStat
                          ? ((stat.expenses - prevStat.expenses) / prevStat.expenses) * 100
                          : 0
                        const balanceChange = prevStat
                          ? stat.balance - prevStat.balance
                          : 0

                        return (
                          <tr
                            key={stat.year}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <span className="font-bold text-slate-900">{stat.year}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-semibold text-green-600">
                                  {stat.income.toFixed(2)} €
                                </span>
                                {prevStat && incomeChange !== 0 && (
                                  <span
                                    className={`text-xs flex items-center gap-1 ${
                                      incomeChange > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    {incomeChange > 0 ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3" />
                                    )}
                                    {Math.abs(incomeChange).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="font-semibold text-red-600">
                                  {stat.expenses.toFixed(2)} €
                                </span>
                                {prevStat && expenseChange !== 0 && (
                                  <span
                                    className={`text-xs flex items-center gap-1 ${
                                      expenseChange < 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    {expenseChange < 0 ? (
                                      <TrendingDown className="w-3 h-3" />
                                    ) : (
                                      <TrendingUp className="w-3 h-3" />
                                    )}
                                    {Math.abs(expenseChange).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span
                                  className={`font-bold ${
                                    stat.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {stat.balance >= 0 ? '+' : ''}
                                  {stat.balance.toFixed(2)} €
                                </span>
                                {prevStat && balanceChange !== 0 && (
                                  <span
                                    className={`text-xs ${
                                      balanceChange > 0 ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    {balanceChange > 0 ? '+' : ''}
                                    {balanceChange.toFixed(2)} €
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right text-slate-600">
                              {stat.transactionCount}
                            </td>
                            <td className="py-4 px-6 text-center">
                              {stat.balance >= 0 ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  Überschuss
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                  Defizit
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visual Chart */}
          {selectedStats.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Visueller Vergleich</h2>
              <div className="space-y-6">
                {selectedStats
                  .sort((a, b) => b.year - a.year)
                  .map((stat) => {
                    const incomePercent = maxValue > 0 ? (stat.income / maxValue) * 100 : 0
                    const expensePercent = maxValue > 0 ? (stat.expenses / maxValue) * 100 : 0

                    return (
                      <div key={stat.year}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">{stat.year}</span>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">
                              Einnahmen: {stat.income.toFixed(2)} €
                            </span>
                            <span className="text-red-600">
                              Ausgaben: {stat.expenses.toFixed(2)} €
                            </span>
                            <span
                              className={`font-semibold ${
                                stat.balance >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              Saldo: {stat.balance >= 0 ? '+' : ''}
                              {stat.balance.toFixed(2)} €
                            </span>
                          </div>
                        </div>
                        <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
                          {/* Income Bar */}
                          <div
                            className="absolute left-0 top-0 h-full bg-green-500 rounded-l-lg flex items-center justify-end pr-2"
                            style={{ width: `${incomePercent}%` }}
                          >
                            {incomePercent > 10 && (
                              <span className="text-xs font-medium text-white">
                                {stat.income.toFixed(0)} €
                              </span>
                            )}
                          </div>
                          {/* Expense Bar */}
                          <div
                            className="absolute right-0 top-0 h-full bg-red-500 rounded-r-lg flex items-center justify-start pl-2"
                            style={{ width: `${expensePercent}%` }}
                          >
                            {expensePercent > 10 && (
                              <span className="text-xs font-medium text-white">
                                {stat.expenses.toFixed(0)} €
                              </span>
                            )}
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
  )
}
