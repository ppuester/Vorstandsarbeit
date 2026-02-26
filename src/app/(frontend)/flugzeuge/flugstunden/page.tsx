'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Save, X, AlertCircle, CheckCircle, Edit2, Upload, Users, RefreshCw, History, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ImportRunItem {
  id: string
  fileName: string
  fileSize?: number
  importedAt: string
  year?: number
  stats: { created?: number; skipped?: number; errors?: number; unmatchedMembers?: number }
  isDeleted: boolean
  deletedAt?: string
  deletedFlightsCount?: number
}

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

interface MemberStat {
  memberId: string
  memberName: string
  flights: number
  starts: number
  flightHours: number
}

export default function FlugstundenPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [importRuns, setImportRuns] = useState<ImportRunItem[]>([])
  const [showImportHistory, setShowImportHistory] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; fileName: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedAircraft, setSelectedAircraft] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [memberStats, setMemberStats] = useState<MemberStat[]>([])
  const [showMemberStats, setShowMemberStats] = useState(false)
  const [formData, setFormData] = useState<{
    aircraft: string
    year: number
    starts: number
    flightHours: number
    notes: string
  }>({
    aircraft: '',
    year: new Date().getFullYear(),
    starts: 0,
    flightHours: 0,
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchImportRuns = useCallback(async () => {
    try {
      const res = await fetch('/api/import-runs/flights')
      if (res.ok) {
        const data = await res.json()
        setImportRuns(data.docs || [])
      }
    } catch (_err) {
      // optional
    }
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
      await fetchImportRuns()
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      setError('Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setShowForm(true)
    setEditingId(null)
    setFormData({
      aircraft: '',
      year: new Date().getFullYear(),
      starts: 0,
      flightHours: 0,
      notes: '',
    })
    setError(null)
    setSuccess(null)
  }

  const handleEdit = (log: FlightLog) => {
    setShowForm(true)
    setEditingId(log.id)
    const aircraftId = typeof log.aircraft === 'object' ? log.aircraft.id : log.aircraft || ''
    setFormData({
      aircraft: aircraftId,
      year: log.year,
      starts: log.starts,
      flightHours: log.flightHours,
      notes: log.notes || '',
    })
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    if (!formData.aircraft) {
      setError('Bitte wählen Sie ein Flugzeug aus')
      return
    }

    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      setError('Bitte geben Sie ein gültiges Jahr ein')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (editingId) {
        // Update
        const response = await fetch(`/api/flight-logs/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setSuccess('Flugbuch erfolgreich aktualisiert')
          await fetchData()
          setEditingId(null)
          setShowForm(false)
        } else {
          const data = await response.json()
          setError(data.error || 'Fehler beim Aktualisieren')
        }
      } else {
        // Create
        const response = await fetch('/api/flight-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setSuccess('Flugbuch erfolgreich erstellt')
          await fetchData()
          setShowForm(false)
        } else {
          const data = await response.json()
          setError(data.error || 'Fehler beim Erstellen')
        }
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      setError('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      aircraft: '',
      year: new Date().getFullYear(),
      starts: 0,
      flightHours: 0,
      notes: '',
    })
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportProgress(0)
    setError(null)
    setSuccess(null)

    const progressInterval = window.setInterval(() => {
      setImportProgress((p) => {
        if (p >= 85) return 85
        return p + Math.random() * 6 + 4
      })
    }, 400)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/flights/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      clearInterval(progressInterval)
      setImportProgress(100)

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Importieren')
      }

      setSuccess(
        result.importRunId
          ? `Import gespeichert (#${String(result.importRunId).slice(-6)}): ${result.created} Flüge importiert, ${result.aggregated} Flugbücher aktualisiert, ${result.skipped} übersprungen. Siehe „Import-Historie“.`
          : `Import erfolgreich: ${result.created} Flüge importiert, ${result.aggregated} Flugbücher aktualisiert, ${result.skipped} übersprungen`
      )

      if (result.errors && result.errors.length > 0) {
        console.warn('Import-Warnungen:', result.errors)
      }

      await fetchData()
    } catch (error) {
      console.error('Import error:', error)
      clearInterval(progressInterval)
      setError(error instanceof Error ? error.message : 'Fehler beim Importieren')
    } finally {
      setImporting(false)
      setTimeout(() => setImportProgress(0), 300)
      e.target.value = ''
    }
  }

  const handleSyncFlightLogs = async () => {
    try {
      setSyncing(true)
      setError(null)
      setSuccess(null)
      const res = await fetch('/api/flight-logs/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Sync fehlgeschlagen')
      setSuccess(
        `Flugbücher aktualisiert: ${data.created} neu, ${data.updated} aktualisiert (${data.synced} Einträge aus Flügen).`
      )
      if (data.errors?.length) setError(data.errors.join('; '))
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren der Flugbücher')
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteImport = async () => {
    if (!deleteConfirm) return
    try {
      setDeleting(true)
      setError(null)
      setSuccess(null)
      const res = await fetch(
        `/api/import-runs/flights/${deleteConfirm.id}?confirm=true`,
        { method: 'DELETE' }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Löschen fehlgeschlagen')
      setSuccess(`${data.deletedFlights} Flüge aus Import "${deleteConfirm.fileName}" gelöscht.`)
      setDeleteConfirm(null)
      await fetchData()
      await fetchImportRuns()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Imports')
    } finally {
      setDeleting(false)
    }
  }

  const fetchMemberStats = useCallback(async () => {
    if (!selectedAircraft && !selectedYear) {
      setMemberStats([])
      return
    }

    try {
      const params = new URLSearchParams()
      if (selectedAircraft) params.append('aircraftId', selectedAircraft)
      if (selectedYear) params.append('year', selectedYear)

      const response = await fetch(`/api/flights/member-stats?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMemberStats(data.stats || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Mitgliedsstatistiken:', error)
    }
  }, [selectedAircraft, selectedYear])

  useEffect(() => {
    if (showMemberStats) {
      fetchMemberStats()
    }
  }, [showMemberStats, fetchMemberStats])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Lade Flugbücher...</p>
        </div>
      </div>
    )
  }

  const activeAircraft = aircraft.filter((ac) => ac.active !== false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Flugstunden & Starts
              </h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                Erfassen Sie jährliche Starts und Flugstunden pro Flugzeug
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                Import erwartet Hauptflugbuch-Format (CSV/TSV oder XLSX/XLS) mit Spalten: Vereins-LFZ | Datum | Lfz. | Pilot | Begleiter/FI | Start | Zeit | Schleppzeit | Schlepp-LFZ | Startort | S.-Art | Flugart | Abr. | Bemerkung | Landung | Landeort
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/flugzeuge/flugstunden/auswertung"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Auswertung & Vergleich
              </Link>
              {!showForm && !editingId && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportHistory(true)
                      fetchImportRuns()
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
                    title="Import-Historie anzeigen"
                  >
                    <History className="w-5 h-5" />
                    Import-Historie
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncFlightLogs}
                    disabled={syncing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
                    title="Flugbücher aus importierten Flügen befüllen"
                  >
                    <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                    Flugbücher aktualisieren
                  </button>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer">
                    <Upload className="w-5 h-5" />
                    Importieren
                    <input
                      type="file"
                      accept=".csv,.txt,.xlsx,.xls"
                      onChange={handleImport}
                      disabled={importing}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Neuer Eintrag
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          {importing && (
            <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Datei wird importiert…
              </p>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.round(importProgress))}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {Math.min(100, Math.round(importProgress))} %
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
            </div>
          )}

          {/* Form */}
          {showForm || editingId !== null ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {editingId ? 'Flugbuch bearbeiten' : 'Neuer Flugbucheintrag'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Flugzeug <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.aircraft || ''}
                    onChange={(e) => setFormData({ ...formData, aircraft: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Flugzeug auswählen...</option>
                    {activeAircraft.map((ac) => (
                      <option key={ac.id} value={ac.id}>
                        {ac.registration} {ac.name ? `(${ac.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Jahr <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Anzahl Starts <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.starts || 0}
                    onChange={(e) => setFormData({ ...formData, starts: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Flugstunden <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.flightHours || 0}
                    onChange={(e) => setFormData({ ...formData, flightHours: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notizen
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Zusätzliche Informationen..."
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Speichere...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Speichern
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 px-6 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Member Stats Filter */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Flugstunden nach Mitglied
              </h2>
              <button
                onClick={() => setShowMemberStats(!showMemberStats)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                <Users className="w-4 h-4" />
                {showMemberStats ? 'Ausblenden' : 'Anzeigen'}
              </button>
            </div>
            {showMemberStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Flugzeug filtern
                  </label>
                  <select
                    value={selectedAircraft}
                    onChange={(e) => setSelectedAircraft(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Alle Flugzeuge</option>
                    {activeAircraft.map((ac) => (
                      <option key={ac.id} value={ac.id}>
                        {ac.registration} {ac.name ? `(${ac.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Jahr filtern
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Alle Jahre</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {showMemberStats && memberStats.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Mitglied
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Flüge
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Starts
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Flugstunden
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {memberStats.map((stat) => (
                      <tr
                        key={stat.memberId}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                          {stat.memberName}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-900 dark:text-slate-100">
                          {stat.flights}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100">
                          {stat.starts.toLocaleString('de-DE')}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100">
                          {stat.flightHours.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {showMemberStats && memberStats.length === 0 && (selectedAircraft || selectedYear) && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-4">
                Keine Daten für die ausgewählten Filter gefunden.
              </p>
            )}
          </div>

          {/* List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/70 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Flugzeug</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Jahr</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Starts</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Flugstunden</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Ø Stunden/Start</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Notizen</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {flightLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        Noch keine Flugbucheinträge vorhanden. Erstellen Sie den ersten!
                      </td>
                    </tr>
                  ) : (
                    flightLogs
                      .sort((a, b) => {
                        const aYear = a.year
                        const bYear = b.year
                        if (aYear !== bYear) return bYear - aYear
                        const aReg = typeof a.aircraft === 'object' ? a.aircraft.registration : ''
                        const bReg = typeof b.aircraft === 'object' ? b.aircraft.registration : ''
                        return aReg.localeCompare(bReg)
                      })
                      .map((log) => {
                        const aircraftObj = typeof log.aircraft === 'object' ? log.aircraft : null
                        const avgHoursPerStart = log.starts > 0 ? log.flightHours / log.starts : 0
                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                              {aircraftObj ? (
                                <>
                                  {aircraftObj.registration}
                                  {aircraftObj.name && (
                                    <span className="text-slate-500 dark:text-slate-400 ml-2">
                                      ({aircraftObj.name})
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-500">Gelöscht</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-center text-slate-900 dark:text-slate-100">
                              {log.year}
                            </td>
                            <td className="py-4 px-6 text-right text-slate-900 dark:text-slate-100">
                              {log.starts.toLocaleString('de-DE')}
                            </td>
                            <td className="py-4 px-6 text-right text-slate-900 dark:text-slate-100">
                              {log.flightHours.toFixed(2).replace('.', ',')}
                            </td>
                            <td className="py-4 px-6 text-right text-slate-600 dark:text-slate-400">
                              {avgHoursPerStart > 0 ? avgHoursPerStart.toFixed(2).replace('.', ',') : '–'}
                            </td>
                            <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                              {log.notes || '–'}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(log)}
                                  className="p-2 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                                  title="Bearbeiten"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <Link
                                  href={`/admin/collections/flight-logs/${log.id}`}
                                  target="_blank"
                                  className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Im Admin bearbeiten"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Import-Historie */}
      {showImportHistory && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-history-title"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 id="import-history-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5" />
                Import-Historie
              </h2>
              <button
                type="button"
                onClick={() => setShowImportHistory(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Importiert am
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Datei
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Jahr
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Erstellt
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Übersprungen
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Fehler
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {importRuns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500 dark:text-slate-400">
                          Noch keine Imports. Import durchführen, dann erscheint der Lauf hier. Gelöschte Imports werden nicht angezeigt.
                        </td>
                      </tr>
                    ) : (
                      importRuns.map((run) => (
                        <tr
                          key={run.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                            {run.importedAt
                              ? new Date(run.importedAt).toLocaleString('de-DE', {
                                  dateStyle: 'short',
                                  timeStyle: 'short',
                                })
                              : '–'}
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                            {run.fileName}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {run.year ?? '–'}
                          </td>
                          <td className="py-3 px-4">{run.stats?.created ?? 0}</td>
                          <td className="py-3 px-4">{run.stats?.skipped ?? 0}</td>
                          <td className="py-3 px-4">{run.stats?.errors ?? 0}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirm({ id: run.id, fileName: run.fileName })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-sm font-medium"
                              title="Import rückgängig machen (alle Flüge dieses Imports löschen)"
                            >
                              <Trash2 className="w-4 h-4" />
                              Import löschen
                            </button>
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
      )}

      {/* Dialog: Import löschen bestätigen */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-import-title"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <h2 id="delete-import-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Import rückgängig machen
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Dieser Vorgang löscht <strong>alle Flüge</strong> des Imports &quot;{deleteConfirm.fileName}&quot; unwiderruflich.
              Die Flugbucheinträge (Starts/Flugstunden pro Flugzeug) werden nicht automatisch angepasst – ggf. danach
              &quot;Flugbücher aktualisieren&quot; ausführen.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDeleteImport}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Wird gelöscht...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Import löschen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
