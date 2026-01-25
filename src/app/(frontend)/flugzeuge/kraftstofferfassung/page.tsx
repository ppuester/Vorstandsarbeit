'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Plane, Fuel, Save, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useOrganization } from '@/providers/Organization'

interface Aircraft {
  id: string
  registration: string
  name?: string
}

interface FuelEntry {
  id?: string
  date: string
  name: string
  aircraft: string
  fuelType: 'avgas' | 'mogas'
  meterReadingOld: number
  meterReadingNew: number
  liters: number
  pricePerLiter: number
  totalPrice: number
  gasStation: string
  invoiceNumber: string
  invoice?: File | string
  notes?: string
}

export default function KraftstofferfassungPage() {
  const { isFeatureEnabled } = useOrganization()
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  const [formData, setFormData] = useState<FuelEntry>({
    date: new Date().toISOString().split('T')[0],
    name: '',
    aircraft: '',
    fuelType: 'avgas',
    meterReadingOld: 0,
    meterReadingNew: 0,
    liters: 0,
    pricePerLiter: 0,
    totalPrice: 0,
    gasStation: '',
    invoiceNumber: '',
    notes: '',
  })

  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)

  useEffect(() => {
    if (!isFeatureEnabled('fuelTracking')) {
      return
    }

    fetchAircraft()
  }, [isFeatureEnabled])

  useEffect(() => {
    // Berechne Liter automatisch aus Zählerständen
    const liters = Math.max(0, formData.meterReadingNew - formData.meterReadingOld)
    setFormData((prev) => ({ ...prev, liters: Number(liters.toFixed(2)) }))
  }, [formData.meterReadingOld, formData.meterReadingNew])

  useEffect(() => {
    // Berechne Gesamtpreis automatisch
    const total = formData.liters * formData.pricePerLiter
    setFormData((prev) => ({ ...prev, totalPrice: Number(total.toFixed(2)) }))
  }, [formData.liters, formData.pricePerLiter])

  const fetchAircraft = async () => {
    try {
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

  const handleInputChange = (field: keyof FuelEntry, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
    setDuplicateWarning(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setInvoiceFile(file)
    }
  }

  const checkDuplicate = async (entry: FuelEntry): Promise<boolean> => {
    try {
      const response = await fetch('/api/fuel-entries/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: entry.date,
          aircraft: entry.aircraft,
          fuelType: entry.fuelType,
          liters: entry.liters,
          pricePerLiter: entry.pricePerLiter,
          gasStation: entry.gasStation,
          invoiceNumber: entry.invoiceNumber,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setDuplicateWarning(null)
    setSaving(true)

    try {
      // Validierung
      if (!formData.name || formData.name.trim() === '') {
        setError('Bitte geben Sie einen Namen ein.')
        setSaving(false)
        return
      }

      if (!formData.aircraft) {
        setError('Bitte wählen Sie ein Flugzeug aus.')
        setSaving(false)
        return
      }

      if (formData.meterReadingNew <= formData.meterReadingOld) {
        setError('Der neue Zählerstand muss größer als der alte Zählerstand sein.')
        setSaving(false)
        return
      }

      if (formData.liters <= 0) {
        setError('Die berechnete Menge muss größer als 0 sein.')
        setSaving(false)
        return
      }

      if (formData.pricePerLiter <= 0) {
        setError('Bitte geben Sie einen gültigen Preis pro Liter ein.')
        setSaving(false)
        return
      }

      // Prüfe auf Duplikate
      const isDuplicate = await checkDuplicate(formData)
      if (isDuplicate) {
        setDuplicateWarning(
          'Ein identischer Eintrag existiert bereits. Der Eintrag wurde nicht gespeichert.'
        )
        setSaving(false)
        return
      }

      // Erstelle FormData für Datei-Upload
      const submitData = new FormData()
      submitData.append('date', formData.date)
      submitData.append('name', formData.name)
      submitData.append('aircraft', formData.aircraft)
      submitData.append('fuelType', formData.fuelType)
      submitData.append('meterReadingOld', formData.meterReadingOld.toString())
      submitData.append('meterReadingNew', formData.meterReadingNew.toString())
      submitData.append('liters', formData.liters.toString())
      submitData.append('pricePerLiter', formData.pricePerLiter.toString())
      submitData.append('totalPrice', formData.totalPrice.toString())
      submitData.append('gasStation', formData.gasStation || '')
      submitData.append('invoiceNumber', formData.invoiceNumber || '')
      submitData.append('notes', formData.notes || '')

      if (invoiceFile) {
        submitData.append('invoice', invoiceFile)
      }

      const response = await fetch('/api/fuel-entries', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Speichern')
      }

      setSuccess(true)
      // Formular zurücksetzen
      setFormData({
        date: new Date().toISOString().split('T')[0],
        name: '',
        aircraft: '',
        fuelType: 'avgas',
        meterReadingOld: 0,
        meterReadingNew: 0,
        liters: 0,
        pricePerLiter: 0,
        totalPrice: 0,
        gasStation: '',
        invoiceNumber: '',
        notes: '',
      })
      setInvoiceFile(null)
      // Reset file input
      const fileInput = document.getElementById('invoice-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      // Nach 3 Sekunden Erfolgsmeldung ausblenden
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Fehler beim Speichern: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
    } finally {
      setSaving(false)
    }
  }

  if (!isFeatureEnabled('fuelTracking')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Nicht verfügbar</h2>
          <p className="text-slate-600">
            Die Kraftstofferfassung ist für diese Organisation nicht aktiviert.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Lade...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Kraftstofferfassung</h1>
            <p className="text-lg text-slate-600">Erfassen Sie getankten Kraftstoff für Flugzeuge</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="space-y-6">
              {/* Datum */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Datum
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Flugzeug */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Plane className="w-4 h-4 inline mr-2" />
                  Flugzeug
                </label>
                <select
                  value={formData.aircraft}
                  onChange={(e) => handleInputChange('aircraft', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Flugzeug auswählen...</option>
                  {aircraft
                    .filter((ac) => ac.active !== false)
                    .map((ac) => (
                      <option key={ac.id} value={ac.id}>
                        {ac.registration} {ac.name ? `(${ac.name})` : ''}
                      </option>
                    ))}
                </select>
              </div>

              {/* Kraftstoff */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Fuel className="w-4 h-4 inline mr-2" />
                  Kraftstoff
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value as 'avgas' | 'mogas')}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="avgas">Avgas</option>
                  <option value="mogas">Mogas</option>
                </select>
              </div>

              {/* Zählerstände */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zählerstand alt
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.meterReadingOld || ''}
                    onChange={(e) =>
                      handleInputChange('meterReadingOld', parseFloat(e.target.value) || 0)
                    }
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zählerstand neu
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.meterReadingNew || ''}
                    onChange={(e) =>
                      handleInputChange('meterReadingNew', parseFloat(e.target.value) || 0)
                    }
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              {/* Menge (automatisch berechnet) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Menge (Liter)</label>
                <input
                  type="number"
                  value={formData.liters.toFixed(2)}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Berechnet: Zählerstand neu - Zählerstand alt
                </p>
              </div>

              {/* Preis pro Liter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preis pro Liter</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.pricePerLiter || ''}
                  onChange={(e) =>
                    handleInputChange('pricePerLiter', parseFloat(e.target.value) || 0)
                  }
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Gesamtpreis (readonly) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gesamtpreis</label>
                <input
                  type="number"
                  value={formData.totalPrice.toFixed(2)}
                  readOnly
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                />
              </div>

              {/* Tankstelle */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tankstelle</label>
                <input
                  type="text"
                  value={formData.gasStation}
                  onChange={(e) => handleInputChange('gasStation', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Rechnungsnummer */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rechnungsnummer</label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Rechnung (Datei-Upload) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Rechnung
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="invoice-file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  {invoiceFile && (
                    <span className="text-sm text-slate-600 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {invoiceFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Notizen */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notizen</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {duplicateWarning && (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">{duplicateWarning}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">Kraftstoffeintrag erfolgreich gespeichert!</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Speichern
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
