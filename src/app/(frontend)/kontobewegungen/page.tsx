'use client'

import React, { useState } from 'react'
import { Upload, FileText, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  date: string
  description: string
  amount: number
  reference?: string
}

export default function KontobewegungenPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [importedCount, setImportedCount] = useState(0)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setSuccess(false)
      parseCSV(selectedFile)
    }
  }

  const parseCSV = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())
      
      if (lines.length < 2) {
        setError('Die CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten.')
        return
      }

      // Erste Zeile als Header
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
      
      // Finde Spaltenindizes
      const dateIndex = headers.findIndex((h) => 
        h.includes('datum') || h.includes('date') || h.includes('buchung')
      )
      const descriptionIndex = headers.findIndex((h) => 
        h.includes('beschreibung') || h.includes('text') || h.includes('verwendungszweck') || h.includes('zweck')
      )
      const amountIndex = headers.findIndex((h) => 
        h.includes('betrag') || h.includes('amount') || h.includes('saldo') || h.includes('umsatz')
      )
      const referenceIndex = headers.findIndex((h) => 
        h.includes('referenz') || h.includes('reference') || h.includes('buchungstext')
      )

      if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
        setError(
          'Die CSV-Datei muss Spalten für Datum, Beschreibung und Betrag enthalten. ' +
          'Erwartete Spaltennamen: "Datum", "Beschreibung", "Betrag" (oder ähnlich)'
        )
        return
      }

      // Parse Datenzeilen
      const transactions: Transaction[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim())
        
        const dateStr = values[dateIndex]
        const description = values[descriptionIndex] || ''
        const amountStr = values[amountIndex] || '0'
        const reference = referenceIndex !== -1 ? values[referenceIndex] : undefined

        // Parse Datum (verschiedene Formate)
        let date: string
        try {
          const dateObj = new Date(dateStr)
          if (isNaN(dateObj.getTime())) {
            // Versuche deutsches Format DD.MM.YYYY
            const parts = dateStr.split('.')
            if (parts.length === 3) {
              date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
            } else {
              continue // Überspringe ungültige Zeilen
            }
          } else {
            date = dateObj.toISOString().split('T')[0]
          }
        } catch {
          continue // Überspringe ungültige Zeilen
        }

        // Parse Betrag (entferne Tausender-Trennzeichen, ersetze Komma durch Punkt)
        const amount = parseFloat(
          amountStr.replace(/\./g, '').replace(',', '.')
        )

        if (!isNaN(amount) && description) {
          transactions.push({
            date,
            description,
            amount,
            reference,
          })
        }
      }

      if (transactions.length === 0) {
        setError('Keine gültigen Transaktionen in der CSV-Datei gefunden.')
        return
      }

      setPreview(transactions)
    } catch (err) {
      setError('Fehler beim Lesen der CSV-Datei: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
    }
  }

  const handleImport = async () => {
    if (preview.length === 0) {
      setError('Keine Daten zum Importieren vorhanden.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: preview }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Importieren')
      }

      const result = await response.json()
      setSuccess(true)
      setImportedCount(result.count || preview.length)
      setPreview([])
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err) {
      setError('Fehler beim Importieren: ' + (err instanceof Error ? err.message : 'Unbekannter Fehler'))
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csv = 'Datum,Beschreibung,Betrag,Referenz\n2024-01-15,Beispiel Einnahme,100.00,REF001\n2024-01-16,Beispiel Ausgabe,-50.00,REF002'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'kontobewegungen-vorlage.csv'
    link.click()
  }

  const totalIncome = preview
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = preview
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Kontobewegungen einlesen
            </h1>
            <p className="text-lg text-slate-600">
              Laden Sie eine CSV-Datei mit Ihren Kontobewegungen hoch
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <label
                  htmlFor="csv-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-12 h-12 mb-4 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500">
                      <span className="font-semibold">Klicken Sie zum Hochladen</span> oder ziehen Sie die Datei hierher
                    </p>
                    <p className="text-xs text-slate-500">CSV-Datei (max. 10MB)</p>
                  </div>
                  <input
                    id="csv-file"
                    type="file"
                    className="hidden"
                    accept=".csv"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              <div className="md:w-80 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    CSV-Format
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Ihre CSV-Datei sollte folgende Spalten enthalten:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                    <li>Datum (DD.MM.YYYY oder YYYY-MM-DD)</li>
                    <li>Beschreibung</li>
                    <li>Betrag (negativ für Ausgaben)</li>
                    <li>Referenz (optional)</li>
                  </ul>
                </div>

                <button
                  onClick={downloadTemplate}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  Vorlage herunterladen
                </button>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">
                  Erfolgreich {importedCount} Kontobewegung(en) importiert!
                </p>
              </div>
            )}
          </div>

          {/* Preview Section */}
          {preview.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Vorschau ({preview.length} Bewegungen)
                </h2>
                <div className="flex gap-4 text-sm">
                  <div className="text-green-600 font-semibold">
                    Einnahmen: {totalIncome.toFixed(2)} €
                  </div>
                  <div className="text-red-600 font-semibold">
                    Ausgaben: {totalExpenses.toFixed(2)} €
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Datum</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Beschreibung</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700">Betrag</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Referenz</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((transaction, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="py-3 px-4">
                          {new Date(transaction.date).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-3 px-4">{transaction.description}</td>
                        <td
                          className={`py-3 px-4 text-right font-medium ${
                            transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.amount >= 0 ? '+' : ''}
                          {transaction.amount.toFixed(2)} €
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {transaction.reference || '–'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 20 && (
                  <p className="mt-4 text-sm text-slate-500 text-center">
                    ... und {preview.length - 20} weitere Bewegungen
                  </p>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Importiere...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Importieren
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setPreview([])
                    setFile(null)
                    setError(null)
                    setSuccess(false)
                    const fileInput = document.getElementById('csv-file') as HTMLInputElement
                    if (fileInput) fileInput.value = ''
                  }}
                  className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          )}

          {/* Link to View Transactions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <Link
              href="/kontobewegungen/uebersicht"
              className="flex items-center justify-between group"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Alle Kontobewegungen anzeigen
                </h3>
                <p className="text-sm text-slate-600">
                  Einnahmen und Ausgaben in übersichtlichen Reitern anzeigen
                </p>
              </div>
              <FileText className="w-6 h-6 text-slate-400 group-hover:text-violet-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
