'use client'

import React, { useState, useEffect } from 'react'
import { Plane, Calendar, Clock, ArrowUp, Edit2, Plus } from 'lucide-react'
import Link from 'next/link'

interface Aircraft {
  id: string
  registration: string
  name?: string
  aircraftGroup: string
  manufacturer?: string
  model?: string
  purchaseDate?: string
  purchasePrice?: number
  insurance?: number
  hangar?: number
  annualInspection?: number
  fixedCosts?: number
  engineHours?: number
  totalFlightHours?: number
  fuelConsumption?: number
  fuelPrice?: number
  maintenanceCostPerHour?: number
  active: boolean
  notes?: string
}

interface FlightLog {
  id: string
  year: number
  starts: number
  flightHours: number
}

export default function AircraftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [aircraft, setAircraft] = useState<Aircraft | null>(null)
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then((p) => {
      fetchAircraftData(p.id)
    })
  }, [params])

  const fetchAircraftData = async (id: string) => {
    try {
      setLoading(true)
      const [aircraftRes, flightLogsRes] = await Promise.all([
        fetch(`/api/aircraft/${id}`),
        fetch('/api/flight-logs'),
      ])

      if (aircraftRes.ok) {
        const data = await aircraftRes.json()
        setAircraft(data)
      }

      if (flightLogsRes.ok) {
        const data = await flightLogsRes.json()
        // Filter flight logs for this aircraft
        const logs = data.docs.filter(
          (log: any) =>
            (typeof log.aircraft === 'object' ? log.aircraft.id : log.aircraft) === id
        )
        setFlightLogs(logs.sort((a: FlightLog, b: FlightLog) => b.year - a.year))
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalStarts = flightLogs.reduce((sum, log) => sum + log.starts, 0)
  const totalFlightHours = flightLogs.reduce((sum, log) => sum + log.flightHours, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Flugzeugdaten...</p>
        </div>
      </div>
    )
  }

  if (!aircraft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Flugzeug nicht gefunden</h2>
          <Link
            href="/flugzeuge"
            className="text-violet-600 hover:text-violet-700"
          >
            Zurück zur Übersicht
          </Link>
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
              <div className="flex items-center gap-3 mb-4">
                <Plane className="w-8 h-8 text-violet-600" />
                <h1 className="text-4xl font-bold text-slate-900">
                  {aircraft.registration}
                </h1>
                {aircraft.name && (
                  <span className="text-2xl text-slate-500">({aircraft.name})</span>
                )}
                {!aircraft.active && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-sm font-medium">
                    Inaktiv
                  </span>
                )}
              </div>
              <p className="text-lg text-slate-600">
                {aircraft.manufacturer} {aircraft.model}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/admin/collections/aircraft/${aircraft.id}`}
                className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-5 h-5" />
                Bearbeiten
              </Link>
              <Link
                href="/flugzeuge"
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                Zurück
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Gesamt Flugstunden</span>
                <Clock className="w-5 h-5 text-violet-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {totalFlightHours.toFixed(1)} h
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Gesamt Starts</span>
                <ArrowUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalStarts}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Motorstunden</span>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {aircraft.engineHours?.toFixed(1) || '0.0'} h
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Jahre erfasst</span>
                <Calendar className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{flightLogs.length}</p>
            </div>
          </div>

          {/* Stammdaten */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Stammdaten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aircraft.purchaseDate && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Kaufdatum</span>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(aircraft.purchaseDate).toLocaleDateString('de-DE')}
                  </p>
                </div>
              )}
              {aircraft.purchasePrice && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Kaufpreis</span>
                  <p className="text-lg font-semibold text-slate-900">
                    {aircraft.purchasePrice.toFixed(2)} €
                  </p>
                </div>
              )}
              {aircraft.insurance && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Versicherung p.a.</span>
                  <p className="text-lg font-semibold text-slate-900">
                    {aircraft.insurance.toFixed(2)} €
                  </p>
                </div>
              )}
              {aircraft.hangar && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Hangar/Standplatz p.a.</span>
                  <p className="text-lg font-semibold text-slate-900">
                    {aircraft.hangar.toFixed(2)} €
                  </p>
                </div>
              )}
              {aircraft.annualInspection && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Jährliche Inspektion</span>
                  <p className="text-lg font-semibold text-slate-900">
                    {aircraft.annualInspection.toFixed(2)} €
                  </p>
                </div>
              )}
              {aircraft.fixedCosts && (
                <div>
                  <span className="text-sm font-medium text-slate-600">Weitere Fixkosten p.a.</span>
                  <p className="text-lg font-semibold text-slate-900">
                    {aircraft.fixedCosts.toFixed(2)} €
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Flight Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Flugbuch</h2>
              <Link
                href={`/admin/collections/flight-logs/create?aircraft=${aircraft.id}`}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Neuer Eintrag
              </Link>
            </div>
            {flightLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Noch keine Flugbucheinträge vorhanden.</p>
                <Link
                  href={`/admin/collections/flight-logs/create?aircraft=${aircraft.id}`}
                  className="mt-4 inline-block text-violet-600 hover:text-violet-700"
                >
                  Ersten Eintrag erstellen
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Jahr</th>
                      <th className="text-right py-4 px-6 font-semibold text-slate-700">
                        Flugstunden
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-slate-700">Starts</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {flightLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-slate-900">{log.year}</td>
                        <td className="py-4 px-6 text-right text-slate-600">
                          {log.flightHours.toFixed(1)} h
                        </td>
                        <td className="py-4 px-6 text-right text-slate-600">{log.starts}</td>
                        <td className="py-4 px-6 text-center">
                          <Link
                            href={`/admin/collections/flight-logs/${log.id}`}
                            className="text-violet-600 hover:text-violet-700 text-sm"
                          >
                            Bearbeiten
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
