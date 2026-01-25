'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Save, X, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface AircraftGroup {
  id: string
  name: string
  code?: string
  description?: string
  color?: string
  active: boolean
}

export default function GruppenPage() {
  const [groups, setGroups] = useState<AircraftGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<AircraftGroup>>({
    name: '',
    code: '',
    description: '',
    color: '',
    active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/aircraft-groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      setError('Fehler beim Laden der Gruppen')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      color: '',
      active: true,
    })
    setError(null)
    setSuccess(null)
    setShowModal(true)
  }

  const handleEdit = (item: AircraftGroup) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      code: item.code || '',
      description: item.description || '',
      color: item.color || '',
      active: item.active,
    })
    setError(null)
    setSuccess(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setError('Bitte geben Sie einen Namen ein')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (editingId) {
        // Update
        const response = await fetch(`/api/aircraft-groups/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setSuccess('Gruppe erfolgreich aktualisiert')
          await fetchData()
          setEditingId(null)
          setShowModal(false)
          handleCreate()
        } else {
          const data = await response.json()
          setError(data.error || 'Fehler beim Aktualisieren')
        }
      } else {
        // Create
        const response = await fetch('/api/aircraft-groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setSuccess('Gruppe erfolgreich erstellt')
          await fetchData()
          setShowModal(false)
          handleCreate()
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
    setShowModal(false)
    handleCreate()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Lade Gruppen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Flugzeuggruppen
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Stammdaten für Flugzeuggruppen (z.B. UL, Segelflugzeug, Motorflugzeug)
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Neue Gruppe
            </button>
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

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70" onClick={handleCancel}>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {editingId ? 'Gruppe bearbeiten' : 'Neue Gruppe'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages im Modal */}
                {error && (
                  <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="z.B. UL (Ultraleicht), Segelflugzeug, Motorflugzeug"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Code
                    </label>
                    <input
                      type="text"
                      value={formData.code || ''}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="z.B. UL, GL, MOT"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Zusätzliche Informationen..."
                      rows={3}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Farbe (Hex-Code)
                    </label>
                    <input
                      type="text"
                      value={formData.color || ''}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3B82F6"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active || false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 text-violet-600 dark:text-violet-400 border-slate-300 dark:border-slate-600 rounded focus:ring-violet-500 dark:focus:ring-violet-400"
                    />
                    <label
                      htmlFor="active"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Aktiv
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
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
            </div>
          )}

          {/* List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Code</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Beschreibung</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Farbe</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {groups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        Noch keine Gruppen vorhanden. Erstellen Sie die erste!
                      </td>
                    </tr>
                  ) : (
                    groups.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {item.code || '–'}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {item.description || '–'}
                        </td>
                        <td className="py-4 px-6">
                          {item.color ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded border border-slate-300 dark:border-slate-600"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm text-slate-600 dark:text-slate-400">{item.color}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">–</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {item.active ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              Aktiv
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                              Inaktiv
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/admin/collections/aircraft-groups/${item.id}`}
                              target="_blank"
                              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="Im Admin bearbeiten"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                          </div>
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
    </div>
  )
}
