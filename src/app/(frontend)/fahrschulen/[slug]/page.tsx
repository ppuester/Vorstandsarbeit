import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { 
  MapPin, 
  Star, 
  Shield, 
  Phone,
  Mail,
  Globe,
  Clock,
  Car,
  CheckCircle,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Award,
  Sparkles,
  Languages,
  Euro,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Stethoscope,
  Calendar
} from 'lucide-react'
import type { DrivingSchool, Review } from '@/payload-types'
import { SchoolActions } from '@/components/SchoolActions'
import { FavoritesBadge } from '@/components/FavoritesBadge'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Type helpers für nested arrays
type PriceItem = NonNullable<DrivingSchool['prices']>[number]
type OpeningHoursItem = NonNullable<DrivingSchool['openingHours']>[number]
type ChecklistItem = NonNullable<DrivingSchool['checklist']>[number]
type ProItem = NonNullable<Review['pros']>[number]
type ConItem = NonNullable<Review['cons']>[number]

export default async function FahrschulePage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  
  const schools = await payload.find({
    collection: 'driving-schools',
    where: {
      slug: { equals: slug },
      _status: { equals: 'published' },
    },
    limit: 1,
  })
  
  const school = schools.docs[0]
  
  if (!school) {
    notFound()
  }
  
  // Get reviews for this school
  const reviews = await payload.find({
    collection: 'reviews',
    where: {
      drivingSchool: { equals: school.id },
      approved: { equals: true },
    },
    limit: 10,
    sort: '-createdAt',
  })

  const dayNames: Record<string, string> = {
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag',
  }

  const featureLabels: Record<string, string> = {
    'online-theory': 'Online-Theorie',
    'intensive': 'Intensivkurse',
    'holiday-courses': 'Ferienkurse',
    'simulator': 'Fahrsimulator',
    'automatic': 'Automatik-Fahrzeuge',
    'electric': 'Elektro-Fahrzeuge',
    'accessible': 'Behindertengerecht',
    'first-aid': 'Erste-Hilfe-Kurs',
    'eye-test': 'Sehtest vor Ort',
    'photos': 'Passbilder vor Ort',
    'refresher': 'Auffrischungskurse',
    'asf': 'ASF-Kurse',
    'weekend': 'Wochenendkurse',
    'evening': 'Abendkurse',
  }

  const languageLabels: Record<string, string> = {
    de: 'Deutsch',
    en: 'Englisch',
    tr: 'Türkisch',
    ar: 'Arabisch',
    ru: 'Russisch',
    pl: 'Polnisch',
    es: 'Spanisch',
    fr: 'Französisch',
    it: 'Italienisch',
    pt: 'Portugiesisch',
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ============================================
          BREADCRUMB
          ============================================ */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-violet-600 transition-colors">Start</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/fahrschulen" className="hover:text-violet-600 transition-colors">Fahrschulen</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{school.name}</span>
          </div>
        </div>
      </div>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative bg-slate-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="hero-gradient-orb w-[600px] h-[600px] -top-1/2 -left-1/4 bg-violet-600/20" />
          <div className="hero-gradient-orb w-[400px] h-[400px] bottom-0 right-0 bg-fuchsia-600/15" style={{ animationDelay: '-2s' }} />
        </div>
        <div className="absolute inset-0 hero-grid opacity-5" />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
            {/* Logo */}
            <div className="w-44 h-44 bg-white rounded-3xl p-5 flex-shrink-0 shadow-2xl shadow-black/20">
              {school.logo && typeof school.logo === 'object' && school.logo.url ? (
                <div className="relative w-full h-full">
                  <Image
                    src={school.logo.url}
                    alt={school.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-2xl flex items-center justify-center">
                  <Car className="w-20 h-20 text-violet-600" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                {school.verified && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-400 text-sm font-semibold rounded-full">
                    <Shield className="w-4 h-4" />
                    Verifiziert
                  </span>
                )}
                {school.featured && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 text-amber-400 text-sm font-semibold rounded-full">
                    <Award className="w-4 h-4" />
                    Empfohlen
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                {school.name}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/70 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-violet-400" />
                  <span>{school.street}, {school.postalCode} {school.city}</span>
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center gap-3 glass-dark rounded-2xl px-5 py-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= (school.rating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-white text-2xl">
                    {school.rating?.toFixed(1) || '–'}
                  </span>
                  <span className="text-white/50">
                    ({school.reviewCount || 0} Bewertungen)
                  </span>
                </div>
              </div>
            </div>
            
            {/* Contact Card */}
            <div className="w-full lg:w-auto glass rounded-3xl p-6 shadow-2xl border border-white/10 lg:min-w-[320px]">
              <h2 className="font-bold text-slate-900 text-xl mb-5 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Kontakt aufnehmen
              </h2>
              
              <div className="space-y-4 mb-6">
                {school.phone && (
                  <a
                    href={`tel:${school.phone}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-violet-50 text-slate-700 hover:text-violet-700 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-5 h-5 text-violet-600" />
                    </div>
                    <span className="font-medium">{school.phone}</span>
                  </a>
                )}
                {school.email && (
                  <a
                    href={`mailto:${school.email}`}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-fuchsia-50 text-slate-700 hover:text-fuchsia-700 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-fuchsia-600" />
                    </div>
                    <span className="font-medium">{school.email}</span>
                  </a>
                )}
                {school.website && (
                  <a
                    href={school.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="w-5 h-5 text-cyan-600" />
                    </div>
                    <span className="font-medium flex items-center gap-2">
                      Website
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </a>
                )}
              </div>
              
              <SchoolActions
                schoolId={school.id}
                schoolName={school.name}
                schoolEmail={school.email}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CONTENT SECTION
          ============================================ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ============================================
                MAIN CONTENT
                ============================================ */}
            <div className="flex-1 space-y-8">
              {/* License Classes */}
              <div className="feature-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Führerscheinklassen</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {school.licenseClasses?.map((cls: string) => (
                    <div
                      key={cls}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 rounded-xl font-semibold border border-violet-100 hover:border-violet-300 transition-colors"
                    >
                      <span className="text-lg">{cls}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Description */}
              {school.shortDescription && (
                <div className="feature-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Über uns</h2>
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed">{school.shortDescription}</p>
                </div>
              )}
              
              {/* Features */}
              {school.features && school.features.length > 0 && (
                <div className="feature-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Besonderheiten</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {school.features.map((feature: string) => (
                      <div
                        key={feature}
                        className="flex items-center gap-4 p-4 rounded-xl bg-green-50/50 border border-green-100 hover:border-green-200 transition-colors"
                      >
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{featureLabels[feature] || feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Languages */}
              {school.languages && school.languages.length > 0 && (
                <div className="feature-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Languages className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Unterrichtssprachen</h2>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {school.languages.map((lang: string) => (
                      <span
                        key={lang}
                        className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium border border-blue-100"
                      >
                        {languageLabels[lang] || lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Checkliste */}
              {school.checklist && school.checklist.length > 0 && (
                <div className="feature-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Checkliste - Was wird benötigt</h2>
                  </div>
                  <div className="space-y-3">
                    {school.checklist.map((item: ChecklistItem, index: number) => {
                      // Icon basierend auf Kategorie
                      const getCategoryIcon = (category: string | null | undefined) => {
                        switch (category) {
                          case 'documents':
                            return <FileText className="w-5 h-5" />
                          case 'courses':
                            return <GraduationCap className="w-5 h-5" />
                          case 'examinations':
                            return <Stethoscope className="w-5 h-5" />
                          default:
                            return <CheckCircle className="w-5 h-5" />
                        }
                      }
                      
                      // Farbe basierend auf Kategorie
                      const getCategoryColor = (category: string | null | undefined) => {
                        switch (category) {
                          case 'documents':
                            return 'from-blue-500 to-cyan-500'
                          case 'courses':
                            return 'from-purple-500 to-pink-500'
                          case 'examinations':
                            return 'from-red-500 to-orange-500'
                          default:
                            return 'from-emerald-500 to-teal-500'
                        }
                      }
                      
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryColor(item.category)} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <div className="text-white">
                              {getCategoryIcon(item.category)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{item.item}</h3>
                              {item.required && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-md">
                                  Erforderlich
                                </span>
                              )}
                              {!item.required && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-md">
                                  Optional
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Prices */}
              {school.prices && school.prices.length > 0 && (
                <div className="feature-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Euro className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Preise</h2>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                          <th className="text-left py-4 px-5 font-bold text-slate-900">Klasse</th>
                          <th className="text-right py-4 px-5 font-bold text-slate-900">Grundgebühr</th>
                          <th className="text-right py-4 px-5 font-bold text-slate-900">Fahrstunde</th>
                          <th className="text-right py-4 px-5 font-bold text-slate-900">Prüfung</th>
                        </tr>
                      </thead>
                      <tbody>
                        {school.prices.map((price: PriceItem, index: number) => (
                          <tr key={index} className="border-t border-slate-100 hover:bg-amber-50/30 transition-colors">
                            <td className="py-4 px-5 font-semibold text-slate-900">{price.licenseClass}</td>
                            <td className="py-4 px-5 text-right text-slate-600">
                              {price.basePrice ? <span className="font-medium">{price.basePrice} €</span> : '–'}
                            </td>
                            <td className="py-4 px-5 text-right text-slate-600">
                              {price.lessonPrice ? <span className="font-medium">{price.lessonPrice} €</span> : '–'}
                            </td>
                            <td className="py-4 px-5 text-right text-slate-600">
                              {price.examPrice ? <span className="font-medium">{price.examPrice} €</span> : '–'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* ============================================
                  REVIEWS SECTION
                  ============================================ */}
              <div className="feature-card">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Bewertungen</h2>
                      <p className="text-slate-500">{reviews.totalDocs} Bewertungen</p>
                    </div>
                  </div>
                  <button className="btn-outline px-6 py-3 text-sm">
                    Bewertung schreiben
                  </button>
                </div>
                
                {reviews.docs.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.docs.map((review, index) => (
                      <div 
                        key={review.id} 
                        className={`p-6 rounded-2xl bg-slate-50/70 ${index !== reviews.docs.length - 1 ? 'border-b-0' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-violet-500/30">
                              {review.authorName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-lg">{review.authorName}</span>
                              <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                {review.licenseClass && (
                                  <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md text-xs font-medium">
                                    Klasse {review.licenseClass}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-slate-400 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(review.createdAt).toLocaleDateString('de-DE')}
                          </span>
                        </div>
                        
                        {review.title && (
                          <h3 className="font-bold text-slate-900 text-lg mb-2">{review.title}</h3>
                        )}
                        <p className="text-slate-600 mb-5 leading-relaxed">{review.text}</p>
                        
                        {/* Pros & Cons */}
                        <div className="flex flex-col md:flex-row gap-4">
                          {review.pros && review.pros.length > 0 && (
                            <div className="flex-1 p-4 rounded-xl bg-green-50 border border-green-100">
                              <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Vorteile
                              </h4>
                              <ul className="space-y-2">
                                {review.pros.map((pro: ProItem, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-green-500 mt-0.5">+</span>
                                    {pro.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {review.cons && review.cons.length > 0 && (
                            <div className="flex-1 p-4 rounded-xl bg-red-50 border border-red-100">
                              <h4 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                                <span className="w-4 h-4 flex items-center justify-center">−</span>
                                Nachteile
                              </h4>
                              <ul className="space-y-2">
                                {review.cons.map((con: ConItem, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="text-red-500 mt-0.5">−</span>
                                    {con.text}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        
                        {/* Helpful */}
                        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-slate-200">
                          <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors px-4 py-2 rounded-lg hover:bg-violet-50">
                            <ThumbsUp className="w-4 h-4" />
                            Hilfreich ({review.helpful || 0})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 rounded-2xl bg-slate-50">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Noch keine Bewertungen</h3>
                    <p className="text-slate-500 mb-6">Sei der Erste, der diese Fahrschule bewertet!</p>
                    <button className="btn-primary px-8 py-3">
                      Bewertung schreiben
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* ============================================
                SIDEBAR
                ============================================ */}
            <aside className="lg:w-96 flex-shrink-0">
              <div className="space-y-6 sticky top-24">
                {/* Opening Hours */}
                {school.openingHours && school.openingHours.length > 0 && (
                  <div className="glass rounded-3xl p-6 border border-slate-200/50 shadow-xl shadow-slate-200/30">
                    <h2 className="flex items-center gap-3 font-bold text-slate-900 text-xl mb-5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      Öffnungszeiten
                    </h2>
                    <div className="space-y-3">
                      {school.openingHours.map((hours: OpeningHoursItem, index: number) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-slate-600">{dayNames[hours.day]}</span>
                          <span className={`font-semibold ${hours.closed ? 'text-red-500' : 'text-slate-900'}`}>
                            {hours.closed ? 'Geschlossen' : `${hours.openTime} - ${hours.closeTime}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Map */}
                <div className="glass rounded-3xl overflow-hidden border border-slate-200/50 shadow-xl shadow-slate-200/30">
                  <div className="h-52 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
                    <div className="text-center text-slate-400">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-violet-500" />
                      </div>
                      <p className="text-sm font-medium">Karte</p>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute inset-0 hero-grid opacity-10" />
                  </div>
                  <div className="p-5">
                    <p className="text-slate-700 font-medium mb-1">{school.street}</p>
                    <p className="text-slate-500 mb-4">{school.postalCode} {school.city}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${school.name} ${school.street} ${school.postalCode} ${school.city}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold group"
                    >
                      In Google Maps öffnen
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
                
                {/* CTA Card */}
                <div className="glass-violet rounded-3xl p-6 text-center">
                  <Award className="w-12 h-12 text-violet-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Interesse geweckt?</h3>
                  <p className="text-slate-600 mb-5 text-sm">
                    Kontaktiere {school.name} jetzt und starte deine Fahrausbildung!
                  </p>
                  <a
                    href={`tel:${school.phone}`}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  >
                    <Phone className="w-5 h-5" />
                    Jetzt anrufen
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Favorites Badge */}
      <FavoritesBadge />
    </main>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  
  const schools = await payload.find({
    collection: 'driving-schools',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  
  const school = schools.docs[0]
  
  if (!school) {
    return { title: 'Fahrschule nicht gefunden' }
  }
  
  return {
    title: `${school.name} | Fahrschule in ${school.city} | FahrschulFinder`,
    description: school.shortDescription || `${school.name} in ${school.city} - Finde alle Infos zu Führerscheinklassen, Preisen und Bewertungen.`,
  }
}
