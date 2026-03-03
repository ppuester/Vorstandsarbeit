'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Save, X, AlertCircle, CheckCircle, Edit2, Upload, Users, RefreshCw, History, Trash2, Download } from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

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

interface ChunkImportError {
  rowIndexGlobal: number
  reason: string
  raw: {
    Datum?: string
    Start?: string
    Landung?: string
    Lfz?: string
    Pilot?: string
    Zeit?: string
    Schleppzeit?: string
    'Schlepp-LFZ'?: string
  }
}

export default function FlugstundenPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<string>('')
  const [importChunkErrors, setImportChunkErrors] = useState<ChunkImportError[]>([])
  const [_importSummary, setImportSummary] = useState<{ created: number; skipped: number; totalErrors: number; importRunId?: string } | null>(null)
  const [showImportErrors, setShowImportErrors] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [importRuns, setImportRuns] = useState<ImportRunItem[]>([])
  const [showImportHistory, setShowImportHistory] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    fileName: string
    year?: number | null
  } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmLog, setDeleteConfirmLog] = useState<{
    id: string
    aircraftLabel: string
    year: number
  } | null>(null)
  const [deletingLog, setDeletingLog] = useState(false)
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

  const CHUNK_SIZE = 500
  const MAX_ROWS_SINGLE = 1000

  const parseFileToHeadersAndRows = async (
    file: File
  ): Promise<{ headers: string[]; rows: (string | number | null)[][] }> => {
    const name = (file.name || '').toLowerCase()
    const isExcel =
      name.endsWith('.xlsx') ||
      name.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'

    if (isExcel) {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]!]
      if (!ws) throw new Error('Keine Tabelle in der Excel-Datei gefunden')
      const data = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
        header: 1,
        defval: '',
      }) as (string | number)[][]
      if (!data.length) throw new Error('Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten')
      const headers = (data[0] ?? []).map((c) => String(c ?? '').trim())
      const rows = data.slice(1).map((row) => row.map((c) => (c == null ? '' : c)))
      return { headers, rows }
    }

    const text = await file.text()
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const firstLine = normalized.split('\n')[0] ?? ''
    const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ','
    const parsed = Papa.parse<string[]>(normalized, { delimiter, skipEmptyLines: true })
    const data = parsed.data as string[][]
    if (!data.length) throw new Error('Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten')
    const headers = (data[0] ?? []).map((c) => String(c ?? '').trim())
    const rows = data.slice(1).map((row) => (row ?? []).map((c) => c ?? ''))
    return { headers, rows }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setImportProgress(0)
    setImportStatus('')
    setError(null)
    setSuccess(null)
    setImportChunkErrors([])
    setImportSummary(null)
    setShowImportErrors(false)

    try {
      const { headers, rows } = await parseFileToHeadersAndRows(file)
      const sourceFileName = file.name || 'Unbekannt'

      if (rows.length > MAX_ROWS_SINGLE) {
        const totalChunks = Math.ceil(rows.length / CHUNK_SIZE)
        let importRunId: string | undefined
        let totalCreated = 0
        let totalSkipped = 0
        let totalSkippedNonClub = 0
        let totalSkippedUnknownAircraft = 0
        const allErrors: ChunkImportError[] = []

        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          setImportStatus(`Chunk ${chunkIndex + 1}/${totalChunks}`)
          setImportProgress(((chunkIndex + 0.5) / totalChunks) * 100)

          const start = chunkIndex * CHUNK_SIZE
          const chunkRows = rows.slice(start, start + CHUNK_SIZE)
          const rowsAsRecords: Array<Record<string, string | number | null>> = chunkRows.map(
            (rowArr) => {
              const o: Record<string, string | number | null> = {}
              headers.forEach((h, j) => {
                o[h] = rowArr[j] ?? ''
              })
              return o
            }
          )

          const res = await fetch('/api/flights/import-chunk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              importRunId,
              fileName: sourceFileName,
              headers,
              rows: rowsAsRecords,
              chunkIndex,
              totalChunks,
            }),
          })
          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.error || 'Chunk-Import fehlgeschlagen')
          }

          importRunId = data.importRunId ?? importRunId
          totalCreated += data.created ?? 0
          totalSkipped += data.skipped ?? 0
          totalSkippedNonClub += data.skippedNonClub ?? 0
          totalSkippedUnknownAircraft += data.skippedUnknownAircraft ?? 0
          if (Array.isArray(data.errors)) allErrors.push(...data.errors)
        }

        setImportProgress(100)
        setImportStatus('Flugbücher aktualisieren…')

        const syncRes = await fetch('/api/flight-logs/sync', { method: 'POST' })
        const syncData = await syncRes.json()
        if (!syncRes.ok) {
          console.warn('Sync-Warnung:', syncData.error)
        }

        setImportSummary({
          created: totalCreated,
          skipped: totalSkipped,
          totalErrors: allErrors.length,
          importRunId,
        })
        setImportChunkErrors(allErrors)
        const chunkExtra =
          totalSkippedNonClub > 0 || totalSkippedUnknownAircraft > 0
            ? `, ${totalSkippedNonClub} Nicht-Vereinsflugzeuge, ${totalSkippedUnknownAircraft} unbek. Lfz. ignoriert`
            : ''
        setSuccess(
          `Chunk-Import abgeschlossen: ${totalCreated} Flüge importiert, ${totalSkipped} übersprungen${chunkExtra}${allErrors.length > 0 ? `, ${allErrors.length} Fehler.` : '.'} Siehe „Import-Historie“.`
        )
        if (allErrors.length > 0) {
          setShowImportErrors(true)
        }
        await fetchData()
      } else {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/flights/import', { method: 'POST', body: formData })
        const result = await response.json()
        setImportProgress(100)

        if (!response.ok) {
          if (result.useChunkImport && result.rowCount) {
            setError(
              `${result.error} Bitte die Datei erneut auswählen – dann wird automatisch der Chunk-Import verwendet.`
            )
          } else {
            setError(result.error || 'Fehler beim Importieren')
          }
          return
        }

        const singleExtra =
          (result.skippedNonClub ?? 0) > 0 || (result.skippedUnknownAircraft ?? 0) > 0
            ? `, ${result.skippedNonClub ?? 0} Nicht-Vereinsflugzeuge, ${result.skippedUnknownAircraft ?? 0} unbek. Lfz. ignoriert`
            : ''
        setSuccess(
          result.importRunId
            ? `Import gespeichert (#${String(result.importRunId).slice(-6)}): ${result.created} Flüge importiert, ${result.aggregated} Flugbücher aktualisiert, ${result.skipped} übersprungen${singleExtra}. Siehe „Import-Historie“.`
            : `Import erfolgreich: ${result.created} Flüge importiert, ${result.aggregated} Flugbücher aktualisiert, ${result.skipped} übersprungen${singleExtra}`
        )
        if (result.errors?.length > 0) {
          setImportChunkErrors(
            result.errors.map((msg: string, idx: number) => ({
              rowIndexGlobal: idx,
              reason: msg,
              raw: {},
            }))
          )
          setImportSummary({
            created: result.created ?? 0,
            skipped: result.skipped ?? 0,
            totalErrors: result.errors.length,
            importRunId: result.importRunId,
          })
          setShowImportErrors(true)
        }
        await fetchData()
      }
    } catch (err) {
      console.error('Import error:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Importieren')
    } finally {
      setImporting(false)
      setTimeout(() => {
        setImportProgress(0)
        setImportStatus('')
      }, 300)
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
      const parts = [
        `${data.deletedFlights} Flüge gelöscht`,
        data.deletedWorkingHours > 0 ? `${data.deletedWorkingHours} Arbeitsstunden-Einträge gelöscht` : null,
        data.year != null ? `(Jahr ${data.year} vollständig entfernt)` : null,
      ].filter(Boolean)
      setSuccess(parts.join('. ') + '.')
      setDeleteConfirm(null)
      await fetchData()
      await fetchImportRuns()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Imports')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteLog = async () => {
    if (!deleteConfirmLog) return
    try {
      setDeletingLog(true)
      setError(null)
      setSuccess(null)
      const res = await fetch(`/api/flight-logs/${deleteConfirmLog.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Löschen fehlgeschlagen')
      const count = data.deletedFlights ?? 0
      setSuccess(
        count > 0
          ? `Eintrag gelöscht: ${count} Flüge und der Flugbucheintrag wurden entfernt.`
          : 'Flugbucheintrag gelöscht.'
      )
      setDeleteConfirmLog(null)
      await fetchData()
      if (showMemberStats) await fetchMemberStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen des Eintrags')
    } finally {
      setDeletingLog(false)
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
                Import erwartet Hauptflugbuch-Format (CSV/TSV oder XLSX/XLS) mit Spalten: Vereins-LFZ | Datum | Lfz. | Pilot | Begleiter/FI | Start | Zeit | Schleppzeit | Schlepp-LFZ | Startort | S.-Art | Flugart | Abr. | Bemerkung | Landung | Landeort. Nicht-Vereinsflugzeuge werden automatisch ignoriert.
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
                {importStatus || 'Datei wird importiert…'}
              </p>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.round(importProgress))}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                {importStatus ? `${importStatus} – ` : ''}
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
            <div className="mb-6 flex flex-col gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
              </div>
              {importChunkErrors.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm text-amber-700 dark:text-amber-300">
                    Import: {importChunkErrors.length} Fehler in Zeilen{' '}
                    {[...new Set(importChunkErrors.map((e) => e.rowIndexGlobal + 2))]
                      .sort((a, b) => a - b)
                      .slice(0, 15)
                      .join(', ')}
                    {importChunkErrors.length > 15 ? '…' : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowImportErrors(true)}
                    className="text-sm font-medium text-amber-700 dark:text-amber-300 hover:underline"
                  >
                    Details anzeigen
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob(
                        [JSON.stringify(importChunkErrors, null, 2)],
                        { type: 'application/json' }
                      )
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `import-fehler-${new Date().toISOString().slice(0, 10)}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-400 hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Fehler als JSON
                  </button>
                </div>
              )}
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
            {showMemberStats && memberStats.length > 0 && (() => {
              const totalFlights = memberStats.reduce((s, m) => s + m.flights, 0)
              const totalStarts = memberStats.reduce((s, m) => s + m.starts, 0)
              const totalHours = memberStats.reduce((s, m) => s + m.flightHours, 0)
              const pct = (v: number, t: number) => (t > 0 ? (v / t) * 100 : 0)
              return (
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
                          %
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Starts
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          %
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Flugstunden
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          %
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
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                            {totalFlights > 0 ? `${pct(stat.flights, totalFlights).toFixed(1).replace('.', ',')} %` : '–'}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100">
                            {stat.starts.toLocaleString('de-DE')}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                            {totalStarts > 0 ? `${pct(stat.starts, totalStarts).toFixed(1).replace('.', ',')} %` : '–'}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-900 dark:text-slate-100">
                            {stat.flightHours.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 tabular-nums">
                            {totalHours > 0 ? `${pct(stat.flightHours, totalHours).toFixed(1).replace('.', ',')} %` : '–'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })()}
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
                                <button
                                  onClick={() =>
                                    setDeleteConfirmLog({
                                      id: log.id,
                                      aircraftLabel:
                                        typeof log.aircraft === 'object'
                                          ? log.aircraft.registration ||
                                            log.aircraft.name ||
                                            log.aircraft.id
                                          : log.aircraft,
                                      year: log.year,
                                    })
                                  }
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Eintrag löschen (Flugzeug + Jahr inkl. aller Flüge)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
                                setDeleteConfirm({ id: run.id, fileName: run.fileName, year: run.year ?? undefined })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-sm font-medium"
                              title="Import rückgängig machen (ganzes Jahr: Flüge + Arbeitsstunden)"
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
              {deleteConfirm.year != null ? (
                <>
                  Es werden für <strong>Jahr {deleteConfirm.year}</strong> unwiderruflich gelöscht: alle
                  Flüge (Flugbewegungen) und alle manuell erfassten <strong>Arbeitsstunden</strong>.
                  Die Flugbücher (Starts/Flugstunden pro Flugzeug) werden danach automatisch angepasst.
                </>
              ) : (
                <>
                  Dieser Vorgang löscht <strong>alle Flüge</strong> des Imports &quot;{deleteConfirm.fileName}&quot; unwiderruflich.
                  Die Flugbucheinträge werden danach automatisch angepasst.
                </>
              )}
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

      {/* Dialog: Import-Fehler Details */}
      {showImportErrors && importChunkErrors.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-errors-title"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 id="import-errors-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Import: {importChunkErrors.length} Fehler
              </h2>
              <button
                type="button"
                onClick={() => setShowImportErrors(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Zeilen (1-basiert) mit Problem und Rohwerten. Top 10 unten; alle als JSON herunterladbar.
              </p>
              <ul className="space-y-3">
                {importChunkErrors.slice(0, 10).map((err, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm"
                  >
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      Zeile {err.rowIndexGlobal + 2}:
                    </span>{' '}
                    <span className="text-amber-700 dark:text-amber-300">{err.reason}</span>
                    {err.raw && Object.keys(err.raw).length > 0 && (
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {Object.entries(err.raw)
                          .filter(([, v]) => v != null && v !== '')
                          .map(([k, v]) => (
                            <div key={k}>
                              {k}: {String(v)}
                            </div>
                          ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {importChunkErrors.length > 10 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  … und {importChunkErrors.length - 10} weitere. Über „Fehler als JSON“ alle herunterladen.
                </p>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify(importChunkErrors, null, 2)],
                    { type: 'application/json' }
                  )
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `import-fehler-${new Date().toISOString().slice(0, 10)}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Fehler als JSON herunterladen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Einzelnen Flugbucheintrag löschen */}
      {deleteConfirmLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-log-title"
        >
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6">
            <h2 id="delete-log-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Eintrag löschen
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Diesen Flugbucheintrag (<strong>{deleteConfirmLog.aircraftLabel}</strong>, Jahr{' '}
              <strong>{deleteConfirmLog.year}</strong>) und <strong>alle zugehörigen Flüge</strong> unwiderruflich
              löschen? Der Eintrag ist danach überall entfernt (Tabelle und Flugstunden nach Mitglied).
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmLog(null)}
                disabled={deletingLog}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleDeleteLog}
                disabled={deletingLog}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingLog ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Wird gelöscht...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eintrag löschen
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
