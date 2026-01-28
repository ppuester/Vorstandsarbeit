'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Save, X, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'

interface MembershipFeeType {
  id: string
  name: string
  defaultAmount?: number
  generalCost?: { id: string; name: string }
}

interface GeneralCost {
  id: string
  name: string
}

interface MembershipFeeStat {
  id: string
  year: number
  snapshotDate: string
  feeType: MembershipFeeType | string
  memberCount: number
  amountPerMember: number
  totalIncome?: number
  generalCost?: GeneralCost | string | null
  notes?: string
}

export default function MitgliederEinnahmenPage() {
  const [feeTypes, setFeeTypes] = useState<MembershipFeeType[]>([])
  const [generalCosts, setGeneralCosts] = useState<GeneralCost[]>([])
  const [stats, setStats] = useState<MembershipFeeStat[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterYear, setFilterYear] = useState<string>('')
  const [formData, setFormData] = useState<Partial<MembershipFeeStat>>({
    year: new Date().getFullYear(),
    snapshotDate: `${new Date().getFullYear()}-12-31`,
    feeType: '',
    memberCount: 0,
    amountPerMember: 0,
    totalIncome: 0,
    generalCost: undefined,
    notes: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear])

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [typesRes, costsRes] = await Promise.all([
        fetch('/api/membership-fee-types'),
        fetch('/api/general-costs?activeOnly=true&type=income'),
      ])

      if (typesRes.ok) {
        const data = await typesRes.json()
        setFeeTypes(data.docs || [])
      }

      if (costsRes.ok) {
        const data = await costsRes.json()
        setGeneralCosts((data.docs || []).map((gc: any) => ({ id: gc.id, name: gc.name })))
      }

      await fetchStats()
    } catch (err) {
      console.error('Fehler beim Laden der Stammdaten:', err)
      setError('Fehler beim Laden der Stammdaten')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams()
      if (filterYear) params.append('year', filterYear)

      const res = await fetch(`/api/membership-fee-stats?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.docs || [])
      }
    } catch (err) {
      console.error('Fehler beim Laden der Mitgliederbestände:', err)
      setError('Fehler beim Laden der Mitgliederbestände')
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({
      year: new Date().getFullYear(),
      snapshotDate: `${new Date().getFullYear()}-12-31`,
      feeType: '',
      memberCount: 0,
      amountPerMember: 0,
      totalIncome: 0,
      generalCost: undefined,
      notes: '',
    })
    setError(null)
    setSuccess(null)
    setShowModal(true)
  }

  const handleEdit = (item: MembershipFeeStat) => {
    setEditingId(item.id)
    setFormData({
      year: item.year,
      snapshotDate: item.snapshotDate?.split('T')[0] || item.snapshotDate,
      feeType: typeof item.feeType === 'object' && item.feeType !== null ? item.feeType.id : item.feeType,
      memberCount: item.memberCount,
      amountPerMember: item.amountPerMember,
      totalIncome: item.totalIncome,
      generalCost:
        item.generalCost && typeof item.generalCost === 'object'
          ? item.generalCost.id
          : (item.generalCost as string | undefined),
      notes: item.notes || '',
    })
    setError(null)
    setSuccess(null)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.year || !formData.feeType) {
      setError('Bitte Jahr und Beitragsart ausfüllen.')
      return
    }

    if (formData.memberCount == null || formData.amountPerMember == null) {
      setError('Bitte Mitgliederanzahl und Beitrag je Mitglied eintragen.')
      return
    }

    const totalIncome =
      formData.totalIncome != null
        ? formData.totalIncome
        : (formData.memberCount || 0) * (formData.amountPerMember || 0)

    const yearNumber = Number(formData.year)
    const snapshotDate =
      formData.snapshotDate && String(formData.snapshotDate).trim().length > 0
        ? formData.snapshotDate
        : `${yearNumber}-12-31`

    const payloadData = {
      ...formData,
      year: yearNumber,
      snapshotDate,
      memberCount: Number(formData.memberCount),
      amountPerMember: Number(formData.amountPerMember),
      totalIncome: Number(totalIncome),
    }

    try {
      setSaving(true)
      setError(null)

      if (editingId) {
        const res = await fetch(`/api/membership-fee-stats/${editingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadData),
        })

        if (res.ok) {
          setSuccess('Eintrag erfolgreich aktualisiert.')
          setShowModal(false)
          setEditingId(null)
          await fetchStats()
        } else {
          const data = await res.json()
          setError(data.error || 'Fehler beim Aktualisieren.')
        }
      } else {
        const res = await fetch('/api/membership-fee-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadData),
        })

        if (res.ok) {
          setSuccess('Eintrag erfolgreich erstellt.')
          setShowModal(false)
          await fetchStats()
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
      const res = await fetch(`/api/membership-fee-stats/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Eintrag erfolgreich gelöscht.')
        await fetchStats()
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

  const getFeeTypeName = (stat: MembershipFeeStat) => {
    if (typeof stat.feeType === 'object' && stat.feeType !== null) return stat.feeType.name
    const type = feeTypes.find((t) => t.id === stat.feeType)
    return type?.name || '–'
  }

  const getGeneralCostName = (stat: MembershipFeeStat) => {
    if (stat.generalCost && typeof stat.generalCost === 'object') return stat.generalCost.name

    const id = stat.generalCost as string | undefined
    if (!id) {
      if (typeof stat.feeType === 'object' && stat.feeType?.generalCost) {
        return stat.feeType.generalCost.name
      }
      const type = feeTypes.find((t) => t.id === (typeof stat.feeType === 'string' ? stat.feeType : stat.feeType.id))
      return type?.generalCost?.name || '–'
    }

    const gc = generalCosts.find((g) => g.id === id)
    return gc?.name || '–'
  }

  const yearsInData = Array.from(new Set(stats.map((s) => s.year))).sort((a, b) => b - a)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Lade Mitglieder-Einnahmen...</p>
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
                Fix-Einnahmen
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Erfassen Sie Mitgliederzahlen und feste Einnahmen je Sparte und Jahr.
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Neuer Eintrag
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

          {/* Filter */}
          <div className="mb-4 flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Jahr filtern
              </label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="">Alle Jahre</option>
                {yearsInData.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Jahr
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Sparte / Beitragsart
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Kostengruppe
                    </th>
                    <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Mitglieder
                    </th>
                    <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Beitrag / Mitglied
                    </th>
                    <th className="text-right py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Gesamt
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Stichtag
                    </th>
                    <th className="text-center py-3 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {stats.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-10 text-center text-slate-500 dark:text-slate-400"
                      >
                        Noch keine Einträge vorhanden. Legen Sie den ersten Mitgliederbestand
                        an.
                      </td>
                    </tr>
                  ) : (
                    yearsInData.map((year, yearIndex) => {
                      const yearStats = stats.filter((s) => s.year === year)
                      const totalMembers = yearStats.reduce(
                        (sum, s) => sum + (s.memberCount || 0),
                        0,
                      )
                      const totalIncome = yearStats.reduce((sum, s) => {
                        const income =
                          s.totalIncome != null
                            ? s.totalIncome
                            : s.memberCount * s.amountPerMember
                        return sum + income
                      }, 0)

                      return (
                        <React.Fragment key={year}>
                          {yearIndex > 0 && (
                            <tr>
                              <td colSpan={8} className="h-2" />
                            </tr>
                          )}
                          <tr className="bg-slate-50/80 dark:bg-slate-900/40">
                            <td className="py-3 px-6 text-slate-900 dark:text-slate-100 font-semibold">
                              {year}
                            </td>
                            <td className="py-3 px-6 text-slate-700 dark:text-slate-200 font-semibold">
                              Summe
                            </td>
                            <td className="py-3 px-6 text-slate-500 dark:text-slate-400 text-sm">
                              alle
                            </td>
                            <td className="py-3 px-6 text-right text-slate-900 dark:text-slate-100 font-semibold">
                              {totalMembers}
                            </td>
                            <td className="py-3 px-6 text-right text-slate-500 dark:text-slate-400 text-sm">
                              –
                            </td>
                            <td className="py-3 px-6 text-right text-emerald-700 dark:text-emerald-400 font-semibold">
                              {totalIncome.toFixed(2)} €
                            </td>
                            <td className="py-3 px-6 text-slate-500 dark:text-slate-400 text-sm">
                              –
                            </td>
                            <td className="py-3 px-6" />
                          </tr>
                          {yearStats.map((stat) => (
                            <tr
                              key={stat.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-700/70"
                            >
                              <td className="py-3 px-6 text-slate-900 dark:text-slate-100 font-medium">
                                {stat.year}
                              </td>
                              <td className="py-3 px-6 text-slate-900 dark:text-slate-100">
                                {getFeeTypeName(stat)}
                              </td>
                              <td className="py-3 px-6 text-slate-600 dark:text-slate-300">
                                {getGeneralCostName(stat)}
                              </td>
                              <td className="py-3 px-6 text-right text-slate-900 dark:text-slate-100">
                                {stat.memberCount}
                              </td>
                              <td className="py-3 px-6 text-right text-slate-900 dark:text-slate-100">
                                {stat.amountPerMember.toFixed(2)} €
                              </td>
                              <td className="py-3 px-6 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                                {(
                                  stat.totalIncome ??
                                  stat.memberCount * stat.amountPerMember
                                ).toFixed(2)}{' '}
                                €
                              </td>
                              <td className="py-3 px-6 text-slate-600 dark:text-slate-300">
                                {stat.snapshotDate
                                  ? new Date(stat.snapshotDate).toLocaleDateString('de-DE')
                                  : '–'}
                              </td>
                              <td className="py-3 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleEdit(stat)}
                                    className="p-2 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                                    title="Bearbeiten"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(stat.id)}
                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Löschen"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal */}
          {showModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70"
              onClick={handleCancel}
            >
              <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {editingId ? 'Eintrag bearbeiten' : 'Neuer Mitgliederbestand'}
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

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Jahr
                  </label>
                  <input
                    type="number"
                    value={formData.year ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, year: Number(e.target.value) || undefined })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sparte / Beitragsart
                  </label>
                  <select
                    value={(formData.feeType as string) || ''}
                    onChange={(e) => {
                      const feeTypeId = e.target.value
                      const selectedType = feeTypes.find((t) => t.id === feeTypeId)
                      const amountPerMember =
                        formData.amountPerMember && formData.amountPerMember > 0
                          ? formData.amountPerMember
                          : selectedType?.defaultAmount ?? 0
                      const memberCount = formData.memberCount ?? 0
                      const totalIncome = memberCount * amountPerMember

                      setFormData({
                        ...formData,
                        feeType: feeTypeId,
                        amountPerMember,
                        totalIncome,
                      })
                    }}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Bitte auswählen...</option>
                    {feeTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                        {type.defaultAmount ? ` (${type.defaultAmount.toFixed(2)} €)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Mitgliederanzahl
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.memberCount ?? 0}
                      onChange={(e) => {
                        const memberCount = Number(e.target.value) || 0
                        const amountPerMember = formData.amountPerMember ?? 0
                        const totalIncome = memberCount * amountPerMember
                        setFormData({
                          ...formData,
                          memberCount,
                          totalIncome,
                        })
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Beitrag je Mitglied (€ / Jahr)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.amountPerMember ?? 0}
                      onChange={(e) => {
                        const amountPerMember = Number(e.target.value) || 0
                        const memberCount = formData.memberCount ?? 0
                        const totalIncome = memberCount * amountPerMember
                        setFormData({
                          ...formData,
                          amountPerMember,
                          totalIncome,
                        })
                      }}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Gesamt (optional überschreiben)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={
                        formData.totalIncome ??
                        (formData.memberCount || 0) * (formData.amountPerMember || 0)
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalIncome: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Kostengruppe (optional, sonst Standard aus Beitragsart)
                  </label>
                  <select
                    value={(formData.generalCost as string) || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        generalCost: e.target.value || undefined,
                      })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Standard aus Beitragsart verwenden</option>
                    {generalCosts.map((gc) => (
                      <option key={gc.id} value={gc.id}>
                        {gc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notizen
                  </label>
                  <textarea
                    value={formData.notes ?? ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors font-medium"
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
          )}
        </div>
      </div>
    </div>
  )
}

