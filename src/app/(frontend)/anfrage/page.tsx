'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  Send,
  ChevronRight,
  CheckCircle,
  X,
  Plus,
  Car,
  Sparkles,
  Shield,
  Star,
  MapPin,
  Info,
  AlertCircle,
  Loader2,
  PartyPopper
} from 'lucide-react'

interface DrivingSchool {
  id: string
  name: string
  slug: string
  city: string
  postalCode: string
  rating?: number
  reviewCount?: number
  verified?: boolean
  logo?: {
    url: string
  }
}

function AnfragePageContent() {
  const searchParams = useSearchParams()
  
  // State für ausgewählte Fahrschulen
  const [selectedSchools, setSelectedSchools] = useState<DrivingSchool[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inquiryNumber, setInquiryNumber] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  
  // Formular State
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    studentAge: '',
    studentCity: '',
    licenseClass: 'B',
    preferredStart: 'asap',
    courseType: 'flexible',
    hasFirstAid: false,
    hasEyeTest: false,
    preferences: [] as string[],
    preferredLanguage: 'de',
    message: '',
    budgetRange: 'no-preference',
    privacyAccepted: false,
  })

  // Lade ausgewählte Fahrschulen aus URL-Parameter oder LocalStorage
  useEffect(() => {
    const loadSchools = async () => {
      try {
        // Hole IDs aus URL-Parameter
        const schoolIds = searchParams.get('schools')?.split(',') || []
        
        // Hole auch aus LocalStorage (Merkzettel)
        const savedIds = JSON.parse(localStorage.getItem('favoriteSchools') || '[]')
        const allIds = [...new Set([...schoolIds, ...savedIds])]
        
        if (allIds.length === 0) {
          setLoading(false)
          return
        }
        
        // Lade Fahrschul-Details
        const response = await fetch(`/api/driving-schools?ids=${allIds.join(',')}`)
        if (response.ok) {
          const data = await response.json()
          setSelectedSchools(data.docs || [])
        }
      } catch (err) {
        console.error('Fehler beim Laden der Fahrschulen:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadSchools()
  }, [searchParams])

  const removeSchool = (id: string) => {
    setSelectedSchools(prev => prev.filter(s => s.id !== id))
  }

  const handlePreferenceChange = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedSchools.length === 0) {
      setError('Bitte wähle mindestens eine Fahrschule aus')
      return
    }
    
    if (!formData.privacyAccepted) {
      setError('Bitte akzeptiere die Datenschutzbestimmungen')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          studentAge: formData.studentAge ? parseInt(formData.studentAge) : undefined,
          drivingSchools: selectedSchools.map(s => s.id),
        }),
      })
      
      if (!response.ok) {
        throw new Error('Fehler beim Senden der Anfrage')
      }
      
      const data = await response.json()
      setInquiryNumber(data.doc.inquiryNumber)
      setAccessToken(data.doc.accessToken)
      setSuccess(true)
      
      // Merkzettel leeren
      localStorage.removeItem('favoriteSchools')
      
    } catch (err) {
      setError('Es ist ein Fehler aufgetreten. Bitte versuche es erneut.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Erfolgs-Ansicht
  if (success) {
    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="glass rounded-3xl p-8 md:p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Anfrage erfolgreich gesendet! 🎉
              </h1>
              
              <p className="text-lg text-slate-600 mb-8">
                Deine Anfrage wurde an <strong>{selectedSchools.length} Fahrschule{selectedSchools.length > 1 ? 'n' : ''}</strong> gesendet.
                Du erhältst in Kürze Antworten.
              </p>
              
              <div className="bg-violet-50 rounded-2xl p-6 mb-8 text-left">
                <h3 className="font-bold text-slate-900 mb-3">Deine Anfrage-Details:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Anfragenummer:</strong> {inquiryNumber}</p>
                  <p><strong>Zugangstoken:</strong> <code className="bg-white px-2 py-1 rounded">{accessToken}</code></p>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  Speichere diese Daten, um deine Anfrage und die Antworten später einzusehen.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={`/meine-anfragen?token=${accessToken}`}
                  className="btn-primary px-8 py-4"
                >
                  Zu meinen Anfragen
                </Link>
                <Link
                  href="/fahrschulen"
                  className="btn-outline px-8 py-4"
                >
                  Weitere Fahrschulen suchen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Start</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/fahrschulen" className="hover:text-white transition-colors">Fahrschulen</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Anfrage senden</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Anfrage an Fahrschulen senden
          </h1>
          <p className="text-lg text-white/60 max-w-2xl">
            Sende eine unverbindliche Anfrage an mehrere Fahrschulen gleichzeitig und vergleiche die Angebote.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Hauptformular */}
            <div className="flex-1">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Ausgewählte Fahrschulen */}
                <div className="glass rounded-3xl p-6 border border-slate-200/50">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-violet-500" />
                    Ausgewählte Fahrschulen ({selectedSchools.length})
                  </h2>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                  ) : selectedSchools.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                      <p className="text-slate-600 mb-4">Du hast noch keine Fahrschulen ausgewählt.</p>
                      <Link href="/fahrschulen" className="btn-primary px-6 py-3">
                        <Plus className="w-4 h-4 mr-2" />
                        Fahrschulen auswählen
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedSchools.map((school) => (
                        <div
                          key={school.id}
                          className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200"
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            {school.logo?.url ? (
                              <Image
                                src={school.logo.url}
                                alt={school.name}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            ) : (
                              <Car className="w-8 h-8 text-violet-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{school.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {school.postalCode} {school.city}
                              </span>
                              {school.rating && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                  {school.rating.toFixed(1)}
                                </span>
                              )}
                              {school.verified && (
                                <Shield className="w-3 h-3 text-green-500" />
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSchool(school.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <Link
                        href="/fahrschulen"
                        className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-violet-600 hover:border-violet-300 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Weitere Fahrschulen hinzufügen
                      </Link>
                    </div>
                  )}
                </div>

                {/* Persönliche Daten */}
                <div className="glass rounded-3xl p-6 border border-slate-200/50">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-fuchsia-500" />
                    Deine Daten
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.studentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Max Mustermann"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        E-Mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.studentEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentEmail: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="max@beispiel.de"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Telefon (optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.studentPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentPhone: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="+49 123 456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Alter
                      </label>
                      <input
                        type="number"
                        min="14"
                        max="99"
                        value={formData.studentAge}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentAge: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="18"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Wohnort (Stadt/PLZ) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.studentCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, studentCity: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Berlin oder 10115"
                      />
                    </div>
                  </div>
                </div>

                {/* Führerschein-Wunsch */}
                <div className="glass rounded-3xl p-6 border border-slate-200/50">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Car className="w-5 h-5 text-cyan-500" />
                    Führerschein-Wunsch
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Führerscheinklasse *
                      </label>
                      <select
                        required
                        value={formData.licenseClass}
                        onChange={(e) => setFormData(prev => ({ ...prev, licenseClass: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="B">B - PKW</option>
                        <option value="B197">B197 - PKW Automatik/Schaltung</option>
                        <option value="BF17">BF17 - Begleitetes Fahren ab 17</option>
                        <option value="A">A - Motorrad</option>
                        <option value="A1">A1 - Leichtkrafträder</option>
                        <option value="A2">A2 - Mittelschwere Motorräder</option>
                        <option value="AM">AM - Moped/Roller</option>
                        <option value="BE">BE - PKW mit Anhänger</option>
                        <option value="C">C - LKW</option>
                        <option value="CE">CE - LKW mit Anhänger</option>
                        <option value="D">D - Bus</option>
                        <option value="T">T - Traktor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Wann möchtest du anfangen?
                      </label>
                      <select
                        value={formData.preferredStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, preferredStart: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="asap">So schnell wie möglich</option>
                        <option value="1-2weeks">In 1-2 Wochen</option>
                        <option value="1month">In 1 Monat</option>
                        <option value="2-3months">In 2-3 Monaten</option>
                        <option value="later">Später / Noch unentschlossen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bevorzugte Kursart
                      </label>
                      <select
                        value={formData.courseType}
                        onChange={(e) => setFormData(prev => ({ ...prev, courseType: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="flexible">Flexibel</option>
                        <option value="regular">Regulärer Kurs</option>
                        <option value="intensive">Intensivkurs / Ferienkurs</option>
                        <option value="weekend">Wochenendkurs</option>
                        <option value="evening">Abendkurs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Budget-Rahmen
                      </label>
                      <select
                        value={formData.budgetRange}
                        onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="no-preference">Keine Angabe</option>
                        <option value="under-2000">Unter 2.000 €</option>
                        <option value="2000-2500">2.000 - 2.500 €</option>
                        <option value="2500-3000">2.500 - 3.000 €</option>
                        <option value="3000-3500">3.000 - 3.500 €</option>
                        <option value="over-3500">Über 3.500 €</option>
                      </select>
                    </div>
                  </div>

                  {/* Checkboxen */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-violet-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.hasFirstAid}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasFirstAid: e.target.checked }))}
                        className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-sm text-slate-700">Erste-Hilfe-Kurs bereits absolviert</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-violet-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.hasEyeTest}
                        onChange={(e) => setFormData(prev => ({ ...prev, hasEyeTest: e.target.checked }))}
                        className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-sm text-slate-700">Sehtest bereits absolviert</span>
                    </label>
                  </div>

                  {/* Besondere Wünsche */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Besondere Wünsche
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'online-theory', label: 'Online-Theorie' },
                        { value: 'automatic', label: 'Automatik-Fahrzeug' },
                        { value: 'simulator', label: 'Fahrsimulator' },
                        { value: 'electric', label: 'Elektro-Fahrzeug' },
                        { value: 'foreign-language', label: 'Fremdsprache benötigt' },
                      ].map((pref) => (
                        <button
                          key={pref.value}
                          type="button"
                          onClick={() => handlePreferenceChange(pref.value)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            formData.preferences.includes(pref.value)
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {pref.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nachricht */}
                <div className="glass rounded-3xl p-6 border border-slate-200/50">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Nachricht (optional)
                  </h2>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    placeholder="Teile den Fahrschulen weitere Details mit, z.B. besondere Anforderungen, zeitliche Einschränkungen, etc."
                  />
                </div>

                {/* Datenschutz & Absenden */}
                <div className="glass rounded-3xl p-6 border border-slate-200/50">
                  <label className="flex items-start gap-3 mb-6">
                    <input
                      type="checkbox"
                      checked={formData.privacyAccepted}
                      onChange={(e) => setFormData(prev => ({ ...prev, privacyAccepted: e.target.checked }))}
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-slate-600">
                      Ich akzeptiere die <Link href="/datenschutz" className="text-violet-600 hover:underline">Datenschutzbestimmungen</Link> und stimme zu, dass meine Daten an die ausgewählten Fahrschulen weitergegeben werden. *
                    </span>
                  </label>

                  {error && (
                    <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || selectedSchools.length === 0}
                    className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Wird gesendet...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Anfrage an {selectedSchools.length} Fahrschule{selectedSchools.length > 1 ? 'n' : ''} senden
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Info-Box */}
                <div className="glass-violet rounded-2xl p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-violet-500" />
                    So funktioniert&apos;s
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center flex-shrink-0">1</span>
                      <span>Fülle das Formular aus und wähle deine Wunsch-Fahrschulen</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center flex-shrink-0">2</span>
                      <span>Deine Anfrage wird an alle ausgewählten Fahrschulen gesendet</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center flex-shrink-0">3</span>
                      <span>Die Fahrschulen senden dir individuelle Angebote</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center flex-shrink-0">4</span>
                      <span>Vergleiche die Angebote und wähle die beste Fahrschule</span>
                    </li>
                  </ul>
                </div>

                {/* Vorteile */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Deine Vorteile</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      100% kostenlos & unverbindlich
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      Mehrere Angebote vergleichen
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      Schnelle Antworten
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      Kein Spam, keine Werbung
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function AnfragePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Lade Anfrage-Formular...</p>
        </div>
      </main>
    }>
      <AnfragePageContent />
    </Suspense>
  )
}
