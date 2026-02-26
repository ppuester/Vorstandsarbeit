'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Save, X, AlertCircle, CheckCircle, Trash2, Clock } from 'lucide-react'

interface Member {
  id: string
  name: string
  memberNumber?: string
}

interface WorkingHour {
  id: string
  member: Member | string
  date: string
  hours: number
  type: 'glider' | 'motor' | 'administration' | 'maintenance' | 'other'
  description?: string
  notes?: string
}

interface MemberSummaryItem {
  memberId: string | null
  memberName: string
  matched: boolean
  totals: {
    gliderMin: number
    motorMin: number
    towMin: number
    gliderHours: number
    motorHours: number
    towHours: number
  }
  detailsCount: { glider: number; motor: number; tow: number }
}

interface FlightDetailItem {
  id: string
  date: string
  aircraftRegistration: string
  pilotName: string
  workingMinutesGlider: number
  workingMinutesMotor: number
  workingMinutesTow: number
  sourceTowAircraftRegistration?: string
  departureLocation?: string
  landingLocation?: string
  notes?: string
}

function formatMinHours(min: number): string {
  const h = Number((min / 60).toFixed(2))
  return `${min} min (${h.toLocaleString('de-DE')} h)`
}

const typeLabels: Record<string, string> = {
  glider: 'Segelflug',
  motor: 'Motorflug',
  administration: 'Verwaltung',
  maintenance: 'Wartung',
  other: 'Sonstiges',
}

export default function ArbeitsstundenPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    member: string
    date: string
    hours: number
    type: 'glider' | 'motor' | 'administration' | 'maintenance' | 'other'
    description: string
    notes: string
  }>({
    member: '',
    date: new Date().toISOString().split('T')[0],
    hours: 0,
    type: 'glider',
    description: '',
    notes: '',
  })

  const currentYear = new Date().getFullYear()
  const [flightSummaryYear, setFlightSummaryYear] = useState(currentYear)
  const [flightSummaryList, setFlightSummaryList] = useState<MemberSummaryItem[]>([])
  const [includeUnmatched, setIncludeUnmatched] = useState(true)
  const [drilldown, setDrilldown] = useState<{
    memberId: string | null
    pilotName: string
    category: 'glider' | 'motor' | 'tow'
    label: string
  } | null>(null)
  const [details, setDetails] = useState<FlightDetailItem[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const params = new URLSearchParams({ year: String(flightSummaryYear) })
        if (includeUnmatched) params.append('includeUnmatched', 'true')
        const res = await fetch(
          `/api/working-hours/flight-based/member-summary?${params.toString()}`
        )
        if (res.ok) {
          const data = await res.json()
          setFlightSummaryList(Array.isArray(data) ? data : [])
        } else {
          setFlightSummaryList([])
        }
      } catch (_err) {
        setFlightSummaryList([])
      }
    }
    fetchSummary()
  }, [flightSummaryYear, includeUnmatched])

  useEffect(() => {
    if (!drilldown) {
      setDetails([])
      return
    }
    setDetailsLoading(true)
    const params = new URLSearchParams({
      year: String(flightSummaryYear),
      category: drilldown.category,
    })
    if (drilldown.memberId) params.append('memberId', drilldown.memberId)
    else if (drilldown.pilotName) params.append('pilotName', drilldown.pilotName)
    fetch(`/api/working-hours/flight-based/member-details?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDetails(Array.isArray(data) ? data : []))
      .catch(() => setDetails([]))
      .finally(() => setDetailsLoading(false))
  }, [drilldown, flightSummaryYear])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [membersRes, hoursRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/working-hours'),
      ])

      if (membersRes.ok) {
        const data = await membersRes.json()
        setMembers(data.docs || [])
      }

      if (hoursRes.ok) {
        const data = await hoursRes.json()
        setWorkingHours(data.docs || [])
      }
    } catch (err) {
      console.error('Fehler beim Laden:', err)
      setError('Fehler beim Laden der Daten')
    } finally {
      setLoading(false)
    }
  }

  const openDrilldown = (
    memberId: string | null,
    pilotName: string,
    category: 'glider' | 'motor' | 'tow',
    label: string
  ) => {
    setDrilldown({ memberId, pilotName, category, label })
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({
      member: '',
      date: new Date().toISOString().split('T')[0],
      hours: 0,
      type: 'glider',
      description: '',
      notes: '',
    })
    setError(null)
    setSuccess(null)
    setShowModal(true)
  }

  const handleEdit = (item: WorkingHour) => {
    setEditingId(item.id)
    const memberId =
      typeof item.member === 'object' && item.member !== null ? item.member.id : item.member
    setFormData({
      member: memberId || '',
      date: item.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      hours: item.hours,
      type: item.type,
      description: item.description || '',
      notes: item.notes || '',
    })
    setError(null)
    setSuccess(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.member || !formData.date || formData.hours == null) {
      setError('Bitte alle Pflichtfelder ausfüllen.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const payloadData = {
        member: formData.member,
        date: formData.date,
        hours: Number(formData.hours),
        type: formData.type,
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      }

      if (editingId) {
        const res = await fetch(`/api/working-hours/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadData),
        })

        if (res.ok) {
          setSuccess('Eintrag erfolgreich aktualisiert.')
          setShowModal(false)
          await fetchData()
        } else {
          const data = await res.json()
          setError(data.error || 'Fehler beim Aktualisieren.')
        }
      } else {
        const res = await fetch('/api/working-hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadData),
        })

        if (res.ok) {
          setSuccess('Eintrag erfolgreich erstellt.')
          setShowModal(false)
          await fetchData()
        } else {
          const data = await res.json()
          setError(data.error || 'Fehler beim Erstellen.')
        }
      }
    } catch (err) {
      console.error('Fehler beim Speichern:', err)
      setError('Fehler beim Speichern.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) return

    try {
      const res = await fetch(`/api/working-hours/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Eintrag erfolgreich gelöscht.')
        await fetchData()
      } else {
        setError('Fehler beim Löschen.')
      }
    } catch (err) {
      console.error('Fehler beim Löschen:', err)
      setError('Fehler beim Löschen.')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setShowModal(false)
  }

  const getMemberName = (workingHour: WorkingHour) => {
    if (typeof workingHour.member === 'object' && workingHour.member !== null) {
      return workingHour.member.memberNumber
        ? `${workingHour.member.name} (${workingHour.member.memberNumber})`
        : workingHour.member.name
    }
    const member = members.find((m) => m.id === workingHour.member)
    return member?.memberNumber ? `${member.name} (${member.memberNumber})` : member?.name || '–'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Lade Arbeitsstunden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900 dark:bg-slate-100 rounded-xl shadow-sm">
                <Clock className="w-8 h-8 text-white dark:text-slate-900" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Arbeitsstunden
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Erfassen und verwalten Sie geleistete Arbeitsstunden
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Neuer Eintrag
              </button>
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

          {/* Arbeitsstunden aus Flugbewegungen */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Aus Flugbewegungen
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={includeUnmatched}
                    onChange={(e) => setIncludeUnmatched(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600"
                  />
                  Unzugeordnete anzeigen
                </label>
                <select
                  value={flightSummaryYear}
                  onChange={(e) => setFlightSummaryYear(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm"
                >
                  {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                        Mitglied
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                        Segelflug
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                        Motorflug
                      </th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                        Schlepp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {flightSummaryList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-slate-500 dark:text-slate-400"
                        >
                          Keine Daten für {flightSummaryYear}. Bitte zuerst Flugbewegungen unter Flugstunden &amp; Starts importieren.
                        </td>
                      </tr>
                    ) : (
                      flightSummaryList.map((row) => (
                        <tr
                          key={row.memberId ?? `name:${row.memberName}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="py-3 px-6">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {row.memberName}
                            </span>
                            {!row.matched && (
                              <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                (nicht zugeordnet)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-6">
                            {row.totals.gliderMin > 0 || row.detailsCount.glider > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openDrilldown(
                                    row.memberId,
                                    row.memberName,
                                    'glider',
                                    'Segelflug'
                                  )
                                }
                                className="text-left text-violet-600 dark:text-violet-400 hover:underline font-medium"
                              >
                                {formatMinHours(row.totals.gliderMin)}
                              </button>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">–</span>
                            )}
                          </td>
                          <td className="py-3 px-6">
                            {row.totals.motorMin > 0 || row.detailsCount.motor > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openDrilldown(
                                    row.memberId,
                                    row.memberName,
                                    'motor',
                                    'Motorflug'
                                  )
                                }
                                className="text-left text-violet-600 dark:text-violet-400 hover:underline font-medium"
                              >
                                {formatMinHours(row.totals.motorMin)}
                              </button>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">–</span>
                            )}
                          </td>
                          <td className="py-3 px-6">
                            {row.totals.towMin > 0 || row.detailsCount.tow > 0 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openDrilldown(
                                    row.memberId,
                                    row.memberName,
                                    'tow',
                                    'Schlepp'
                                  )
                                }
                                className="text-left text-violet-600 dark:text-violet-400 hover:underline font-medium"
                              >
                                {formatMinHours(row.totals.towMin)}
                              </button>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">–</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Manuell erfasste Arbeitsstunden */}
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Manuell erfasste Arbeitsstunden
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Mitglied
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Datum
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Stunden
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Art
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Beschreibung
                    </th>
                    <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {workingHours.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        Keine Arbeitsstunden erfasst
                      </td>
                    </tr>
                  ) : (
                    workingHours.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="py-3 px-6 text-slate-900 dark:text-slate-100">
                          {getMemberName(item)}
                        </td>
                        <td className="py-3 px-6 text-slate-600 dark:text-slate-400">
                          {new Date(item.date).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-3 px-6 text-slate-900 dark:text-slate-100 font-medium">
                          {item.hours}h
                        </td>
                        <td className="py-3 px-6 text-slate-600 dark:text-slate-400">
                          {typeLabels[item.type] || item.type}
                        </td>
                        <td className="py-3 px-6 text-slate-600 dark:text-slate-400">
                          {item.description || '–'}
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Berechnung der Arbeitsstunden
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {workingHours.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}h
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Pflicht Arbeitsstunden
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">–</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Ergebnis Segelflug
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {workingHours
                  .filter((item) => item.type === 'glider')
                  .reduce((sum, item) => sum + item.hours, 0)
                  .toFixed(1)}
                h
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Ergebnis Motorflug
              </h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {workingHours
                  .filter((item) => item.type === 'motor')
                  .reduce((sum, item) => sum + item.hours, 0)
                  .toFixed(1)}
                h
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {editingId ? 'Arbeitsstunden bearbeiten' : 'Neue Arbeitsstunden'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Mitglied <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.member || ''}
                  onChange={(e) => setFormData({ ...formData, member: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                >
                  <option value="">Bitte wählen...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.memberNumber ? `${member.name} (${member.memberNumber})` : member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Datum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Stunden <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.hours || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, hours: Number.parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Art <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type || 'glider'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as WorkingHour['type'],
                    })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  required
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notizen
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Speichern
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drilldown Dialog (Aus Flugbewegungen) */}
      {drilldown && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-label="Detail-Liste"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {drilldown.label} – {drilldown.pilotName}
              </h2>
              <button
                type="button"
                onClick={() => setDrilldown(null)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                aria-label="Schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-slate-900 dark:border-slate-100 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : details.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                  Keine Einträge
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        Datum
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        LFZ
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        Min
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        Schlepp-LFZ
                      </th>
                      <th className="text-left py-2 px-2 font-medium text-slate-600 dark:text-slate-400">
                        Start / Landeort
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {details.map((f) => (
                      <tr key={f.id}>
                        <td className="py-2 px-2 text-slate-900 dark:text-slate-100">
                          {f.date ? new Date(f.date).toLocaleDateString('de-DE') : '–'}
                        </td>
                        <td className="py-2 px-2 text-slate-700 dark:text-slate-300">
                          {f.aircraftRegistration || '–'}
                        </td>
                        <td className="py-2 px-2">
                          {drilldown.category === 'glider' && f.workingMinutesGlider}
                          {drilldown.category === 'motor' && f.workingMinutesMotor}
                          {drilldown.category === 'tow' && f.workingMinutesTow}
                          {' min'}
                        </td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                          {f.sourceTowAircraftRegistration || '–'}
                        </td>
                        <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                          {[f.departureLocation, f.landingLocation].filter(Boolean).join(' → ') || '–'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
