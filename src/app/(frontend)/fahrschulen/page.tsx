import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { 
  Search, 
  MapPin, 
  Star, 
  SlidersHorizontal,
  Car,
  Bike,
  Truck,
  X,
  Sparkles,
  Filter
} from 'lucide-react'
import { SchoolGrid } from '@/components/SchoolGrid'

interface PageProps {
  searchParams: Promise<{
    city?: string
    class?: string
    features?: string
    priceRange?: string
    sort?: string
    page?: string
  }>
}

export default async function FahrschulenPage({ searchParams }: PageProps) {
  const params = await searchParams
  const payload = await getPayload({ config: configPromise })
  
  const page = parseInt(params.page || '1')
  const limit = 12
  
  // Build where query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereConditions: any[] = [
    { _status: { equals: 'published' } }
  ]
  
  if (params.city) {
    whereConditions.push({
      or: [
        { city: { contains: params.city } },
        { postalCode: { contains: params.city } },
      ]
    })
  }
  
  if (params.class) {
    whereConditions.push({
      licenseClasses: { contains: params.class }
    })
  }
  
  if (params.features) {
    const features = params.features.split(',')
    features.forEach(feature => {
      whereConditions.push({
        features: { contains: feature }
      })
    })
  }
  
  if (params.priceRange) {
    whereConditions.push({
      priceRange: { equals: params.priceRange }
    })
  }
  
  // Determine sort
  let sort: string = '-featured'
  if (params.sort === 'rating') sort = '-rating'
  else if (params.sort === 'reviews') sort = '-reviewCount'
  else if (params.sort === 'newest') sort = '-createdAt'
  
  const schools = await payload.find({
    collection: 'driving-schools',
    where: {
      and: whereConditions
    },
    limit,
    page,
    sort,
  })

  const licenseClasses = [
    { value: 'B', label: 'B - PKW', icon: Car },
    { value: 'A', label: 'A - Motorrad', icon: Bike },
    { value: 'A1', label: 'A1', icon: Bike },
    { value: 'A2', label: 'A2', icon: Bike },
    { value: 'AM', label: 'AM - Moped', icon: Bike },
    { value: 'BE', label: 'BE - Anhänger', icon: Truck },
  ]
  
  const features = [
    { value: 'online-theory', label: 'Online-Theorie' },
    { value: 'intensive', label: 'Intensivkurse' },
    { value: 'simulator', label: 'Fahrsimulator' },
    { value: 'automatic', label: 'Automatik' },
    { value: 'electric', label: 'Elektro' },
    { value: 'weekend', label: 'Wochenendkurse' },
  ]

  const activeFilters: { key: string; label: string }[] = [
    params.city ? { key: 'city', label: params.city } : null,
    params.class ? { key: 'class', label: licenseClasses.find(c => c.value === params.class)?.label || params.class } : null,
    params.priceRange ? { key: 'priceRange', label: params.priceRange === 'budget' ? '€ Günstig' : params.priceRange === 'medium' ? '€€ Mittel' : '€€€ Gehoben' } : null,
  ].filter((f): f is { key: string; label: string } => f !== null)

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ============================================
          HERO HEADER
          ============================================ */}
      <section className="relative bg-slate-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="hero-gradient-orb w-[600px] h-[600px] -top-1/2 -left-1/4 bg-violet-600/20" />
          <div className="hero-gradient-orb w-[400px] h-[400px] top-0 right-0 bg-fuchsia-600/15" style={{ animationDelay: '-2s' }} />
        </div>
        <div className="absolute inset-0 z-0 hero-grid opacity-5" />
        
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white/80 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{schools.totalDocs} Fahrschulen verfügbar</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Finde deine
              <span className="gradient-text-animated"> Fahrschule</span>
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Durchsuche hunderte Fahrschulen, vergleiche Preise und finde die perfekte Fahrschule für dich
            </p>
          </div>
          
          {/* Search Box */}
          <form className="max-w-4xl mx-auto">
            <div className="search-box">
              <div className="flex flex-col md:flex-row gap-3 p-2">
                {/* Location Input */}
                <div className="flex-1 relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                  <input
                    type="text"
                    name="city"
                    defaultValue={params.city}
                    placeholder="Stadt oder PLZ eingeben..."
                    className="search-input w-full pl-12 pr-4 py-4 focus:outline-none"
                  />
                </div>
                
                {/* License Class Select */}
                <select
                  name="class"
                  defaultValue={params.class}
                  className="search-input px-4 py-4 md:w-48 appearance-none cursor-pointer focus:outline-none"
                >
                  <option value="" className="text-slate-900">Alle Klassen</option>
                  {licenseClasses.map(cls => (
                    <option key={cls.value} value={cls.value} className="text-slate-900">
                      {cls.label}
                    </option>
                  ))}
                </select>
                
                {/* Search Button */}
                <button
                  type="submit"
                  className="btn-primary px-8 py-4"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Suchen
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ============================================
          RESULTS SECTION
          ============================================ */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* ============================================
                SIDEBAR FILTERS
                ============================================ */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="glass rounded-3xl p-6 sticky top-24 border border-slate-200/50 shadow-xl shadow-slate-200/30">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-bold text-xl text-slate-900">Filter</h2>
                </div>
                
                {/* License Classes */}
                <div className="mb-8">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Car className="w-4 h-4 text-violet-500" />
                    Führerscheinklasse
                  </h3>
                  <div className="space-y-3">
                    {licenseClasses.map(cls => (
                      <label key={cls.value} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-violet-50 transition-colors">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg border-slate-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-0"
                        />
                        <span className="text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                          {cls.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Features */}
                <div className="mb-8">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-500" />
                    Besonderheiten
                  </h3>
                  <div className="space-y-3">
                    {features.map(feature => (
                      <label key={feature.value} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-fuchsia-50 transition-colors">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded-lg border-slate-300 text-fuchsia-600 focus:ring-fuchsia-500 focus:ring-offset-0"
                        />
                        <span className="text-slate-600 group-hover:text-slate-900 transition-colors font-medium">
                          {feature.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="font-semibold text-slate-900 mb-4">Preiskategorie</h3>
                  <div className="space-y-3">
                    {[
                      { value: 'budget', label: '€ - Günstig', color: 'bg-green-50 hover:bg-green-100' },
                      { value: 'medium', label: '€€ - Mittel', color: 'bg-amber-50 hover:bg-amber-100' },
                      { value: 'premium', label: '€€€ - Gehoben', color: 'bg-violet-50 hover:bg-violet-100' },
                    ].map(price => (
                      <label key={price.value} className={`flex items-center gap-3 cursor-pointer group p-3 rounded-xl ${price.color} transition-colors`}>
                        <input
                          type="radio"
                          name="priceRange"
                          className="w-5 h-5 border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span className="text-slate-700 font-medium">
                          {price.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Rating */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Mindestbewertung
                  </h3>
                  <div className="space-y-3">
                    {[4, 3, 2].map(rating => (
                      <label key={rating} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-amber-50 transition-colors">
                        <input
                          type="radio"
                          name="minRating"
                          className="w-5 h-5 border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="text-slate-500 ml-2 text-sm">& mehr</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
            
            {/* ============================================
                MAIN CONTENT
                ============================================ */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-6 glass rounded-2xl border border-slate-200/50">
                <div>
                  <p className="text-slate-600">
                    <span className="font-bold text-2xl text-slate-900">{schools.totalDocs}</span>
                    <span className="ml-2">Fahrschulen gefunden</span>
                    {params.city && <span className="text-violet-600 font-medium"> in {params.city}</span>}
                  </p>
                </div>
                
                {/* Sort */}
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Sortieren:</span>
                  <select
                    defaultValue={params.sort || 'featured'}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                  >
                    <option value="featured">Empfohlen</option>
                    <option value="rating">Beste Bewertung</option>
                    <option value="reviews">Meiste Bewertungen</option>
                    <option value="newest">Neueste</option>
                  </select>
                </div>
              </div>
              
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <span className="text-sm text-slate-500">Aktive Filter:</span>
                  {activeFilters.map((filter) => (
                    <span
                      key={filter.key}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 rounded-full text-sm font-medium border border-violet-200"
                    >
                      {filter.label}
                      <button className="hover:text-violet-900 p-0.5 rounded-full hover:bg-violet-200 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <Link href="/fahrschulen" className="text-sm text-violet-600 hover:text-violet-700 font-medium hover:underline">
                    Alle zurücksetzen
                  </Link>
                </div>
              )}
              
              {/* ============================================
                  SCHOOL GRID
                  ============================================ */}
              {schools.docs.length > 0 ? (
                <SchoolGrid 
                  schools={schools.docs.map(school => ({
                    id: school.id,
                    name: school.name,
                    slug: school.slug,
                    street: school.street,
                    postalCode: school.postalCode,
                    city: school.city,
                    rating: school.rating,
                    reviewCount: school.reviewCount,
                    verified: school.verified,
                    featured: school.featured,
                    shortDescription: school.shortDescription,
                    licenseClasses: school.licenseClasses,
                    features: school.features,
                    logo: school.logo && typeof school.logo === 'object' ? { url: school.logo.url } : null,
                  }))}
                  featureLabels={features.reduce((acc, f) => ({ ...acc, [f.value]: f.label }), {})}
                />
              ) : (
                <div className="text-center py-20 glass rounded-3xl">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
                    <Search className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Keine Fahrschulen gefunden
                  </h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    Versuche es mit anderen Suchbegriffen oder entferne einige Filter, um mehr Ergebnisse zu erhalten
                  </p>
                  <Link
                    href="/fahrschulen"
                    className="btn-primary inline-flex items-center gap-2 px-8 py-4"
                  >
                    Filter zurücksetzen
                    <X className="w-4 h-4" />
                  </Link>
                </div>
              )}
              
              {/* ============================================
                  PAGINATION
                  ============================================ */}
              {schools.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: schools.totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/fahrschulen?${new URLSearchParams({
                        ...params,
                        page: pageNum.toString(),
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      } as any).toString()}`}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ${
                        pageNum === page
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'Fahrschulen finden | FahrschulFinder',
  description: 'Finde und vergleiche Fahrschulen in deiner Nähe. Filter nach Führerscheinklasse, Preis und Bewertungen.',
}
