'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import {
  Save,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react'
import { useOrganization } from '@/providers/Organization'
import { useSearchParams } from 'next/navigation'

interface Aircraft {
  id: string
  registration: string
  name?: string
  active?: boolean
}

interface Member {
  id: string
  name: string
  memberNumber?: string
  active?: boolean
}

interface FuelEntryRow {
  id: string // Temporäre ID für die Zeile
  date: string
  member: string // Mitglied-ID statt Name
  aircraft: string
  fuelType: 'avgas' | 'mogas'
  meterReadingOld: number
  meterReadingNew: number
  liters: number
  pricePerLiter: number
  totalPrice: number
  notes: string
}

function KraftstofferfassungContent() {
  const { isFeatureEnabled } = useOrganization()
  const searchParams = useSearchParams()
  const accessToken = searchParams.get('token')
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [duplicateWarnings, setDuplicateWarnings] = useState<Record<string, string>>({})

  const [rows, setRows] = useState<FuelEntryRow[]>([
    {
      id: '1',
      date: new Date().toISOString().split('T')[0],
      member: '',
      aircraft: '',
      fuelType: 'avgas',
      meterReadingOld: 0,
      meterReadingNew: 0,
      liters: 0,
      pricePerLiter: 0,
      totalPrice: 0,
      notes: '',
    },
  ])

  const rowIdCounter = useRef(1)

  useEffect(() => {
    // Wenn Token vorhanden, Feature ist automatisch aktiviert
    if (accessToken || isFeatureEnabled('fuelTracking')) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [isFeatureEnabled, accessToken])

  const fetchData = async () => {
    try {
      const tokenParam = accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''
      const membersUrl = accessToken 
        ? `/api/members?token=${encodeURIComponent(accessToken)}&activeOnly=true`
        : '/api/members?activeOnly=true'
      
      const [aircraftRes, membersRes] = await Promise.all([
        fetch(`/api/aircraft${tokenParam}`),
        fetch(membersUrl),
      ])

      if (aircraftRes.ok) {
        const data = await aircraftRes.json()
        setAircraft(data.docs || [])
      } else if (aircraftRes.status === 403) {
        setError('Keine Berechtigung für diesen Zugang')
      }

      if (membersRes.ok) {
        const data = await membersRes.json()
        setMembers(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRow = () => {
    rowIdCounter.current += 1
    const newRow: FuelEntryRow = {
      id: rowIdCounter.current.toString(),
      date: rows[0]?.date || new Date().toISOString().split('T')[0],
      member: '',
      aircraft: '',
      fuelType: 'avgas',
      meterReadingOld: 0,
      meterReadingNew: 0,
      liters: 0,
      pricePerLiter: 0,
      totalPrice: 0,
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
    const currentIndex = rows.findIndex((r) => r.id === id)
    
    setRows(
      rows.map((row, index) => {
        if (row.id !== id) {
          // Wenn "Zählerstand neu" in der vorherigen Zeile geändert wurde, übernehme den Wert als "Zählerstand alt"
          if (field === 'meterReadingNew' && index === currentIndex + 1 && value > 0) {
            return { ...row, meterReadingOld: value }
          }
          return row
        }

        const updated = { ...row, [field]: value }

        // Berechne Liter automatisch
        if (field === 'meterReadingOld' || field === 'meterReadingNew') {
          const liters = Math.max(0, updated.meterReadingNew - updated.meterReadingOld)
          updated.liters = Number(liters.toFixed(2))
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
      const url = accessToken 
        ? `/api/fuel-entries/check-duplicate?token=${encodeURIComponent(accessToken)}`
        : '/api/fuel-entries/check-duplicate'
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          date: entry.date,
          member: entry.member,
          aircraft: entry.aircraft,
          fuelType: entry.fuelType,
          meterReadingOld: entry.meterReadingOld,
          meterReadingNew: entry.meterReadingNew,
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
        row.member &&
        row.aircraft &&
        row.meterReadingNew > row.meterReadingOld &&
        row.liters > 0
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
        // Hole Mitgliedsname aus members Array
        const member = members.find((m) => m.id === row.member)
        submitData.append('name', member?.name.toUpperCase() || '')
        submitData.append('aircraft', row.aircraft)
        submitData.append('fuelType', row.fuelType)
        submitData.append('meterReadingOld', row.meterReadingOld.toString())
        submitData.append('meterReadingNew', row.meterReadingNew.toString())
        submitData.append('liters', row.liters.toString())
        submitData.append('pricePerLiter', '0')
        submitData.append('totalPrice', '0')
        submitData.append('notes', row.notes || '')

        const url = accessToken 
          ? `/api/fuel-entries?token=${encodeURIComponent(accessToken)}`
          : '/api/fuel-entries'
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
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
          member: '',
          aircraft: '',
          fuelType: 'avgas',
          meterReadingOld: 0,
          meterReadingNew: 0,
          liters: 0,
          pricePerLiter: 0,
          totalPrice: 0,
          notes: '',
        },
      ])
    }

    if (skippedCount > 0 && savedCount === 0) {
      setError(`${skippedCount} Eintrag${skippedCount > 1 ? 'e' : ''} wurden übersprungen (Duplikate).`)
    }

    setSaving(false)
  }

  // Prüfe ob Feature aktiviert ist oder Token vorhanden
  if (!accessToken && !isFeatureEnabled('fuelTracking')) {
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
                          <select
                            value={row.member}
                            onChange={(e) => updateRow(row.id, 'member', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                          >
                            <option value="">–</option>
                            {members
                              .filter((m) => m.active !== false)
                              .map((member) => (
                                <option key={member.id} value={member.id}>
                                  {member.name} {member.memberNumber ? `(${member.memberNumber})` : ''}
                                </option>
                              ))}
                          </select>
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
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value) || 0
                              updateRow(row.id, 'meterReadingNew', newValue)
                              
                              // Übernehme den Wert in die nächste Zeile als "Zählerstand alt"
                              if (newValue > 0 && index < rows.length - 1) {
                                const nextRow = rows[index + 1]
                                if (nextRow) {
                                  setRows((prevRows) =>
                                    prevRows.map((r) =>
                                      r.id === nextRow.id ? { ...r, meterReadingOld: newValue } : r
                                    )
                                  )
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const newValue = parseFloat(e.target.value) || 0
                              // Wenn eine neue Zeile hinzugefügt werden soll, füge sie hinzu
                              if (newValue > 0 && index === rows.length - 1) {
                                const newRowId = (rowIdCounter.current + 1).toString()
                                rowIdCounter.current += 1
                                const newRow: FuelEntryRow = {
                                  id: newRowId,
                                  date: row.date,
                                  member: row.member, // Gleiches Mitglied übernehmen
                                  aircraft: row.aircraft, // Gleiches Flugzeug übernehmen
                                  fuelType: row.fuelType, // Gleicher Kraftstoff übernehmen
                                  meterReadingOld: newValue, // Zählerstand neu wird zu alt
                                  meterReadingNew: 0,
                                  liters: 0,
                                  pricePerLiter: 0,
                                  totalPrice: 0,
                                  notes: '',
                                }
                                setRows([...rows, newRow])
                              }
                            }}
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
                  <li>Liter werden automatisch aus Zählerständen berechnet</li>
                  <li>Wenn Sie &quot;Zählerstand neu&quot; eingeben, wird dieser Wert automatisch in die nächste Zeile als &quot;Zählerstand alt&quot; übernommen</li>
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

export default function KraftstofferfassungPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Lade...</div>
      </div>
    }>
      <KraftstofferfassungContent />
    </Suspense>
  )
}
