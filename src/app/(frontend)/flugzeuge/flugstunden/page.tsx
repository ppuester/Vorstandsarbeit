'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Save, X, AlertCircle, CheckCircle, Edit2 } from 'lucide-react'
import Link from 'next/link'

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

export default function FlugstundenPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
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
            </div>
            <div className="flex gap-3">
              <Link
                href="/flugzeuge/flugstunden/auswertung"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Auswertung & Vergleich
              </Link>
              {!showForm && !editingId && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Neuer Eintrag
                </button>
              )}
            </div>
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
    </div>
  )
}
