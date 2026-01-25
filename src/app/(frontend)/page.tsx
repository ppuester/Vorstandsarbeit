import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { 
  Search, 
  MapPin, 
  Star, 
  Shield, 
  Car, 
  Users, 
  Clock, 
  CheckCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Award,
  TrendingUp
} from 'lucide-react'

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  // Hervorgehobene Fahrschulen abrufen
  const featuredSchools = await payload.find({
    collection: 'driving-schools',
    where: {
      featured: { equals: true },
      _status: { equals: 'published' },
    },
    limit: 6,
    sort: '-rating',
  })

  // Neueste Bewertungen abrufen
  const recentReviews = await payload.find({
    collection: 'reviews',
    where: {
      approved: { equals: true },
    },
    limit: 3,
    sort: '-createdAt',
    depth: 1,
  })

  // Statistiken berechnen
  const totalSchools = await payload.count({
    collection: 'driving-schools',
    where: { _status: { equals: 'published' } },
  })

  const totalReviews = await payload.count({
    collection: 'reviews',
    where: { approved: { equals: true } },
  })

  // Anzahl der Städte berechnen (unique cities)
  const allSchools = await payload.find({
    collection: 'driving-schools',
    where: { _status: { equals: 'published' } },
    limit: 10000,
    select: {
      city: true,
    },
  })

  const uniqueCities = new Set(
    allSchools.docs
      .map((school) => school.city)
      .filter((city): city is string => Boolean(city))
  )
  const totalCities = uniqueCities.size

  // Durchschnittliche Bewertung berechnen
  const allApprovedReviews = await payload.find({
    collection: 'reviews',
    where: { approved: { equals: true } },
    limit: 10000,
    select: {
      rating: true,
    },
  })

  const averageRating =
    allApprovedReviews.docs.length > 0
      ? allApprovedReviews.docs.reduce((sum, review) => sum + (review.rating || 0), 0) /
        allApprovedReviews.docs.length
      : 0

  const satisfactionRate = Math.round((averageRating / 5) * 100)

  // Beliebte Städte berechnen
  const reviewsWithSchools = await payload.find({
    collection: 'reviews',
    where: { approved: { equals: true } },
    limit: 10000,
    depth: 1,
    select: {
      drivingSchool: true,
    },
  })

  const cityReviewCounts = new Map<string, number>()
  const citySchoolCounts = new Map<string, number>()

  reviewsWithSchools.docs.forEach((review) => {
    const school = review.drivingSchool
    if (school && typeof school === 'object' && school.city) {
      const currentReviews = cityReviewCounts.get(school.city) || 0
      cityReviewCounts.set(school.city, currentReviews + 1)
    }
  })

  allSchools.docs.forEach((school) => {
    if (school.city) {
      const currentCount = citySchoolCounts.get(school.city) || 0
      citySchoolCounts.set(school.city, currentCount + 1)
    }
  })

  const allCitiesSet = new Set([
    ...Array.from(cityReviewCounts.keys()),
    ...Array.from(citySchoolCounts.keys()),
  ])

  const popularCities = Array.from(allCitiesSet)
    .map((city) => ({
      city,
      reviewCount: cityReviewCounts.get(city) || 0,
      schoolCount: citySchoolCounts.get(city) || 0,
      score: (cityReviewCounts.get(city) || 0) * 10 + (citySchoolCounts.get(city) || 0),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount
      return b.schoolCount - a.schoolCount
    })
    .slice(0, 12)
    .map((item) => ({
      city: item.city,
      count: item.schoolCount,
    }))

  return (
    <main className="min-h-screen overflow-hidden">
      {/* ============================================
          HERO SECTION - IMMERSIVE & STUNNING
          ============================================ */}
      <section className="relative min-h-screen flex items-center justify-center bg-slate-950">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="hero-gradient-orb w-[800px] h-[800px] -top-1/4 -left-1/4 bg-violet-600/30"
            style={{ animationDelay: '0s' }}
          />
          <div 
            className="hero-gradient-orb w-[600px] h-[600px] top-1/4 right-0 bg-fuchsia-600/20"
            style={{ animationDelay: '-2s' }}
          />
          <div 
            className="hero-gradient-orb w-[500px] h-[500px] bottom-0 left-1/3 bg-cyan-500/15"
            style={{ animationDelay: '-4s' }}
          />
        </div>
        
        {/* Grid Pattern - Sehr subtil */}
        <div className="absolute inset-0 hero-grid opacity-20" />
        
        {/* Noise Texture */}
        <div className="noise-overlay" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto text-center relative z-20">
            {/* Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-dark text-white/90 text-sm mb-8 relative z-20">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse-glow" />
              <span className="font-medium">Die #1 Fahrschul-Suchplattform in Deutschland</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            
            {/* Headline */}
            <h1 className="animate-fade-in-up-delay-1 text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-[0.9] relative z-20">
              Finde deine
              <span className="block mt-2 gradient-text-animated relative z-20">
                perfekte Fahrschule
              </span>
            </h1>
            
            <p className="animate-fade-in-up-delay-2 text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
              Vergleiche über <span className="text-white font-semibold">{totalSchools.totalDocs.toLocaleString('de-DE')}+</span> Fahrschulen, 
              lies echte Bewertungen und finde die beste Fahrschule in deiner Nähe.
            </p>
            
            {/* Search Box */}
            <div className="animate-fade-in-up-delay-3 max-w-3xl mx-auto mb-8">
              <form action="/fahrschulen" method="GET">
                <div className="search-box">
                  <div className="flex flex-col md:flex-row gap-3 p-2">
                    {/* Location Input */}
                    <div className="flex-1 relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-violet-400 transition-colors" />
                      <input
                        type="text"
                        name="city"
                        placeholder="Stadt oder PLZ eingeben..."
                        className="search-input w-full pl-12 pr-4 py-4 focus:outline-none"
                      />
                    </div>
                    
                    {/* License Class Select */}
                    <div className="md:w-52">
                      <select
                        name="class"
                        className="search-input w-full px-4 py-4 appearance-none cursor-pointer focus:outline-none"
                      >
                        <option value="" className="text-slate-900">Führerscheinklasse</option>
                        <option value="B" className="text-slate-900">B - PKW</option>
                        <option value="A" className="text-slate-900">A - Motorrad</option>
                        <option value="A1" className="text-slate-900">A1 - Leichtkraftrad</option>
                        <option value="A2" className="text-slate-900">A2 - Motorrad</option>
                        <option value="AM" className="text-slate-900">AM - Moped</option>
                        <option value="BE" className="text-slate-900">BE - Anhänger</option>
                      </select>
                    </div>
                    
                    {/* Search Button */}
                    <button
                      type="submit"
                      className="btn-primary px-8 py-4 text-lg"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      <span>Suchen</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Popular Searches */}
            {popularCities.length > 0 && (
              <div className="animate-fade-in-up-delay-4 flex flex-wrap items-center justify-center gap-3 text-sm">
                <span className="text-white/40">Beliebt:</span>
                {popularCities.slice(0, 5).map((item) => (
                  <Link
                    key={item.city}
                    href={`/fahrschulen?city=${encodeURIComponent(item.city)}`}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-400/50 text-white/70 hover:text-white transition-all duration-300"
                  >
                    {item.city}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-6 md:gap-12">
            {[
              { icon: CheckCircle, text: '100% kostenlos', color: 'text-green-400' },
              { icon: Shield, text: 'Verifizierte Fahrschulen', color: 'text-violet-400' },
              { icon: Star, text: `${totalReviews.totalDocs.toLocaleString('de-DE')}+ Bewertungen`, color: 'text-yellow-400' },
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-7 h-12 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* ============================================
          STATS SECTION - ANIMATED COUNTERS
          ============================================ */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-100/50 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-100/50 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: totalSchools.totalDocs, label: 'Fahrschulen', suffix: '+', icon: Car },
              { value: totalReviews.totalDocs, label: 'Bewertungen', suffix: '+', icon: Star },
              { value: totalCities || 0, label: 'Städte', suffix: '+', icon: MapPin },
              { value: satisfactionRate || 0, label: 'Zufriedenheit', suffix: '%', icon: TrendingUp },
            ].map((stat, index) => (
              <div key={index} className="stat-card text-center group">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <stat.icon className="w-7 h-7 text-violet-600" />
                </div>
                <div className="text-4xl md:text-5xl font-bold stat-number mb-2">
                  {stat.value > 0 ? stat.value.toLocaleString('de-DE') : '–'}{stat.value > 0 ? stat.suffix : ''}
                </div>
                <div className="text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS - PREMIUM CARDS
          ============================================ */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Einfach & Schnell
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              So einfach findest du
              <span className="gradient-text"> deine Fahrschule</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              In nur wenigen Schritten zur perfekten Fahrschule – kostenlos und unverbindlich
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Suchen',
                description: 'Gib deine Stadt oder PLZ ein und finde Fahrschulen in deiner Nähe. Filtere nach Führerscheinklasse, Preis und Bewertungen.',
                color: 'from-violet-500 to-violet-600',
                bgColor: 'bg-violet-100',
                iconColor: 'text-violet-600',
              },
              {
                step: '02',
                icon: Star,
                title: 'Vergleichen',
                description: 'Lies echte Bewertungen von Fahrschülern, vergleiche Preise und finde die Fahrschule, die zu dir passt.',
                color: 'from-fuchsia-500 to-fuchsia-600',
                bgColor: 'bg-fuchsia-100',
                iconColor: 'text-fuchsia-600',
              },
              {
                step: '03',
                icon: Car,
                title: 'Kontaktieren',
                description: 'Kontaktiere deine Wunsch-Fahrschule direkt und vereinbare einen Termin für deine erste Fahrstunde.',
                color: 'from-cyan-500 to-cyan-600',
                bgColor: 'bg-cyan-100',
                iconColor: 'text-cyan-600',
              },
            ].map((item, index) => (
              <div key={index} className="feature-card relative">
                {/* Step Number */}
                <div className={`absolute -top-5 -left-5 w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-xl`}>
                  {item.step}
                </div>
                
                <div className="relative pt-4">
                  <div className={`feature-icon ${item.bgColor}`}>
                    <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FEATURED SCHOOLS
          ============================================ */}
      {featuredSchools.docs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
                  <Award className="w-4 h-4" />
                  Top bewertet
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                  Die besten Fahrschulen
                </h2>
                <p className="text-xl text-slate-600">
                  Entdecke die bestbewerteten Fahrschulen in Deutschland
                </p>
              </div>
              <Link
                href="/fahrschulen"
                className="group inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold mt-6 md:mt-0"
              >
                Alle Fahrschulen anzeigen
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredSchools.docs.map((school, index) => (
                <Link 
                  key={school.id} 
                  href={`/fahrschulen/${school.slug}`}
                  className="group card-hover rounded-3xl bg-white border border-slate-100 overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Image */}
                  <div className="relative h-52 bg-gradient-to-br from-violet-50 to-fuchsia-50 overflow-hidden">
                    {school.logo && typeof school.logo === 'object' && school.logo.url && (
                      <Image
                        src={school.logo.url}
                        alt={school.name}
                        fill
                        className="object-contain p-8 group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    {school.verified && (
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg">
                        <Shield className="w-3.5 h-3.5" />
                        Verifiziert
                      </div>
                    )}
                    {school.featured && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        ⭐ Empfohlen
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                      {school.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{school.city}{school.state ? `, ${school.state}` : ''}</span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= (school.rating || 0)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-slate-900">
                        {school.rating?.toFixed(1) || '–'}
                      </span>
                      <span className="text-slate-400">
                        ({school.reviewCount || 0})
                      </span>
                    </div>
                    
                    {/* License Classes */}
                    <div className="flex flex-wrap gap-2">
                      {school.licenseClasses?.slice(0, 4).map((cls: string) => (
                        <span
                          key={cls}
                          className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
                        >
                          {cls}
                        </span>
                      ))}
                      {(school.licenseClasses?.length || 0) > 4 && (
                        <span className="px-3 py-1 bg-violet-100 text-violet-600 text-xs font-medium rounded-lg">
                          +{(school.licenseClasses?.length || 0) - 4} mehr
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          POPULAR CITIES - INTERACTIVE GRID
          ============================================ */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Fahrschulen in deiner Stadt
            </h2>
            <p className="text-xl text-slate-600">
              Entdecke Fahrschulen in den beliebtesten Städten Deutschlands
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularCities.length > 0 ? (
              popularCities.map((item, index) => (
                <Link
                  key={item.city}
                  href={`/fahrschulen?city=${encodeURIComponent(item.city)}`}
                  className="city-card group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="relative z-10">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-5 h-5 text-violet-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {item.city}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {item.count} {item.count === 1 ? 'Fahrschule' : 'Fahrschulen'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 glass-violet rounded-3xl">
                <MapPin className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  Noch keine Fahrschulen vorhanden. Füge die ersten Fahrschulen im Admin-Bereich hinzu!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIALS - ELEGANT CARDS
          ============================================ */}
      {recentReviews.docs.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-6">
                <Star className="w-4 h-4 fill-green-600" />
                Echte Bewertungen
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Das sagen unsere Nutzer
              </h2>
              <p className="text-xl text-slate-600">
                Authentische Erfahrungsberichte von echten Fahrschülern
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {recentReviews.docs.map((review, index) => (
                <div
                  key={review.id}
                  className="testimonial-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-6 line-clamp-4 leading-relaxed">{review.text}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {review.authorName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{review.authorName}</div>
                        <div className="text-sm text-slate-500">
                          {typeof review.drivingSchool === 'object' ? review.drivingSchool.name : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          WHY CHOOSE US - GRADIENT SECTION
          ============================================ */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700" />
        <div className="absolute inset-0 z-0 hero-grid opacity-5" />
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 z-0 w-64 h-64 bg-white/10 rounded-full blur-3xl float" />
        <div className="absolute bottom-20 right-20 z-0 w-80 h-80 bg-fuchsia-400/20 rounded-full blur-3xl float-delayed" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Warum FahrschulFinder?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Wir helfen dir, die beste Entscheidung für deine Fahrausbildung zu treffen
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Verifizierte Fahrschulen', desc: 'Alle Fahrschulen werden von uns überprüft und verifiziert' },
              { icon: Star, title: 'Echte Bewertungen', desc: 'Lies authentische Erfahrungsberichte von echten Fahrschülern' },
              { icon: Users, title: '100% Kostenlos', desc: 'Unsere Plattform ist für Fahrschüler komplett kostenlos' },
              { icon: Clock, title: 'Schnelle Suche', desc: 'Finde in wenigen Sekunden die passende Fahrschule' },
            ].map((item, index) => (
              <div 
                key={index} 
                className="text-center group"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          FAQ SECTION
          ============================================ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Häufig gestellte Fragen
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: 'Ist die Nutzung von FahrschulFinder kostenlos?',
                a: 'Ja, die Nutzung unserer Plattform ist für Fahrschüler komplett kostenlos. Du kannst unbegrenzt Fahrschulen suchen, vergleichen und Bewertungen lesen.',
              },
              {
                q: 'Wie werden die Fahrschulen verifiziert?',
                a: 'Wir überprüfen alle Fahrschulen auf Vollständigkeit der Angaben und verifizieren die Kontaktdaten. Verifizierte Fahrschulen erhalten ein entsprechendes Siegel.',
              },
              {
                q: 'Kann ich selbst eine Bewertung schreiben?',
                a: 'Ja! Wenn du bereits eine Fahrschule besucht hast, kannst du deine Erfahrungen teilen und anderen Fahrschülern bei der Entscheidung helfen.',
              },
              {
                q: 'Wie finde ich die beste Fahrschule in meiner Nähe?',
                a: 'Gib einfach deine Stadt oder PLZ in die Suche ein. Du kannst die Ergebnisse nach Bewertungen, Preis und Führerscheinklassen filtern.',
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="faq-item group"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-lg text-slate-900 pr-6">{faq.q}</span>
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center group-open:rotate-180 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION - FINAL PUSH
          ============================================ */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute inset-0 z-0 hero-grid opacity-10" />
        <div className="absolute top-0 left-1/2 z-0 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-violet-100/50 to-transparent rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Bereit für deinen
              <span className="gradient-text"> Führerschein?</span>
            </h2>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Finde jetzt die perfekte Fahrschule in deiner Nähe und starte deine Fahrausbildung!
            </p>
            <Link
              href="/fahrschulen"
              className="btn-primary inline-flex items-center gap-3 px-10 py-5 text-lg"
            >
              <Search className="w-6 h-6" />
              Fahrschulen finden
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export const metadata: Metadata = {
  title: 'FahrschulFinder - Finde die beste Fahrschule in deiner Nähe',
  description: 'Vergleiche Fahrschulen, lies echte Bewertungen und finde die perfekte Fahrschule für deinen Führerschein. Über 3.000 Fahrschulen in ganz Deutschland.',
  keywords: 'Fahrschule, Führerschein, Fahrschule finden, Fahrschule vergleichen, Fahrschule Bewertungen, Fahrschule in der Nähe',
  openGraph: {
    title: 'FahrschulFinder - Finde die beste Fahrschule in deiner Nähe',
    description: 'Vergleiche Fahrschulen, lies echte Bewertungen und finde die perfekte Fahrschule für deinen Führerschein.',
    type: 'website',
  },
}
