'use client'

import React, { useState, useEffect } from 'react'
import { Plane, Plus, Edit2, Filter, Search } from 'lucide-react'
import Link from 'next/link'

interface Aircraft {
  id: string
  registration: string
  name?: string
  aircraftGroup: 'ul' | 'glider' | 'motor' | 'motor-glider' | 'helicopter' | 'other'
  manufacturer?: string
  model?: string
  active: boolean
}

const aircraftGroupLabels: Record<string, string> = {
  ul: 'UL (Ultraleicht)',
  glider: 'Segelflugzeug',
  motor: 'Motorflugzeug',
  'motor-glider': 'Motorsegler',
  helicopter: 'Hubschrauber',
  other: 'Sonstiges',
}

export default function FlugzeugePage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGroup, setFilterGroup] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Flugzeuge...</p>
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
              <h1 className="text-4xl font-bold text-slate-900 mb-4">Flugzeuge</h1>
              <p className="text-lg text-slate-600">
                Verwalten Sie Ihre Flugzeugstammdaten
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/flugzeuge/kostenermittlung"
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Kostenermittlung
              </Link>
              <Link
                href="/admin/collections/aircraft/create"
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Neues Flugzeug
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Suchen nach Kennzeichen, Name, Hersteller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="all">Alle</option>
                  <option value="active">Nur aktive</option>
                  <option value="inactive">Nur inaktive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Aircraft List - Grouped */}
          {Object.keys(groupedAircraft).length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
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
                <Link
                  href="/admin/collections/aircraft/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Erstes Flugzeug erstellen
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedAircraft)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([group, aircraftList]) => (
                  <div key={group} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                      <h2 className="text-xl font-bold text-slate-900">
                        {aircraftGroupLabels[group]} ({aircraftList.length})
                      </h2>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {aircraftList.map((ac) => (
                        <div
                          key={ac.id}
                          className="p-6 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Plane className="w-5 h-5 text-violet-600" />
                                <h3 className="text-xl font-bold text-slate-900">
                                  {ac.registration}
                                </h3>
                                {ac.name && (
                                  <span className="text-slate-500">({ac.name})</span>
                                )}
                                {!ac.active && (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                                    Inaktiv
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                {ac.manufacturer && (
                                  <span>
                                    <strong>Hersteller:</strong> {ac.manufacturer}
                                  </span>
                                )}
                                {ac.model && (
                                  <span>
                                    <strong>Modell:</strong> {ac.model}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Link
                                href={`/flugzeuge/${ac.id}`}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm"
                              >
                                Details
                              </Link>
                              <Link
                                href={`/admin/collections/aircraft/${ac.id}`}
                                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" />
                                Bearbeiten
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
