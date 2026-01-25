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
  Link as LinkIcon,
  ExternalLink,
  Calendar,
  Euro,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { useOrganization } from '@/providers/Organization'

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
  costCenter?: {
    id: string
    name: string
    code?: string
    color?: string
  }
  reference?: string
  processed: boolean
  notes?: string
  costAllocations?: Array<{
    allocationType?: 'aircraft' | 'generalCost'
    aircraft?: string | {
      id: string
      registration: string
      name?: string
    }
    generalCost?: string | {
      id: string
      name: string
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

interface CostCenter {
  id: string
  name: string
  code?: string
  color?: string
  active: boolean
}

interface GeneralCost {
  id: string
  name: string
  availableForIncome: boolean
  availableForExpense: boolean
  active: boolean
}

export default function KontobewegungenUebersichtPage() {
  const { isFeatureEnabled } = useOrganization()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [costCenters, setCostCenters] = useState<CostCenter[]>([])
  const [generalCosts, setGeneralCosts] = useState<GeneralCost[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCostCenter, setEditingCostCenter] = useState<{ transactionId: string; costCenterId: string | null } | null>(null)
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
    Array<{ 
      allocationType: 'aircraft' | 'generalCost'
      aircraft?: string
      generalCost?: string
      weight: number 
    }>
  >([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const [limit] = useState(50)
  const [totals, setTotals] = useState({ income: 0, expenses: 0, balance: 0 })

  useEffect(() => {
    fetchAircraftAndCostCenters()
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
    fetchTransactions(1)
    fetchTotals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, searchTerm, filterProcessed, dateFrom, dateTo, amountMin, amountMax])

  const fetchAircraftAndCostCenters = async () => {
    try {
      const [aircraftRes, costCentersRes, generalCostsRes] = await Promise.all([
        fetch('/api/aircraft'),
        fetch('/api/cost-centers'),
        fetch('/api/general-costs?activeOnly=true'),
      ])

      if (aircraftRes.ok) {
        const data = await aircraftRes.json()
        setAircraft(data.docs || [])
      }

      if (costCentersRes.ok) {
        const data = await costCentersRes.json()
        setCostCenters(data.docs || [])
      }

      if (generalCostsRes.ok) {
        const data = await generalCostsRes.json()
        setGeneralCosts(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    }
  }

  const fetchTransactions = async (page: number = currentPage) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (activeTab !== 'all') {
        params.append('type', activeTab)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (filterProcessed === 'processed') {
        params.append('processed', 'true')
      } else if (filterProcessed === 'unprocessed') {
        params.append('processed', 'false')
      }

      if (dateFrom) {
        params.append('dateFrom', dateFrom)
      }

      if (dateTo) {
        params.append('dateTo', dateTo)
      }

      if (amountMin) {
        params.append('amountMin', amountMin)
      }

      if (amountMax) {
        params.append('amountMax', amountMax)
      }

      const response = await fetch(`/api/transactions?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setTransactions(data.docs || [])
        setTotalPages(data.totalPages || 1)
        setTotalDocs(data.totalDocs || 0)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Transaktionen:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTotals = async () => {
    try {
      const params = new URLSearchParams()

      if (activeTab !== 'all') {
        params.append('type', activeTab)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      if (filterProcessed === 'processed') {
        params.append('processed', 'true')
      } else if (filterProcessed === 'unprocessed') {
        params.append('processed', 'false')
      }

      if (dateFrom) {
        params.append('dateFrom', dateFrom)
      }

      if (dateTo) {
        params.append('dateTo', dateTo)
      }

      if (amountMin) {
        params.append('amountMin', amountMin)
      }

      if (amountMax) {
        params.append('amountMax', amountMax)
      }

      const response = await fetch(`/api/transactions/totals?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setTotals({
          income: data.income || 0,
          expenses: data.expenses || 0,
          balance: data.balance || 0,
        })
      }
    } catch (error) {
      console.error('Fehler beim Laden der Summen:', error)
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
        transaction.costAllocations.map((alloc) => {
          const allocationType = alloc.allocationType || (alloc.aircraft ? 'aircraft' : 'generalCost')
          return {
            allocationType,
            aircraft: allocationType === 'aircraft' 
              ? (typeof alloc.aircraft === 'object' ? alloc.aircraft.id : alloc.aircraft || '')
              : undefined,
            generalCost: allocationType === 'generalCost'
              ? (typeof alloc.generalCost === 'object' ? alloc.generalCost.id : alloc.generalCost || '')
              : undefined,
            weight: alloc.weight,
          }
        })
      )
    } else {
      setAllocationForm([{ allocationType: 'aircraft', aircraft: '', weight: 100 }])
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
            allocationType: alloc.allocationType,
            aircraft: alloc.allocationType === 'aircraft' ? alloc.aircraft : undefined,
            generalCost: alloc.allocationType === 'generalCost' ? alloc.generalCost : undefined,
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
    setAllocationForm([...allocationForm, { allocationType: 'aircraft', aircraft: '', weight: 0 }])
  }

  const handleRemoveAllocation = (index: number) => {
    setAllocationForm(allocationForm.filter((_, i) => i !== index))
  }

  const handleCostCenterChange = async (transactionId: string, costCenterId: string | null) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          costCenter: costCenterId || null,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setTransactions((prev) =>
          prev.map((t) => (t.id === transactionId ? updated : t))
        )
        setEditingCostCenter(null)
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kostenstelle:', error)
      alert('Fehler beim Speichern der Kostenstelle')
    }
  }

  const handleAllocationChange = (
    index: number,
    field: 'allocationType' | 'aircraft' | 'generalCost' | 'weight',
    value: string | number
  ) => {
    const newForm = [...allocationForm]
    if (field === 'allocationType') {
      // Reset selection when type changes
      newForm[index] = {
        allocationType: value as 'aircraft' | 'generalCost',
        weight: newForm[index].weight,
      }
    } else {
      newForm[index] = {
        ...newForm[index],
        [field]: field === 'weight' ? Number(value) : value,
      }
    }
    setAllocationForm(newForm)
  }

  // Calculate total weight
  const totalWeight = allocationForm.reduce((sum, alloc) => sum + alloc.weight, 0)

  // Use totals from API (calculated over all filtered transactions, not just current page)
  const totalIncome = totals.income
  const totalExpenses = totals.expenses
  const balance = totals.balance

  // Transactions are already sorted by the API
  const sortedTransactions = transactions

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Lade Kontobewegungen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Kontobewegungen Übersicht
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
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
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Einnahmen</span>
                <ArrowUp className="w-5 h-5 text-green-500 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {totalIncome.toFixed(2)} €
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Ausgaben</span>
                <ArrowDown className="w-5 h-5 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {totalExpenses.toFixed(2)} €
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Saldo</span>
                <span
                  className={`text-2xl font-bold ${
                    balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {balance >= 0 ? '+' : ''}
                  {balance.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>

          {/* Tabs and Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === 'all'
                    ? 'border-violet-600 dark:border-violet-400 text-violet-600 dark:text-violet-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Alle ({totalDocs})
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'income'
                    ? 'border-green-600 dark:border-green-400 text-green-600 dark:text-green-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                Einnahmen
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-6 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'expense'
                    ? 'border-red-600 dark:border-red-400 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <ArrowDown className="w-4 h-4" />
                Ausgaben
              </button>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Suchen nach Beschreibung, Referenz oder Kategorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <select
                    value={filterProcessed}
                    onChange={(e) =>
                      setFilterProcessed(
                        e.target.value as 'all' | 'processed' | 'unprocessed'
                      )
                    }
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                  >
                    <option value="all">Alle</option>
                    <option value="processed">Nur verarbeitete</option>
                    <option value="unprocessed">Nur unverarbeitete</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800"
                >
                  {showAdvancedFilters ? 'Weniger Filter' : 'Erweiterte Filter'}
                </button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Von Datum
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Bis Datum
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Min. Betrag (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountMin}
                      onChange={(e) => setAmountMin(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Max. Betrag (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amountMax}
                      onChange={(e) => setAmountMax(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
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
                  className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="text-center py-4 px-4 font-semibold text-slate-700 dark:text-slate-300 w-32">Aktion</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Datum</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Betrag</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Beschreibung
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Kategorie</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Kostenstelle</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Referenz</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Zuordnung</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          6 +
                          (isFeatureEnabled('costCenters') ? 1 : 0) +
                          (isFeatureEnabled('costAllocations') ? 1 : 0) +
                          1
                        }
                        className="py-12 text-center text-slate-500 dark:text-slate-400"
                      >
                        {searchTerm || filterProcessed !== 'all'
                          ? 'Keine Bewegungen gefunden, die den Filterkriterien entsprechen.'
                          : 'Noch keine Kontobewegungen vorhanden. Importieren Sie Ihre ersten Bewegungen!'}
                      </td>
                    </tr>
                  ) : (
                    sortedTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <td className="py-4 px-4 text-center">
                          {isFeatureEnabled('costAllocations') ? (
                            <button
                              onClick={() => handleEditAllocation(transaction)}
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 dark:hover:bg-violet-600 rounded-lg transition-colors shadow-sm hover:shadow-md"
                              title="Zuordnung bearbeiten"
                            >
                              <LinkIcon className="w-4 h-4" />
                              Zuordnung
                            </button>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-xs">–</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-900 dark:text-slate-100">
                          {new Date(transaction.date).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td
                          className={`py-4 px-6 text-right font-bold text-lg ${
                            transaction.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {transaction.amount.toFixed(2)} €
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {transaction.description}
                          </div>
                          {transaction.notes && (
                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
                            <span className="text-slate-400 dark:text-slate-500">–</span>
                          )}
                        </td>
                        {isFeatureEnabled('costCenters') && (
                          <td className="py-4 px-6">
                            {editingCostCenter?.transactionId === transaction.id ? (
                              <select
                                value={editingCostCenter.costCenterId || ''}
                                onChange={(e) => {
                                  const newValue = e.target.value || null
                                  handleCostCenterChange(transaction.id, newValue)
                                }}
                                onBlur={() => setEditingCostCenter(null)}
                                autoFocus
                                className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-violet-300 dark:border-violet-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-sm text-slate-900 dark:text-slate-100"
                              >
                                <option value="">Keine Kostenstelle</option>
                                {costCenters.map((cc) => (
                                  <option key={cc.id} value={cc.id}>
                                    {cc.code ? `${cc.code} - ` : ''}
                                    {cc.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditingCostCenter({
                                    transactionId: transaction.id,
                                    costCenterId: transaction.costCenter?.id || null,
                                  })
                                }
                                className="text-left w-full"
                              >
                                {transaction.costCenter ? (
                                  <span
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                                    style={{
                                      backgroundColor: transaction.costCenter.color
                                        ? `${transaction.costCenter.color}20`
                                        : '#E0E7FF',
                                      color: transaction.costCenter.color || '#6366F1',
                                    }}
                                  >
                                    {transaction.costCenter.code && (
                                      <span className="mr-1 font-semibold">
                                        {transaction.costCenter.code}
                                      </span>
                                    )}
                                    {transaction.costCenter.name}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm">
                                    Kostenstelle zuordnen
                                  </span>
                                )}
                              </button>
                            )}
                          </td>
                        )}
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                          {transaction.reference || '–'}
                        </td>
                        <td className="py-4 px-6">
                          {isFeatureEnabled('costAllocations') ? (
                            <div className="flex flex-wrap gap-2">
                              {transaction.costAllocations && transaction.costAllocations.length > 0 ? (
                                transaction.costAllocations.map((allocation, idx) => {
                                  const allocationType = allocation.allocationType || (allocation.aircraft ? 'aircraft' : 'generalCost')
                                  const aircraft =
                                    allocationType === 'aircraft' && typeof allocation.aircraft === 'object'
                                      ? allocation.aircraft
                                      : null
                                  const generalCost =
                                    allocationType === 'generalCost' && typeof allocation.generalCost === 'object'
                                      ? allocation.generalCost
                                      : null
                                  return (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded text-xs font-medium"
                                    >
                                      {allocationType === 'aircraft' ? (
                                        aircraft ? (
                                          <>
                                            {aircraft.registration}
                                            <span className="text-violet-500 dark:text-violet-400">
                                              ({allocation.weight.toFixed(0)}%)
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-slate-400 dark:text-slate-500">Flugzeug gelöscht</span>
                                        )
                                      ) : generalCost ? (
                                        <>
                                          {generalCost.name}
                                          <span className="text-violet-500 dark:text-violet-400">
                                            ({allocation.weight.toFixed(0)}%)
                                          </span>
                                        </>
                                      ) : (
                                        <span className="text-slate-400 dark:text-slate-500">Allgemeine Kosten gelöscht</span>
                                      )}
                                    </span>
                                  )
                                })
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500 text-sm">Keine Zuordnung</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-sm">Nicht verfügbar</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() =>
                              handleToggleProcessed(transaction.id, transaction.processed)
                            }
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              transaction.processed
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
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
                            className="inline-flex items-center gap-1 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Im Admin bearbeiten"
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Zeige {((currentPage - 1) * limit) + 1} bis {Math.min(currentPage * limit, totalDocs)} von {totalDocs} Einträgen
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchTransactions(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchTransactions(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-violet-600 text-white dark:bg-violet-500'
                              : 'text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => fetchTransactions(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Allocation Edit Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                    Transaktion bearbeiten
                  </h2>
                  
                  {/* Transaction Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Datum</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {new Date(editingTransaction.date).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Euro className="w-5 h-5 text-slate-400 dark:text-slate-500 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Betrag</div>
                        <div
                          className={`text-sm font-bold ${
                            editingTransaction.type === 'income'
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {editingTransaction.type === 'income' ? '+' : '-'}
                          {editingTransaction.amount.toFixed(2)} €
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Beschreibung</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {editingTransaction.description}
                    </div>
                  </div>

                  {editingTransaction.reference && (
                    <div className="mb-4">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Referenz</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {editingTransaction.reference}
                      </div>
                    </div>
                  )}

                  {editingTransaction.category && (
                    <div className="mb-4">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Kategorie</div>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: editingTransaction.category.color
                            ? `${editingTransaction.category.color}20`
                            : '#F3F4F6',
                          color: editingTransaction.category.color || '#6B7280',
                        }}
                      >
                        {editingTransaction.category.name}
                      </span>
                    </div>
                  )}

                  {editingTransaction.notes && (
                    <div className="mb-4">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Notizen</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {editingTransaction.notes}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/admin/collections/transactions/${editingTransaction.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Im Admin bearbeiten
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingTransaction(null)
                    setAllocationForm([])
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors ml-4"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Zuordnung zu Flugzeugen oder Allgemeinen Kosten
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Hinweis:</strong> Die Gesamtgewichtung muss 100% betragen. Sie können zwischen Flugzeugen und Allgemeinen Kosten (z.B. Pacht) wählen.
                    {editingTransaction.type === 'income' && (
                      <span className="block mt-2">
                        <strong>Einnahmen:</strong> Sie können Einnahmen Flugzeugen oder allgemeinen Kostenstellen zuordnen,
                        um Erlöse zu verfolgen.
                      </span>
                    )}
                    {editingTransaction.type === 'expense' && (
                      <span className="block mt-2">
                        <strong>Ausgaben:</strong> Ordnen Sie Ausgaben Flugzeugen oder allgemeinen Kostenstellen zu,
                        um die Kosten zu verfolgen.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {allocationForm.map((alloc, index) => {
                const availableGeneralCosts = generalCosts.filter(
                  (gc) => gc.active && 
                    (editingTransaction.type === 'income' ? gc.availableForIncome : gc.availableForExpense)
                )
                return (
                  <div
                    key={index}
                    className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
                  >
                    <div className="w-full">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Zuordnungstyp
                      </label>
                      <select
                        value={alloc.allocationType}
                        onChange={(e) =>
                          handleAllocationChange(index, 'allocationType', e.target.value)
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                      >
                        <option value="aircraft">Flugzeug</option>
                        <option value="generalCost">Allgemeine Kosten</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {alloc.allocationType === 'aircraft' ? 'Flugzeug' : 'Allgemeine Kosten'}
                        </label>
                        {alloc.allocationType === 'aircraft' ? (
                          <select
                            value={alloc.aircraft || ''}
                            onChange={(e) =>
                              handleAllocationChange(index, 'aircraft', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
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
                        ) : (
                          <select
                            value={alloc.generalCost || ''}
                            onChange={(e) =>
                              handleAllocationChange(index, 'generalCost', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                          >
                            <option value="">Allgemeine Kosten auswählen...</option>
                            {availableGeneralCosts.map((gc) => (
                              <option key={gc.id} value={gc.id}>
                                {gc.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                          className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      {allocationForm.length > 1 && (
                        <button
                          onClick={() => handleRemoveAllocation(index)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-6"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleAddAllocation}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Weitere Zuordnung hinzufügen
                </button>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Gesamtgewichtung:{' '}
                  <span
                    className={
                      Math.abs(totalWeight - 100) < 0.01
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }
                  >
                    {totalWeight.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingTransaction(null)
                  setAllocationForm([])
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSaveAllocation}
                disabled={Math.abs(totalWeight - 100) > 0.01}
                className="px-6 py-2 bg-violet-600 dark:bg-violet-500 text-white rounded-lg hover:bg-violet-700 dark:hover:bg-violet-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
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
