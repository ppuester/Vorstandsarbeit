'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Calendar,
  Plane,
  Fuel,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react'
import { useOrganization } from '@/providers/Organization'

interface Aircraft {
  id: string
  registration: string
  name?: string
  active?: boolean
}

interface FuelEntryRow {
  id: string // Temporäre ID für die Zeile
  date: string
  name: string
  aircraft: string
  fuelType: 'avgas' | 'mogas'
  meterReadingOld: number
  meterReadingNew: number
  liters: number
  pricePerLiter: number
  totalPrice: number
  gasStation: string
  invoiceNumber: string
  notes: string
}

export default function KraftstofferfassungPage() {
  const { isFeatureEnabled } = useOrganization()
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [duplicateWarnings, setDuplicateWarnings] = useState<Record<string, string>>({})

  const [rows, setRows] = useState<FuelEntryRow[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      name: '',
      aircraft: '',
      fuelType: 'avgas',
      meterReadingOld: 0,
      meterReadingNew: 0,
      liters: 0,
      pricePerLiter: 0,
      totalPrice: 0,
      gasStation: '',
      invoiceNumber: '',
      notes: '',
    },
  ])

  const rowIdCounter = useRef(1)

  useEffect(() => {
    if (!isFeatureEnabled('fuelTracking')) {
      setLoading(false)
      return
    }

    fetchAircraft()
  }, [isFeatureEnabled])

  const fetchAircraft = async () => {
    try {
      const response = await fetch('/api/aircraft')
      if (response.ok) {
        const data = await response.json()
        setAircraft(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Flugzeuge:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRow = () => {
    rowIdCounter.current += 1
    const newRow: FuelEntryRow = {
      id: rowIdCounter.current.toString(),
      date: rows[0]?.date || new Date().toISOString().split('T')[0],
      name: '',
      aircraft: '',
      fuelType: 'avgas',
      meterReadingOld: 0,
      meterReadingNew: 0,
      liters: 0,
      pricePerLiter: 0,
      totalPrice: 0,
      gasStation: '',
      invoiceNumber: '',
      notes: '',
    }
    setRows([...rows, newRow])
  }

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id))
      const newWarnings = { ...duplicateWarnings }
      delete newWarnings[id]
      setDuplicateWarnings(newWarnings)
    }
  }

  const updateRow = (id: string, field: keyof FuelEntryRow, value: any) => {
    setRows(
      rows.map((row) => {
        if (row.id !== id) return row

        const updated = { ...row, [field]: value }

        // Berechne Liter automatisch
        if (field === 'meterReadingOld' || field === 'meterReadingNew') {
          const liters = Math.max(0, updated.meterReadingNew - updated.meterReadingOld)
          updated.liters = Number(liters.toFixed(2))
        }

        // Berechne Gesamtpreis automatisch
        if (field === 'liters' || field === 'pricePerLiter') {
          updated.totalPrice = Number((updated.liters * updated.pricePerLiter).toFixed(2))
        }

        return updated
      })
    )

    // Entferne Warnung für diese Zeile
    if (duplicateWarnings[id]) {
      const newWarnings = { ...duplicateWarnings }
      delete newWarnings[id]
      setDuplicateWarnings(newWarnings)
    }
  }

  const checkDuplicate = async (entry: FuelEntryRow): Promise<boolean> => {
    try {
      const response = await fetch('/api/fuel-entries/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: entry.date,
          name: entry.name.toUpperCase(),
          aircraft: entry.aircraft,
          fuelType: entry.fuelType,
          meterReadingOld: entry.meterReadingOld,
          meterReadingNew: entry.meterReadingNew,
          gasStation: entry.gasStation,
          invoiceNumber: entry.invoiceNumber,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        return result.isDuplicate || false
      }
      return false
    } catch (error) {
      console.error('Fehler beim Prüfen auf Duplikate:', error)
      return false
    }
  }

  const saveAll = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    setDuplicateWarnings({})

    const validRows = rows.filter(
      (row) =>
        row.name.trim() &&
        row.aircraft &&
        row.meterReadingNew > row.meterReadingOld &&
        row.liters > 0 &&
        row.pricePerLiter > 0
    )

    if (validRows.length === 0) {
      setError('Bitte füllen Sie mindestens eine Zeile vollständig aus.')
      setSaving(false)
      return
    }

    let savedCount = 0
    let skippedCount = 0
    const newWarnings: Record<string, string> = {}

    for (const row of validRows) {
      const isDuplicate = await checkDuplicate(row)
      if (isDuplicate) {
        newWarnings[row.id] = 'Duplikat - übersprungen'
        skippedCount++
        continue
      }

      try {
        const submitData = new FormData()
        submitData.append('date', row.date)
        submitData.append('name', row.name.toUpperCase())
        submitData.append('aircraft', row.aircraft)
        submitData.append('fuelType', row.fuelType)
        submitData.append('meterReadingOld', row.meterReadingOld.toString())
        submitData.append('meterReadingNew', row.meterReadingNew.toString())
        submitData.append('liters', row.liters.toString())
        submitData.append('pricePerLiter', row.pricePerLiter.toString())
        submitData.append('totalPrice', row.totalPrice.toString())
        submitData.append('gasStation', row.gasStation || '')
        submitData.append('invoiceNumber', row.invoiceNumber || '')
        submitData.append('notes', row.notes || '')

        const response = await fetch('/api/fuel-entries', {
          method: 'POST',
          body: submitData,
        })

        if (response.ok) {
          savedCount++
        } else {
          newWarnings[row.id] = 'Fehler beim Speichern'
        }
      } catch (error) {
        console.error('Fehler beim Speichern:', error)
        newWarnings[row.id] = 'Fehler beim Speichern'
      }
    }

    setDuplicateWarnings(newWarnings)

    if (savedCount > 0) {
      setSuccess(`${savedCount} Eintrag${savedCount > 1 ? 'e' : ''} erfolgreich gespeichert.`)
      // Leere Zeilen zurücksetzen, behalte eine leere Zeile
      setRows([
        {
          id: (++rowIdCounter.current).toString(),
          date: rows[0]?.date || new Date().toISOString().split('T')[0],
          name: '',
          aircraft: '',
          fuelType: 'avgas',
          meterReadingOld: 0,
          meterReadingNew: 0,
          liters: 0,
          pricePerLiter: 0,
          totalPrice: 0,
          gasStation: '',
          invoiceNumber: '',
          notes: '',
        },
      ])
    }

    if (skippedCount > 0 && savedCount === 0) {
      setError(`${skippedCount} Eintrag${skippedCount > 1 ? 'e' : ''} wurden übersprungen (Duplikate).`)
    }

    setSaving(false)
  }

  if (!isFeatureEnabled('fuelTracking')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Nicht verfügbar</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Die Kraftstofferfassung ist für diese Organisation nicht aktiviert.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Lade...</div>
      </div>
    )
  }

  const activeAircraft = aircraft.filter((ac) => ac.active !== false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Kraftstofferfassung
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Schnellerfassung für manuell geschriebene Zettel
            </p>
          </div>

          {/* Messages */}
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

          {/* Table */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Flugzeug
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Kraftstoff
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Zähler alt
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Zähler neu
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Liter
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Preis/L
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Gesamt
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Tankstelle
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Rechnungsnr.
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Notizen
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {rows.map((row, index) => {
                    const hasWarning = duplicateWarnings[row.id]
                    return (
                      <tr
                        key={row.id}
                        className={`${
                          hasWarning
                            ? 'bg-yellow-50 dark:bg-yellow-900/10'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                        } transition-colors`}
                      >
                        <td className="py-2 px-4">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => updateRow(row.id, 'name', e.target.value.toUpperCase())}
                            placeholder="MAX MUSTERMANN"
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-slate-100 uppercase focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <select
                            value={row.aircraft}
                            onChange={(e) => updateRow(row.id, 'aircraft', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          >
                            <option value="">–</option>
                            {activeAircraft.map((ac) => (
                              <option key={ac.id} value={ac.id}>
                                {ac.registration}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <select
                            value={row.fuelType}
                            onChange={(e) => updateRow(row.id, 'fuelType', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          >
                            <option value="avgas">Avgas</option>
                            <option value="mogas">Mogas</option>
                          </select>
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.meterReadingOld || ''}
                            onChange={(e) =>
                              updateRow(row.id, 'meterReadingOld', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.meterReadingNew || ''}
                            onChange={(e) =>
                              updateRow(row.id, 'meterReadingNew', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            step="0.01"
                            value={row.liters.toFixed(2)}
                            readOnly
                            className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-right text-slate-600 dark:text-slate-400 cursor-not-allowed"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.pricePerLiter || ''}
                            onChange={(e) =>
                              updateRow(row.id, 'pricePerLiter', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-right text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            step="0.01"
                            value={row.totalPrice.toFixed(2)}
                            readOnly
                            className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-right text-slate-600 dark:text-slate-400 cursor-not-allowed"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={row.gasStation}
                            onChange={(e) => updateRow(row.id, 'gasStation', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={row.invoiceNumber}
                            onChange={(e) => updateRow(row.id, 'invoiceNumber', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                        </td>
                        <td className="py-2 px-4">
                          {rows.length > 1 && (
                            <button
                              onClick={() => removeRow(row.id)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Zeile löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {hasWarning && (
                            <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                              {hasWarning}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="bg-slate-100 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600 p-4 flex items-center justify-between">
              <button
                onClick={addRow}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Zeile hinzufügen
              </button>
              <button
                onClick={saveAll}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Speichere...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Alle speichern
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">Hinweise zur Schnellerfassung:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                  <li>Liter und Gesamtpreis werden automatisch berechnet</li>
                  <li>Verwenden Sie die Tab-Taste für schnelle Navigation zwischen Feldern</li>
                  <li>Duplikate werden automatisch erkannt und übersprungen</li>
                  <li>Mehrere Einträge können auf einmal gespeichert werden</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
