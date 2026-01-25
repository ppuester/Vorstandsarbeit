'use client'

import React, { useState, useEffect } from 'react'
import {
  ArrowUp,
  ArrowDown,
  Filter,
  Search,
  Edit2,
  CheckCircle,
  XCircle,
  X,
  Plus,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category?: {
    id: string
    name: string
    color?: string
  }
  reference?: string
  processed: boolean
  notes?: string
  costAllocations?: Array<{
    aircraft: string | {
      id: string
      registration: string
      name?: string
    }
    weight: number
  }>
}

interface Aircraft {
  id: string
  registration: string
  name?: string
  active?: boolean
}

export default function KontobewegungenUebersichtPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterProcessed, setFilterProcessed] = useState<'all' | 'processed' | 'unprocessed'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [allocationForm, setAllocationForm] = useState<
    Array<{ aircraft: string; weight: number }>
  >([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [transactionsRes, aircraftRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/aircraft'),
      ])

      if (transactionsRes.ok) {
        const data = await transactionsRes.json()
        setTransactions(data.docs || [])
      }

      if (aircraftRes.ok) {
        const data = await aircraftRes.json()
        setAircraft(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProcessed = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ processed: !currentStatus }),
      })

      if (response.ok) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, processed: !currentStatus } : t))
        )
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error)
    }
  }

  const handleEditAllocation = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    // Initialize form with existing allocations or empty
    if (transaction.costAllocations && transaction.costAllocations.length > 0) {
      setAllocationForm(
        transaction.costAllocations.map((alloc) => ({
          aircraft:
            typeof alloc.aircraft === 'object' ? alloc.aircraft.id : alloc.aircraft,
          weight: alloc.weight,
        }))
      )
    } else {
      setAllocationForm([{ aircraft: '', weight: 100 }])
    }
  }

  const handleSaveAllocation = async () => {
    if (!editingTransaction) return

    // Calculate total weight
    const totalWeight = allocationForm.reduce((sum, alloc) => sum + alloc.weight, 0)

    if (Math.abs(totalWeight - 100) > 0.01) {
      alert(
        `Die Gesamtgewichtung beträgt ${totalWeight.toFixed(2)}% statt 100%. Bitte korrigieren Sie die Gewichtungen.`
      )
      return
    }

    try {
      const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          costAllocations: allocationForm.map((alloc) => ({
            aircraft: alloc.aircraft,
            weight: alloc.weight,
          })),
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingTransaction.id ? updated : t))
        )
        setEditingTransaction(null)
        setAllocationForm([])
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Zuordnung:', error)
      alert('Fehler beim Speichern der Zuordnung')
    }
  }

  const handleAddAllocation = () => {
    setAllocationForm([...allocationForm, { aircraft: '', weight: 0 }])
  }

  const handleRemoveAllocation = (index: number) => {
    setAllocationForm(allocationForm.filter((_, i) => i !== index))
  }

  const handleAllocationChange = (
    index: number,
    field: 'aircraft' | 'weight',
    value: string | number
  ) => {
    const newForm = [...allocationForm]
    newForm[index] = {
      ...newForm[index],
      [field]: field === 'weight' ? Number(value) : value,
    }
    setAllocationForm(newForm)
  }

  // Calculate total weight
  const totalWeight = allocationForm.reduce((sum, alloc) => sum + alloc.weight, 0)

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    // Tab filter
    if (activeTab === 'income' && transaction.type !== 'income') return false
    if (activeTab === 'expense' && transaction.type !== 'expense') return false

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !transaction.description.toLowerCase().includes(searchLower) &&
        !transaction.reference?.toLowerCase().includes(searchLower) &&
        !transaction.category?.name.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    // Processed filter
    if (filterProcessed === 'processed' && !transaction.processed) return false
    if (filterProcessed === 'unprocessed' && transaction.processed) return false

    // Date range filter
    if (dateFrom) {
      const transactionDate = new Date(transaction.date)
      const fromDate = new Date(dateFrom)
      if (transactionDate < fromDate) return false
    }
    if (dateTo) {
      const transactionDate = new Date(transaction.date)
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // Include entire day
      if (transactionDate > toDate) return false
    }

    // Amount range filter
    if (amountMin) {
      const min = parseFloat(amountMin)
      if (!isNaN(min) && transaction.amount < min) return false
    }
    if (amountMax) {
      const max = parseFloat(amountMax)
      if (!isNaN(max) && transaction.amount > max) return false
    }

    return true
  })

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses

  // Sort by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Kontobewegungen...</p>
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
                Kontobewegungen Übersicht
              </h1>
              <p className="text-lg text-slate-600">
                Verwalten Sie Ihre Einnahmen und Ausgaben
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/kontobewegungen/jahresvergleich"
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Jahresvergleich
              </Link>
              <Link
                href="/kontobewegungen"
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Neue Bewegungen importieren
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Einnahmen</span>
                <ArrowUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {totalIncome.toFixed(2)} €
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Ausgaben</span>
                <ArrowDown className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {totalExpenses.toFixed(2)} €
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Saldo</span>
                <span
                  className={`text-2xl font-bold ${
                    balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {balance >= 0 ? '+' : ''}
                  {balance.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'all'
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Alle ({transactions.length})
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'income'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                Einnahmen ({transactions.filter((t) => t.type === 'income').length})
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'expense'
                    ? 'border-red-600 text-red-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDown className="w-4 h-4" />
                Ausgaben ({transactions.filter((t) => t.type === 'expense').length})
              </button>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Suchen nach Beschreibung, Referenz oder Kategorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-400" />
                  <select
                    value={filterProcessed}
                    onChange={(e) =>
                      setFilterProcessed(
                        e.target.value as 'all' | 'processed' | 'unprocessed'
                      )
                    }
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="all">Alle</option>
                    <option value="processed">Nur verarbeitete</option>
                    <option value="unprocessed">Nur unverarbeitete</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  {showAdvancedFilters ? 'Weniger Filter' : 'Erweiterte Filter'}
                </button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Von Datum
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Bis Datum
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Min. Betrag (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountMin}
                      onChange={(e) => setAmountMin(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max. Betrag (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountMax}
                      onChange={(e) => setAmountMax(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {(dateFrom || dateTo || amountMin || amountMax) && (
                <button
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                    setAmountMin('')
                    setAmountMax('')
                  }}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Datum</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Beschreibung
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Kategorie</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Referenz</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Zuordnung</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700">Betrag</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        {searchTerm || filterProcessed !== 'all'
                          ? 'Keine Bewegungen gefunden, die den Filterkriterien entsprechen.'
                          : 'Noch keine Kontobewegungen vorhanden. Importieren Sie Ihre ersten Bewegungen!'}
                      </td>
                    </tr>
                  ) : (
                    sortedTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          {new Date(transaction.date).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-900">
                            {transaction.description}
                          </div>
                          {transaction.notes && (
                            <div className="text-sm text-slate-500 mt-1">
                              {transaction.notes}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {transaction.category ? (
                            <span
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: transaction.category.color
                                  ? `${transaction.category.color}20`
                                  : '#F3F4F6',
                                color: transaction.category.color || '#6B7280',
                              }}
                            >
                              {transaction.category.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">–</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {transaction.reference || '–'}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleEditAllocation(transaction)}
                            className="text-left w-full"
                          >
                            {transaction.costAllocations &&
                            transaction.costAllocations.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {transaction.costAllocations.map((allocation, idx) => {
                                  const aircraft =
                                    typeof allocation.aircraft === 'object'
                                      ? allocation.aircraft
                                      : null
                                  return (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium hover:bg-violet-200 transition-colors cursor-pointer"
                                    >
                                      {aircraft ? (
                                        <>
                                          {aircraft.registration}
                                          <span className="text-violet-500">
                                            ({allocation.weight.toFixed(0)}%)
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-slate-400">Flugzeug gelöscht</span>
                                      )}
                                    </span>
                                  )
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-400 hover:text-violet-600 transition-colors">
                                Zuordnung hinzufügen
                              </span>
                            )}
                          </button>
                        </td>
                        <td
                          className={`py-4 px-6 text-right font-semibold ${
                            transaction.type === 'income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {transaction.amount.toFixed(2)} €
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() =>
                              handleToggleProcessed(transaction.id, transaction.processed)
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              transaction.processed
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {transaction.processed ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Verarbeitet
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Offen
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Link
                            href={`/admin/collections/transactions/${transaction.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Bearbeiten
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Zuordnung bearbeiten</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {editingTransaction.description} -{' '}
                    {new Date(editingTransaction.date).toLocaleDateString('de-DE')} -{' '}
                    {editingTransaction.amount.toFixed(2)} €
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingTransaction(null)
                    setAllocationForm([])
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> Die Gesamtgewichtung muss 100% betragen. Die Zuordnung
                  wird basierend auf dem Datum der Transaktion in der Kostenermittlung verwendet.
                </p>
              </div>

              {allocationForm.map((alloc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Flugzeug
                    </label>
                    <select
                      value={alloc.aircraft}
                      onChange={(e) =>
                        handleAllocationChange(index, 'aircraft', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Flugzeug auswählen...</option>
                      {aircraft
                        .filter((ac) => ac.active !== false)
                        .map((ac) => (
                          <option key={ac.id} value={ac.id}>
                            {ac.registration} {ac.name ? `(${ac.name})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Gewichtung (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={alloc.weight}
                      onChange={(e) =>
                        handleAllocationChange(index, 'weight', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  {allocationForm.length > 1 && (
                    <button
                      onClick={() => handleRemoveAllocation(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleAddAllocation}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Weitere Zuordnung hinzufügen
                </button>
                <div className="text-sm font-medium">
                  Gesamtgewichtung:{' '}
                  <span
                    className={
                      Math.abs(totalWeight - 100) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {totalWeight.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingTransaction(null)
                  setAllocationForm([])
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveAllocation}
                disabled={Math.abs(totalWeight - 100) > 0.01}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
