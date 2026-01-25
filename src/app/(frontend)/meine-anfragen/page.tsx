'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  ChevronRight,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Euro,
  Car,
  Shield,
  ExternalLink,
  Loader2,
  AlertCircle,
  Search,
  Gift,
  Trophy,
  Sparkles,
  Package,
  Info
} from 'lucide-react'

interface DrivingSchool {
  id: string
  name: string
  slug: string
  city: string
  postalCode: string
  street: string
  phone?: string
  email?: string
  rating?: number
  reviewCount?: number
  verified?: boolean
  logo?: { url: string }
}

interface PriceOffer {
  basePrice?: number
  lessonPrice?: number
  specialLessonPrice?: number
  theoryMaterial?: number
  theoryExam?: number
  practicalExam?: number
  estimatedTotal?: number
  estimatedLessons?: number
}

interface SpecialOffer {
  title: string
  discount?: string
  validUntil?: string
}

interface InquiryResponse {
  id: string
  responseNumber: string
  drivingSchool: DrivingSchool
  greeting?: string
  availability?: string
  canFulfillPreferences?: boolean
  preferencesNote?: string
  priceOffer?: PriceOffer
  specialOffers?: SpecialOffer[]
  paymentOptions?: string[]
  freeTrialLesson?: boolean
  status: string
  contactPerson?: string
  directPhone?: string
  createdAt: string
}

interface Inquiry {
  id: string
  inquiryNumber: string
  studentName: string
  studentEmail: string
  licenseClass: string
  preferredStart?: string
  courseType?: string
  status: string
  responseCount: number
  drivingSchools: DrivingSchool[]
  createdAt: string
  expiresAt: string
}

function MeineAnfragenPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [responses, setResponses] = useState<InquiryResponse[]>([])
  const [compareMode, setCompareMode] = useState(false)
  const [compareList, setCompareList] = useState<string[]>([])

  useEffect(() => {
    const loadInquiry = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/inquiries?token=${token}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Anfrage nicht gefunden. Bitte prüfe deinen Zugangstoken.')
          } else {
            throw new Error('Fehler beim Laden')
          }
          return
        }

        const data = await response.json()
        setInquiry(data.inquiry)
        setResponses(data.responses || [])
      } catch (err) {
        setError('Fehler beim Laden der Anfrage')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadInquiry()
  }, [token])

  const toggleCompare = (id: string) => {
    setCompareList(prev => 
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const availabilityLabels: Record<string, { label: string, color: string }> = {
    'immediate': { label: 'Sofort verfügbar', color: 'bg-green-100 text-green-700' },
    '1-2weeks': { label: 'In 1-2 Wochen', color: 'bg-blue-100 text-blue-700' },
    '2-4weeks': { label: 'In 2-4 Wochen', color: 'bg-amber-100 text-amber-700' },
    'waitlist': { label: 'Warteliste', color: 'bg-orange-100 text-orange-700' },
    'no-capacity': { label: 'Keine Kapazität', color: 'bg-red-100 text-red-700' },
  }

  const paymentLabels: Record<string, string> = {
    'single': 'Einmalzahlung',
    'installments': 'Ratenzahlung',
    'per-lesson': 'Pro Fahrstunde',
    'voucher': 'Bildungsgutschein',
    'ec': 'EC-Karte',
    'credit-card': 'Kreditkarte',
    'transfer': 'Überweisung',
    'cash': 'Bar',
  }

  // Token-Eingabe wenn kein Token vorhanden
  if (!token) {
    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="glass rounded-3xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-violet-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-violet-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">
                Anfrage aufrufen
              </h1>
              <p className="text-slate-600 mb-8">
                Gib deinen Zugangstoken ein, um deine Anfrage und die erhaltenen Angebote einzusehen.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const enteredToken = formData.get('token')
                  if (enteredToken) {
                    window.location.href = `/meine-anfragen?token=${enteredToken}`
                  }
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  name="token"
                  placeholder="Zugangstoken eingeben..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-center font-mono"
                  required
                />
                <button type="submit" className="btn-primary w-full py-3">
                  Anfrage anzeigen
                </button>
              </form>
              <p className="mt-6 text-sm text-slate-500">
                Keine Anfrage? <Link href="/fahrschulen" className="text-violet-600 hover:underline">Starte eine neue Suche</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Lade deine Anfrage...</p>
        </div>
      </main>
    )
  }

  if (error || !inquiry) {
    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              {error || 'Anfrage nicht gefunden'}
            </h1>
            <p className="text-slate-600 mb-6">
              Der Token ist ungültig oder abgelaufen.
            </p>
            <Link href="/fahrschulen" className="btn-primary px-6 py-3">
              Neue Anfrage starten
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const comparedResponses = responses.filter(r => compareList.includes(r.id))

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Start</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Meine Anfragen</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Deine Anfrage
              </h1>
              <p className="text-white/60">
                Anfragenummer: <span className="text-white font-mono">{inquiry.inquiryNumber}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                inquiry.status === 'pending' ? 'bg-amber-500 text-white' :
                inquiry.status === 'responded' ? 'bg-green-500 text-white' :
                inquiry.status === 'closed' ? 'bg-slate-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {inquiry.status === 'pending' ? '⏳ Warte auf Antworten' :
                 inquiry.status === 'responded' ? `✅ ${inquiry.responseCount} Antworten` :
                 inquiry.status === 'closed' ? '✓ Abgeschlossen' :
                 '❌ Storniert'}
              </span>
              <span className="px-4 py-2 rounded-full bg-white/10 text-white text-sm">
                Gültig bis: {formatDate(inquiry.expiresAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Anfrage-Details */}
          <div className="glass rounded-2xl p-6 mb-8">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-violet-500" />
              Anfrage-Details
            </h2>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Führerscheinklasse</span>
                <p className="font-semibold text-slate-900">{inquiry.licenseClass}</p>
              </div>
              <div>
                <span className="text-slate-500">Gewünschter Start</span>
                <p className="font-semibold text-slate-900">
                  {inquiry.preferredStart === 'asap' ? 'So schnell wie möglich' :
                   inquiry.preferredStart === '1-2weeks' ? 'In 1-2 Wochen' :
                   inquiry.preferredStart === '1month' ? 'In 1 Monat' :
                   inquiry.preferredStart === '2-3months' ? 'In 2-3 Monaten' :
                   'Später'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Angefragte Fahrschulen</span>
                <p className="font-semibold text-slate-900">{inquiry.drivingSchools?.length || 0}</p>
              </div>
              <div>
                <span className="text-slate-500">Erhaltene Antworten</span>
                <p className="font-semibold text-slate-900">{responses.length}</p>
              </div>
            </div>
          </div>

          {/* Vergleichs-Button */}
          {responses.length > 1 && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Erhaltene Angebote ({responses.length})
              </h2>
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  compareMode 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-violet-300'
                }`}
              >
                {compareMode ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    {compareList.length} ausgewählt
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2 inline" />
                    Vergleichen
                  </>
                )}
              </button>
            </div>
          )}

          {/* Vergleichsansicht */}
          {compareMode && compareList.length >= 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 overflow-x-auto">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Angebotsvergleich
              </h3>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-3 border-b"></th>
                    {comparedResponses.map(res => (
                      <th key={res.id} className="text-left p-3 border-b min-w-[200px]">
                        <div className="font-semibold text-slate-900">{res.drivingSchool.name}</div>
                        <div className="text-sm text-slate-500">{res.drivingSchool.city}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b font-medium text-slate-700">Verfügbarkeit</td>
                    {comparedResponses.map(res => (
                      <td key={res.id} className="p-3 border-b">
                        {res.availability && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${availabilityLabels[res.availability]?.color || 'bg-slate-100'}`}>
                            {availabilityLabels[res.availability]?.label || res.availability}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium text-slate-700">Grundgebühr</td>
                    {comparedResponses.map(res => (
                      <td key={res.id} className="p-3 border-b font-semibold">
                        {res.priceOffer?.basePrice ? `${res.priceOffer.basePrice} €` : '–'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium text-slate-700">Fahrstunde</td>
                    {comparedResponses.map(res => (
                      <td key={res.id} className="p-3 border-b font-semibold">
                        {res.priceOffer?.lessonPrice ? `${res.priceOffer.lessonPrice} €` : '–'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium text-slate-700">Sonderfahrt</td>
                    {comparedResponses.map(res => (
                      <td key={res.id} className="p-3 border-b">
                        {res.priceOffer?.specialLessonPrice ? `${res.priceOffer.specialLessonPrice} €` : '–'}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-violet-50">
                    <td className="p-3 font-bold text-slate-900">Geschätzte Gesamt</td>
                    {comparedResponses.map(res => (
                      <td key={res.id} className="p-3 font-bold text-violet-700 text-lg">
                        {res.priceOffer?.estimatedTotal ? `${res.priceOffer.estimatedTotal} €` : '–'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 border-b font-medium text-slate-700">Probestunde</td>
                    {comparedResponses.map(res => (
                      <td key={res.id} className="p-3 border-b">
                        {res.freeTrialLesson ? (
                          <span className="text-green-600 font-medium">✓ Ja</span>
                        ) : (
                          <span className="text-slate-400">–</span>
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-700">Sonderangebote</td>
                    {comparedResponses.map(res => (
                      <td key={res.id} className="p-3">
                        {res.specialOffers && res.specialOffers.length > 0 ? (
                          <span className="text-amber-600 font-medium">
                            {res.specialOffers.length} Angebot{res.specialOffers.length > 1 ? 'e' : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400">–</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Antworten Liste */}
          {responses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Noch keine Antworten
              </h3>
              <p className="text-slate-600 mb-2">
                Die Fahrschulen wurden benachrichtigt. Antworten dauern in der Regel 1-3 Werktage.
              </p>
              <p className="text-sm text-slate-500">
                Du erhältst eine E-Mail, sobald neue Antworten eingehen.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    compareMode && compareList.includes(response.id)
                      ? 'border-violet-400 ring-2 ring-violet-200'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4 p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {response.drivingSchool.logo?.url ? (
                          <Image
                            src={response.drivingSchool.logo.url}
                            alt={response.drivingSchool.name}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        ) : (
                          <Car className="w-8 h-8 text-violet-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">
                          {response.drivingSchool.name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {response.drivingSchool.city}
                          </span>
                          {response.drivingSchool.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {response.drivingSchool.rating.toFixed(1)}
                            </span>
                          )}
                          {response.drivingSchool.verified && (
                            <Shield className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {response.availability && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${availabilityLabels[response.availability]?.color || 'bg-slate-100'}`}>
                          {availabilityLabels[response.availability]?.label || response.availability}
                        </span>
                      )}
                      {response.freeTrialLesson && (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          Probestunde
                        </span>
                      )}
                      {compareMode && (
                        <button
                          onClick={() => toggleCompare(response.id)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            compareList.includes(response.id)
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {compareList.includes(response.id) ? 'Ausgewählt' : 'Vergleichen'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {response.greeting && (
                      <p className="text-slate-600 mb-6 italic">&ldquo;{response.greeting}&rdquo;</p>
                    )}

                    {/* Preisübersicht */}
                    {response.priceOffer && (
                      <div className="bg-slate-50 rounded-xl p-6 mb-6">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Euro className="w-5 h-5 text-green-600" />
                          Preisangebot
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {response.priceOffer.basePrice && (
                            <div>
                              <span className="text-sm text-slate-500">Grundgebühr</span>
                              <p className="font-semibold text-slate-900">{response.priceOffer.basePrice} €</p>
                            </div>
                          )}
                          {response.priceOffer.lessonPrice && (
                            <div>
                              <span className="text-sm text-slate-500">Fahrstunde</span>
                              <p className="font-semibold text-slate-900">{response.priceOffer.lessonPrice} €</p>
                            </div>
                          )}
                          {response.priceOffer.specialLessonPrice && (
                            <div>
                              <span className="text-sm text-slate-500">Sonderfahrt</span>
                              <p className="font-semibold text-slate-900">{response.priceOffer.specialLessonPrice} €</p>
                            </div>
                          )}
                          {response.priceOffer.estimatedLessons && (
                            <div>
                              <span className="text-sm text-slate-500">Gesch. Stunden</span>
                              <p className="font-semibold text-slate-900">~{response.priceOffer.estimatedLessons}</p>
                            </div>
                          )}
                        </div>
                        {response.priceOffer.estimatedTotal && (
                          <div className="pt-4 border-t border-slate-200">
                            <span className="text-sm text-slate-500">Geschätzte Gesamtkosten</span>
                            <p className="text-2xl font-bold text-violet-600">{response.priceOffer.estimatedTotal} €</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sonderangebote */}
                    {response.specialOffers && response.specialOffers.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          Sonderangebote
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {response.specialOffers.map((offer, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg"
                            >
                              <span className="font-medium text-amber-800">{offer.title}</span>
                              {offer.discount && (
                                <span className="ml-2 text-amber-600">({offer.discount})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Zahlungsoptionen */}
                    {response.paymentOptions && response.paymentOptions.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-slate-900 mb-2">Zahlungsoptionen</h4>
                        <div className="flex flex-wrap gap-2">
                          {response.paymentOptions.map((opt) => (
                            <span
                              key={opt}
                              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm"
                            >
                              {paymentLabels[opt] || opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kontakt */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                      {response.drivingSchool.phone && (
                        <a
                          href={`tel:${response.drivingSchool.phone}`}
                          className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
                        >
                          <Phone className="w-4 h-4" />
                          {response.directPhone || response.drivingSchool.phone}
                        </a>
                      )}
                      {response.drivingSchool.email && (
                        <a
                          href={`mailto:${response.drivingSchool.email}`}
                          className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium"
                        >
                          <Mail className="w-4 h-4" />
                          E-Mail schreiben
                        </a>
                      )}
                      <Link
                        href={`/fahrschulen/${response.drivingSchool.slug}`}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Profil ansehen
                      </Link>
                      {response.contactPerson && (
                        <span className="text-sm text-slate-500">
                          Ansprechpartner: {response.contactPerson}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Noch nicht antwortende Fahrschulen */}
          {inquiry.drivingSchools && responses.length < inquiry.drivingSchools.length && (
            <div className="mt-8">
              <h3 className="font-semibold text-slate-700 mb-4">
                Noch ausstehende Antworten ({inquiry.drivingSchools.length - responses.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {inquiry.drivingSchools
                  .filter(school => !responses.some(r => r.drivingSchool.id === school.id))
                  .map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600"
                    >
                      <Clock className="w-4 h-4 text-amber-500" />
                      {school.name}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default function MeineAnfragenPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Lade Anfragen...</p>
        </div>
      </main>
    }>
      <MeineAnfragenPageContent />
    </Suspense>
  )
}
