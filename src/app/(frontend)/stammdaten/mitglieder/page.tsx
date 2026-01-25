'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Save, X, AlertCircle, CheckCircle, Upload, Trash2, Download } from 'lucide-react'
import Link from 'next/link'

interface Member {
  id: string
  name: string
  memberNumber?: string
  email?: string
  phone?: string
  address?: string
  active: boolean
  notes?: string
}

export default function MitgliederPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Member>>({
    name: '',
    memberNumber: '',
    email: '',
    phone: '',
    address: '',
    active: true,
    notes: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      setError('Fehler beim Laden der Mitglieder')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({
      name: '',
      memberNumber: '',
      email: '',
      phone: '',
      address: '',
      active: true,
      notes: '',
    })
    setError(null)
    setSuccess(null)
    setShowModal(true)
  }

  const handleEdit = (item: Member) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      memberNumber: item.memberNumber || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      active: item.active,
      notes: item.notes || '',
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
        const response = await fetch(`/api/members/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setSuccess('Mitglied erfolgreich aktualisiert')
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
        const response = await fetch('/api/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          setSuccess('Mitglied erfolgreich erstellt')
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

  const handleDelete = async (id: string) => {
    if (!confirm('Möchten Sie dieses Mitglied wirklich löschen?')) {
      return
    }

    try {
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Mitglied erfolgreich gelöscht')
        await fetchData()
      } else {
        setError('Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      setError('Fehler beim Löschen')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setImporting(true)
      setError(null)
      setSuccess(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/members/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(
          `${result.imported} Mitglied${result.imported !== 1 ? 'er' : ''} erfolgreich importiert. ${result.skipped > 0 ? `${result.skipped} übersprungen.` : ''}`
        )
        if (result.errors && result.errors.length > 0) {
          console.warn('Import-Fehler:', result.errors)
        }
        await fetchData()
      } else {
        setError(result.error || 'Fehler beim Importieren')
      }
    } catch (error) {
      console.error('Fehler beim Importieren:', error)
      setError('Fehler beim Importieren')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const exportCSV = () => {
    const headers = ['Name', 'Mitgliedsnummer', 'E-Mail', 'Telefon', 'Adresse', 'Aktiv', 'Notizen']
    const rows = members.map((m) => [
      m.name,
      m.memberNumber || '',
      m.email || '',
      m.phone || '',
      m.address || '',
      m.active ? 'Ja' : 'Nein',
      m.notes || '',
    ])

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `mitglieder_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Lade Mitglieder...</p>
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
                Mitglieder
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Stammdaten für Mitglieder
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                CSV Import
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Neues Mitglied
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

          {importing && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-blue-700 dark:text-blue-300">Importiere Mitglieder...</p>
            </div>
          )}

          {/* Info Box für CSV Format */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>CSV-Format:</strong> Name, Mitgliedsnummer, E-Mail, Telefon, Adresse, Aktiv (Ja/Nein), Notizen
            </p>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70" onClick={handleCancel}>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {editingId ? 'Mitglied bearbeiten' : 'Neues Mitglied'}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

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
                      placeholder="Max Mustermann"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Mitgliedsnummer
                      </label>
                      <input
                        type="text"
                        value={formData.memberNumber || ''}
                        onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        E-Mail
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Telefon
                    </label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Adresse
                    </label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
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
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Mitgliedsnummer</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">E-Mail</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Telefon</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        Noch keine Mitglieder vorhanden. Erstellen Sie das erste!
                      </td>
                    </tr>
                  ) : (
                    members.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {item.memberNumber || '–'}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {item.email || '–'}
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {item.phone || '–'}
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
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
        </div>
      </div>
    </div>
  )
}
