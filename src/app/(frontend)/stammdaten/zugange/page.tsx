'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Save, X, AlertCircle, CheckCircle, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface AccessToken {
  id: string
  name: string
  token: string
  permissions: string[]
  expiresAt?: string
  active: boolean
  lastUsedAt?: string
  usageCount: number
}

const PERMISSION_LABELS: Record<string, string> = {
  fuelTracking: 'Kraftstofferfassung',
  // Weitere können hier hinzugefügt werden
}

export default function ZugangePage() {
  const [tokens, setTokens] = useState<AccessToken[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<AccessToken>>({
    name: '',
    permissions: [],
    expiresAt: '',
    active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/access-tokens')
      if (response.ok) {
        const data = await response.json()
        setTokens(data.docs || [])
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      setError('Fehler beim Laden der Zugänge')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({
      name: '',
      permissions: [],
      expiresAt: '',
      active: true,
    })
    setError(null)
    setSuccess(null)
    setShowModal(true)
  }

  const handleEdit = (item: AccessToken) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      permissions: item.permissions || [],
      expiresAt: item.expiresAt ? item.expiresAt.split('T')[0] : '',
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

    if (!formData.permissions || formData.permissions.length === 0) {
      setError('Bitte wählen Sie mindestens eine Berechtigung aus')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const submitData = {
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      }

      if (editingId) {
        // Update
        const response = await fetch(`/api/access-tokens/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        })

        if (response.ok) {
          setSuccess('Zugang erfolgreich aktualisiert')
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
        const response = await fetch('/api/access-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submitData),
        })

        if (response.ok) {
          setSuccess('Zugang erfolgreich erstellt')
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
    if (!confirm('Möchten Sie diesen Zugang wirklich löschen?')) {
      return
    }

    try {
      const response = await fetch(`/api/access-tokens/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Zugang erfolgreich gelöscht')
        await fetchData()
      } else {
        setError('Fehler beim Löschen')
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error)
      setError('Fehler beim Löschen')
    }
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setSuccess('Token in Zwischenablage kopiert')
    setTimeout(() => setSuccess(null), 2000)
  }

  const toggleTokenVisibility = (id: string) => {
    setShowTokens((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getTokenDisplay = (token: string, id: string) => {
    if (showTokens[id]) {
      return token
    }
    return `${token.substring(0, 8)}...${token.substring(token.length - 8)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Lade Zugänge...</p>
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
                Zugänge
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Token-basierte Zugänge für einzelne Bereiche
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Neuer Zugang
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
                    {editingId ? 'Zugang bearbeiten' : 'Neuer Zugang'}
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
                      placeholder="z.B. Kraftstofferfassung - Hangar 1"
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Berechtigungen <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {Object.entries(PERMISSION_LABELS).map(([value, label]) => (
                        <label key={value} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                          <input
                            type="checkbox"
                            checked={(formData.permissions || []).includes(value)}
                            onChange={(e) => {
                              const current = formData.permissions || []
                              if (e.target.checked) {
                                setFormData({ ...formData, permissions: [...current, value] })
                              } else {
                                setFormData({ ...formData, permissions: current.filter((p) => p !== value) })
                              }
                            }}
                            className="w-5 h-5 text-violet-600 dark:text-violet-400 border-slate-300 dark:border-slate-600 rounded focus:ring-violet-500 dark:focus:ring-violet-400"
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Ablaufdatum
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt || ''}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
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
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Token</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Berechtigungen</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Ablaufdatum</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Verwendungen</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {tokens.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                        Noch keine Zugänge vorhanden. Erstellen Sie den ersten!
                      </td>
                    </tr>
                  ) : (
                    tokens.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <td className="py-4 px-6 font-medium text-slate-900 dark:text-slate-100">
                          {item.name}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <code className="text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-mono">
                              {getTokenDisplay(item.token, item.id)}
                            </code>
                            <button
                              onClick={() => toggleTokenVisibility(item.id)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                              title={showTokens[item.id] ? 'Token verbergen' : 'Token anzeigen'}
                            >
                              {showTokens[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => copyToken(item.token)}
                              className="p-1 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded"
                              title="Token kopieren"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-2">
                            {(item.permissions || []).map((perm) => (
                              <span
                                key={perm}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                              >
                                {PERMISSION_LABELS[perm] || perm}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('de-DE') : '–'}
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
                        <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-400">
                          {item.usageCount || 0}
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
