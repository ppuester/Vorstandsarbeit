'use client'

import React, { useState, useEffect } from 'react'
import {
  Plane,
  Plus,
  Edit2,
  Filter,
  Search,
  X,
  Save,
  Calendar,
  DollarSign,
  Fuel,
  Wrench,
  Shield,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface Aircraft {
  id: string
  registration: string
  name?: string
  aircraftGroup: 'ul' | 'glider' | 'motor' | 'motor-glider' | 'helicopter' | 'other'
  manufacturer?: string
  model?: string
  active: boolean
  purchaseDate?: string
  purchasePrice?: number
  insurance?: number
  hangar?: number
  annualInspection?: number
  fixedCosts?: number
  fuelConsumption?: number
  fuelPrice?: number
  maintenanceCostPerHour?: number
  engineHoursTotal?: number
  flightHoursTotal?: number
}

const aircraftGroupLabels: Record<string, string> = {
  ul: 'UL (Ultraleicht)',
  glider: 'Segelflugzeug',
  motor: 'Motorflugzeug',
  'motor-glider': 'Motorsegler',
  helicopter: 'Hubschrauber',
  other: 'Sonstiges',
}

const aircraftGroupIcons: Record<string, string> = {
  ul: '✈️',
  glider: '🪂',
  motor: '🛩️',
  'motor-glider': '🛫',
  helicopter: '🚁',
  other: '✈️',
}

export default function FlugzeugePage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<Partial<Aircraft>>({
    registration: '',
    name: '',
    aircraftGroup: 'motor',
    manufacturer: '',
    model: '',
    active: true,
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAircraft()
  }, [])

  const fetchAircraft = async () => {
    try {
      setLoading(true)
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

  const handleCreateAircraft = async () => {
    // Validate
    const errors: Record<string, string> = {}
    if (!formData.registration || formData.registration.trim() === '') {
      errors.registration = 'Kennzeichen ist erforderlich'
    }
    if (!formData.aircraftGroup) {
      errors.aircraftGroup = 'Flugzeugtyp ist erforderlich'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/aircraft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const created = await response.json()
        setAircraft([...aircraft, created])
        setShowCreateModal(false)
        setFormData({
          registration: '',
          name: '',
          aircraftGroup: 'motor',
          manufacturer: '',
          model: '',
          active: true,
        })
        setFormErrors({})
      } else {
        const error = await response.json()
        alert('Fehler beim Erstellen: ' + (error.error || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Flugzeugs:', error)
      alert('Fehler beim Erstellen des Flugzeugs')
    } finally {
      setSaving(false)
    }
  }

  const filteredAircraft = aircraft.filter((ac) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !ac.registration.toLowerCase().includes(searchLower) &&
        !ac.name?.toLowerCase().includes(searchLower) &&
        !ac.manufacturer?.toLowerCase().includes(searchLower) &&
        !ac.model?.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    if (filterGroup !== 'all' && ac.aircraftGroup !== filterGroup) {
      return false
    }

    if (filterActive === 'active' && !ac.active) return false
    if (filterActive === 'inactive' && ac.active) return false

    return true
  })

  // Group by aircraft group
  const groupedAircraft = filteredAircraft.reduce((acc, ac) => {
    const group = ac.aircraftGroup
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(ac)
    return acc
  }, {} as Record<string, Aircraft[]>)

  // Calculate total fixed costs per aircraft
  const getTotalFixedCosts = (ac: Aircraft) => {
    return (
      (ac.insurance || 0) +
      (ac.hangar || 0) +
      (ac.annualInspection || 0) +
      (ac.fixedCosts || 0)
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Flugzeugflotte...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Flugzeugflotte
                </h1>
                <p className="text-slate-600 mt-1">Verwalten Sie Ihre Flugzeugstammdaten</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Neues Flugzeug anlegen
              </button>
              <Link
                href="/flugzeuge/kostenermittlung"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-violet-600 border-2 border-violet-600 rounded-xl hover:bg-violet-50 transition-all font-semibold"
              >
                <TrendingUp className="w-5 h-5" />
                Kostenermittlung
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Gesamt Flugzeuge</span>
                <Plane className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{aircraft.length}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Aktive</span>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {aircraft.filter((ac) => ac.active).length}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Inaktiv</span>
                <XCircle className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-slate-400">
                {aircraft.filter((ac) => !ac.active).length}
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Ø Fixkosten p.a.</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {aircraft.length > 0
                  ? (
                      aircraft.reduce((sum, ac) => sum + getTotalFixedCosts(ac), 0) /
                      aircraft.length
                    ).toFixed(0)
                  : '0'}{' '}
                €
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Suchen nach Kennzeichen, Name, Hersteller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="all">Alle Typen</option>
                  {Object.entries(aircraftGroupLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterActive}
                  onChange={(e) =>
                    setFilterActive(e.target.value as 'all' | 'active' | 'inactive')
                  }
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="all">Alle</option>
                  <option value="active">Nur aktive</option>
                  <option value="inactive">Nur inaktive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aircraft Fleet - Card Layout */}
          {Object.keys(groupedAircraft).length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-12 text-center">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Keine Flugzeuge gefunden
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || filterGroup !== 'all' || filterActive !== 'all'
                  ? 'Keine Flugzeuge entsprechen den Filterkriterien.'
                  : 'Erstellen Sie Ihr erstes Flugzeug, um zu beginnen.'}
              </p>
              {!searchTerm && filterGroup === 'all' && filterActive === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Erstes Flugzeug erstellen
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAircraft)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([group, aircraftList]) => (
                  <div
                    key={group}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{aircraftGroupIcons[group] || '✈️'}</span>
                          <h2 className="text-xl font-bold text-white">
                            {aircraftGroupLabels[group]} ({aircraftList.length})
                          </h2>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aircraftList.map((ac) => (
                          <div
                            key={ac.id}
                            className="bg-white rounded-xl border-2 border-slate-200 hover:border-violet-400 hover:shadow-lg transition-all p-6 group"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Plane className="w-5 h-5 text-violet-600" />
                                  <h3 className="text-xl font-bold text-slate-900">
                                    {ac.registration}
                                  </h3>
                                  {!ac.active && (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                      Inaktiv
                                    </span>
                                  )}
                                </div>
                                {ac.name && (
                                  <p className="text-sm text-slate-600 mb-2">{ac.name}</p>
                                )}
                                {(ac.manufacturer || ac.model) && (
                                  <p className="text-xs text-slate-500">
                                    {ac.manufacturer} {ac.model}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="space-y-2 mb-4">
                              {ac.flightHoursTotal !== undefined && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {ac.flightHoursTotal.toFixed(1)} h Gesamt
                                  </span>
                                </div>
                              )}
                              {getTotalFixedCosts(ac) > 0 && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{getTotalFixedCosts(ac).toFixed(0)} € Fixkosten p.a.</span>
                                </div>
                              )}
                              {ac.fuelConsumption && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <Fuel className="w-4 h-4" />
                                  <span>{ac.fuelConsumption} l/h</span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-slate-200">
                              <Link
                                href={`/flugzeuge/${ac.id}`}
                                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium text-center"
                              >
                                Details
                              </Link>
                              <Link
                                href={`/admin/collections/aircraft/${ac.id}`}
                                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm flex items-center gap-1"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Aircraft Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Neues Flugzeug anlegen</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Erfassen Sie die Stammdaten des Flugzeugs
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({
                      registration: '',
                      name: '',
                      aircraftGroup: 'motor',
                      manufacturer: '',
                      model: '',
                      active: true,
                    })
                    setFormErrors({})
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Grunddaten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Kennzeichen <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.registration || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, registration: e.target.value.toUpperCase() })
                      }
                      placeholder="z.B. D-ABCD"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        formErrors.registration ? 'border-red-500' : 'border-slate-300'
                      }`}
                    />
                    {formErrors.registration && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.registration}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Name/Bezeichnung
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Flugzeugtyp <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.aircraftGroup || 'motor'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aircraftGroup: e.target.value as Aircraft['aircraftGroup'],
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                        formErrors.aircraftGroup ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      {Object.entries(aircraftGroupLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    {formErrors.aircraftGroup && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.aircraftGroup}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      value={formData.active ? 'active' : 'inactive'}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.value === 'active' })
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="active">Aktiv</option>
                      <option value="inactive">Inaktiv</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hersteller
                    </label>
                    <input
                      type="text"
                      value={formData.manufacturer || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, manufacturer: e.target.value })
                      }
                      placeholder="z.B. Cessna, Piper"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Modell</label>
                    <input
                      type="text"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="z.B. C172, PA-28"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Hinweis:</strong> Weitere Details wie Fixkosten, Betriebsdaten und
                  Kaufinformationen können Sie später in der Detailansicht oder im Admin-Bereich
                  bearbeiten.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({
                    registration: '',
                    name: '',
                    aircraftGroup: 'motor',
                    manufacturer: '',
                    model: '',
                    active: true,
                  })
                  setFormErrors({})
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateAircraft}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Wird gespeichert...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Flugzeug anlegen
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
