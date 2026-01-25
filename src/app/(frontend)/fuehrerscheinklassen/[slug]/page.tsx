import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { 
  Car, 
  Bike,
  ChevronRight,
  Clock,
  FileCheck,
  Sparkles,
  CheckCircle,
  Users,
  Target,
  BookOpen,
  Shield,
  AlertCircle,
  GraduationCap,
  MapPin,
  Star,
  Search
} from 'lucide-react'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Detaillierte Daten für alle Führerscheinklassen
const licenseClassData: Record<string, {
  name: string
  fullName: string
  title: string
  description: string
  longDescription: string
  icon: React.ElementType
  color: string
  minAge: number
  minAgeNote?: string
  vehicles: string[]
  includedClasses: string[]
  requirements: {
    title: string
    description: string
    icon: React.ElementType
  }[]
  theoryLessons: number
  practicalLessons: {
    name: string
    count: number
    duration: string
  }[]
  exams: {
    theory: string
    practical: string
  }
  duration: string
  costRange: string
  costBreakdown: {
    item: string
    cost: string
  }[]
  tips: string[]
  faq: {
    q: string
    a: string
  }[]
}> = {
  'b': {
    name: 'B',
    fullName: 'Führerscheinklasse B',
    title: 'PKW-Führerschein',
    description: 'Der Standard für alle, die Auto fahren wollen',
    longDescription: 'Der Führerschein der Klasse B ist der am häufigsten erworbene Führerschein in Deutschland. Er berechtigt zum Führen von Kraftfahrzeugen bis 3.500 kg zulässiger Gesamtmasse. Mit einem kleinen Anhänger (bis 750 kg) oder einem größeren Anhänger, wenn das Gesamtgewicht von Fahrzeug und Anhänger 3.500 kg nicht übersteigt.',
    icon: Car,
    color: 'from-violet-500 to-fuchsia-500',
    minAge: 18,
    minAgeNote: 'Ab 17 Jahren als BF17 (Begleitetes Fahren) möglich',
    vehicles: [
      'PKW bis 3.500 kg zulässige Gesamtmasse',
      'Anhänger bis 750 kg',
      'Anhänger über 750 kg, wenn Kombination max. 3.500 kg',
      'Dreirädrige Kraftfahrzeuge (nur in Deutschland)',
    ],
    includedClasses: ['AM', 'L'],
    requirements: [
      {
        title: 'Mindestalter',
        description: '18 Jahre (17 mit BF17)',
        icon: Users,
      },
      {
        title: 'Sehtest',
        description: 'Amtlich anerkannter Sehtest',
        icon: Target,
      },
      {
        title: 'Erste-Hilfe-Kurs',
        description: '9 Unterrichtseinheiten à 45 Min',
        icon: Shield,
      },
      {
        title: 'Passbild',
        description: 'Biometrisches Passbild',
        icon: FileCheck,
      },
    ],
    theoryLessons: 12,
    practicalLessons: [
      { name: 'Übungsfahrten', count: 0, duration: 'Individuell (ca. 20-30)' },
      { name: 'Überlandfahrten', count: 5, duration: '45 Min' },
      { name: 'Autobahnfahrten', count: 4, duration: '45 Min' },
      { name: 'Nachtfahrten', count: 3, duration: '45 Min' },
    ],
    exams: {
      theory: '30 Fragen, max. 10 Fehlerpunkte',
      practical: 'ca. 45 Minuten Fahrprüfung',
    },
    duration: '3-6 Monate',
    costRange: '2.500-4.000 €',
    costBreakdown: [
      { item: 'Grundgebühr Fahrschule', cost: '300-500 €' },
      { item: 'Lehrmaterial', cost: '50-100 €' },
      { item: 'Übungsfahrten (ca. 25×45 Min)', cost: '1.200-2.000 €' },
      { item: 'Sonderfahrten (12×45 Min)', cost: '500-800 €' },
      { item: 'Theorieprüfung TÜV', cost: 'ca. 25 €' },
      { item: 'Praktische Prüfung TÜV', cost: 'ca. 130 €' },
      { item: 'Sehtest', cost: 'ca. 10 €' },
      { item: 'Erste-Hilfe-Kurs', cost: '30-50 €' },
      { item: 'Passbilder', cost: 'ca. 15 €' },
      { item: 'Führerscheinantrag', cost: 'ca. 40 €' },
    ],
    tips: [
      'Beginne frühzeitig mit dem Lernen der Theorie',
      'Nutze Fahrschul-Apps zum Üben der Prüfungsfragen',
      'Plane genug Zeit für die Fahrausbildung ein',
      'Frage nach Intensivkursen, wenn du schnell fertig werden willst',
      'Vergleiche mehrere Fahrschulen vor der Anmeldung',
    ],
    faq: [
      {
        q: 'Wie lange ist der Führerschein gültig?',
        a: 'Der Führerschein ist 15 Jahre gültig und muss dann erneuert werden (nur das Dokument, keine neue Prüfung).',
      },
      {
        q: 'Kann ich mit dem B-Führerschein auch Motorrad fahren?',
        a: 'Nein, für Motorräder benötigst du die Klasse A, A2 oder A1. Mit B196 kannst du jedoch 125er fahren.',
      },
      {
        q: 'Wie viele Fahrstunden brauche ich?',
        a: 'Das ist individuell unterschiedlich. Im Durchschnitt benötigen Fahrschüler 25-35 Übungsstunden plus 12 Sonderfahrten.',
      },
    ],
  },
  'a': {
    name: 'A',
    fullName: 'Führerscheinklasse A',
    title: 'Motorrad-Führerschein (unbegrenzt)',
    description: 'Unbegrenzter Zugang zu allen Krafträdern',
    longDescription: 'Der Führerschein der Klasse A berechtigt zum Führen aller Krafträder ohne Leistungsbeschränkung. Er ist der "große" Motorradführerschein und ermöglicht das Fahren auch schwerer Maschinen.',
    icon: Bike,
    color: 'from-cyan-500 to-blue-500',
    minAge: 24,
    minAgeNote: 'Ab 20 Jahren bei 2 Jahren Vorbesitz der Klasse A2 (Aufstieg)',
    vehicles: [
      'Alle Motorräder ohne Leistungsbeschränkung',
      'Alle Krafträder mit Beiwagen',
      'Dreirädrige Kraftfahrzeuge über 15 kW',
    ],
    includedClasses: ['A2', 'A1', 'AM'],
    requirements: [
      {
        title: 'Mindestalter',
        description: '24 Jahre (20 bei Aufstieg von A2)',
        icon: Users,
      },
      {
        title: 'Sehtest',
        description: 'Amtlich anerkannter Sehtest',
        icon: Target,
      },
      {
        title: 'Erste-Hilfe-Kurs',
        description: '9 Unterrichtseinheiten à 45 Min',
        icon: Shield,
      },
      {
        title: 'Passbild',
        description: 'Biometrisches Passbild',
        icon: FileCheck,
      },
    ],
    theoryLessons: 12,
    practicalLessons: [
      { name: 'Übungsfahrten', count: 0, duration: 'Individuell (ca. 15-25)' },
      { name: 'Überlandfahrten', count: 5, duration: '45 Min' },
      { name: 'Autobahnfahrten', count: 4, duration: '45 Min' },
      { name: 'Nachtfahrten', count: 3, duration: '45 Min' },
    ],
    exams: {
      theory: '30 Fragen, max. 10 Fehlerpunkte',
      practical: 'ca. 60 Minuten Fahrprüfung inkl. Grundfahraufgaben',
    },
    duration: '3-6 Monate',
    costRange: '1.800-3.500 €',
    costBreakdown: [
      { item: 'Grundgebühr Fahrschule', cost: '250-400 €' },
      { item: 'Lehrmaterial', cost: '50-100 €' },
      { item: 'Übungsfahrten (ca. 20×45 Min)', cost: '800-1.500 €' },
      { item: 'Sonderfahrten (12×45 Min)', cost: '500-900 €' },
      { item: 'Theorieprüfung TÜV', cost: 'ca. 25 €' },
      { item: 'Praktische Prüfung TÜV', cost: 'ca. 130 €' },
    ],
    tips: [
      'Investiere in gute Schutzausrüstung',
      'Übe die Grundfahraufgaben intensiv',
      'Fahre bei verschiedenen Wetterbedingungen',
      'Der Stufenführerschein (A1→A2→A) kann günstiger sein',
    ],
    faq: [
      {
        q: 'Lohnt sich der Stufenführerschein?',
        a: 'Der Stufenführerschein kann sich lohnen, wenn du früh anfangen willst. Ab 16 Jahren kannst du mit A1 beginnen.',
      },
      {
        q: 'Brauche ich eigene Schutzkleidung?',
        a: 'Für die Prüfung benötigst du mindestens Helm, Handschuhe, festes Schuhwerk und geeignete Kleidung.',
      },
    ],
  },
  'a2': {
    name: 'A2',
    fullName: 'Führerscheinklasse A2',
    title: 'Mittelschwere Motorräder',
    description: 'Motorräder bis 35 kW',
    longDescription: 'Der Führerschein der Klasse A2 berechtigt zum Führen von Motorrädern bis 35 kW (48 PS). Nach 2 Jahren Besitz ist ein vereinfachter Aufstieg zur Klasse A möglich.',
    icon: Bike,
    color: 'from-cyan-500 to-blue-500',
    minAge: 18,
    vehicles: [
      'Motorräder bis 35 kW (48 PS)',
      'Leistung/Gewicht-Verhältnis max. 0,2 kW/kg',
      'Darf nicht von mehr als 70 kW abgeleitet sein',
    ],
    includedClasses: ['A1', 'AM'],
    requirements: [
      {
        title: 'Mindestalter',
        description: '18 Jahre',
        icon: Users,
      },
      {
        title: 'Sehtest',
        description: 'Amtlich anerkannter Sehtest',
        icon: Target,
      },
      {
        title: 'Erste-Hilfe-Kurs',
        description: '9 Unterrichtseinheiten à 45 Min',
        icon: Shield,
      },
    ],
    theoryLessons: 12,
    practicalLessons: [
      { name: 'Übungsfahrten', count: 0, duration: 'Individuell' },
      { name: 'Überlandfahrten', count: 5, duration: '45 Min' },
      { name: 'Autobahnfahrten', count: 4, duration: '45 Min' },
      { name: 'Nachtfahrten', count: 3, duration: '45 Min' },
    ],
    exams: {
      theory: '30 Fragen, max. 10 Fehlerpunkte',
      practical: 'ca. 60 Minuten Fahrprüfung',
    },
    duration: '3-6 Monate',
    costRange: '1.500-2.800 €',
    costBreakdown: [
      { item: 'Grundgebühr', cost: '200-350 €' },
      { item: 'Übungsfahrten', cost: '700-1.200 €' },
      { item: 'Sonderfahrten', cost: '400-700 €' },
      { item: 'Prüfungsgebühren', cost: 'ca. 155 €' },
    ],
    tips: [
      'Nach 2 Jahren kannst du einfach auf A aufsteigen',
      'Die praktische Aufstiegsprüfung dauert nur 40 Minuten',
      'Viele beliebte Motorräder sind als A2-Version verfügbar',
    ],
    faq: [
      {
        q: 'Wie funktioniert der Aufstieg auf Klasse A?',
        a: 'Nach 2 Jahren A2-Besitz: Nur praktische Prüfung (40 Min) ohne Pflichtstunden. Vor Ablauf der 2 Jahre: Volle Ausbildung nötig.',
      },
    ],
  },
  // Weitere Klassen können hier ergänzt werden...
}

// Fallback für nicht definierte Klassen
const getClassData = (slug: string) => {
  return licenseClassData[slug] || null
}

export default async function FuehrerscheinklassePage({ params }: PageProps) {
  const { slug } = await params
  const classData = getClassData(slug)
  
  if (!classData) {
    notFound()
  }
  
  const payload = await getPayload({ config: configPromise })
  
  // Fahrschulen die diese Klasse anbieten
  const schools = await payload.find({
    collection: 'driving-schools',
    where: {
      _status: { equals: 'published' },
      licenseClasses: { contains: classData.name },
    },
    limit: 6,
    sort: '-rating',
  })

  const Icon = classData.icon

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-violet-600">Start</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/fuehrerscheinklassen" className="hover:text-violet-600">Führerscheinklassen</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">Klasse {classData.name}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${classData.color} flex items-center justify-center shadow-2xl`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
            <div className="text-center lg:text-left flex-1">
              <span className={`inline-block px-4 py-1 rounded-full bg-gradient-to-br ${classData.color} text-white text-sm font-bold mb-4`}>
                Klasse {classData.name}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {classData.title}
              </h1>
              <p className="text-xl text-white/70 max-w-2xl">
                {classData.description}
              </p>
            </div>
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">{classData.costRange}</div>
              <div className="text-slate-600">Durchschnittliche Kosten</div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-violet-500" />
              <div className="text-2xl font-bold text-slate-900">Ab {classData.minAge}</div>
              <div className="text-sm text-slate-600">Jahre</div>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-fuchsia-500" />
              <div className="text-2xl font-bold text-slate-900">{classData.duration}</div>
              <div className="text-sm text-slate-600">Ausbildungsdauer</div>
            </div>
            <div className="text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-cyan-500" />
              <div className="text-2xl font-bold text-slate-900">{classData.theoryLessons}</div>
              <div className="text-sm text-slate-600">Theoriestunden</div>
            </div>
            <div className="text-center">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-slate-900">2</div>
              <div className="text-sm text-slate-600">Prüfungen</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Über die Klasse {classData.name}</h2>
                <p className="text-slate-600 leading-relaxed">{classData.longDescription}</p>
              </div>

              {/* Vehicles */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Diese Fahrzeuge darfst du fahren</h2>
                <ul className="space-y-3">
                  {classData.vehicles.map((vehicle, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{vehicle}</span>
                    </li>
                  ))}
                </ul>
                {classData.includedClasses.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-slate-900 mb-3">Eingeschlossene Klassen</h3>
                    <div className="flex flex-wrap gap-2">
                      {classData.includedClasses.map((cls) => (
                        <Link
                          key={cls}
                          href={`/fuehrerscheinklassen/${cls.toLowerCase()}`}
                          className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-200 transition-colors"
                        >
                          Klasse {cls}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Voraussetzungen</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {classData.requirements.map((req, idx) => {
                    const ReqIcon = req.icon
                    return (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                          <ReqIcon className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{req.title}</h3>
                          <p className="text-sm text-slate-600">{req.description}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {classData.minAgeNote && (
                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{classData.minAgeNote}</p>
                  </div>
                )}
              </div>

              {/* Practical Lessons */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Praktische Ausbildung</h2>
                <div className="space-y-3">
                  {classData.practicalLessons.map((lesson, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <span className="font-medium text-slate-900">{lesson.name}</span>
                      <span className="text-slate-600">
                        {lesson.count > 0 ? `${lesson.count} × ${lesson.duration}` : lesson.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costs */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Kostenübersicht</h2>
                <div className="space-y-3">
                  {classData.costBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0">
                      <span className="text-slate-600">{item.item}</span>
                      <span className="font-medium text-slate-900">{item.cost}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-violet-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Geschätzte Gesamtkosten</span>
                    <span className="text-2xl font-bold text-violet-600">{classData.costRange}</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Tipps für die Ausbildung
                </h2>
                <ul className="space-y-3">
                  {classData.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQ */}
              {classData.faq.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Häufige Fragen</h2>
                  <div className="space-y-4">
                    {classData.faq.map((item, idx) => (
                      <details key={idx} className="group">
                        <summary className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer list-none">
                          <span className="font-semibold text-slate-900">{item.q}</span>
                          <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="p-4 text-slate-600">
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* CTA */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-4">Jetzt Fahrschule finden</h3>
                  <p className="text-slate-600 text-sm mb-4">
                    Finde Fahrschulen in deiner Nähe, die den Führerschein Klasse {classData.name} anbieten.
                  </p>
                  <Link
                    href={`/fahrschulen?class=${classData.name}`}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                  >
                    <Search className="w-5 h-5" />
                    Fahrschulen suchen
                  </Link>
                </div>

                {/* Schools */}
                {schools.docs.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Empfohlene Fahrschulen</h3>
                    <div className="space-y-4">
                      {schools.docs.slice(0, 3).map((school) => (
                        <Link
                          key={school.id}
                          href={`/fahrschulen/${school.slug}`}
                          className="block p-3 rounded-xl bg-slate-50 hover:bg-violet-50 transition-colors group"
                        >
                          <h4 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                            {school.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {school.city}
                            </span>
                            {school.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                {school.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/fahrschulen?class=${classData.name}`}
                      className="block text-center text-violet-600 hover:text-violet-700 font-medium text-sm mt-4"
                    >
                      Alle Fahrschulen anzeigen →
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const classData = getClassData(slug)
  
  if (!classData) {
    return { title: 'Führerscheinklasse nicht gefunden' }
  }
  
  return {
    title: `Führerschein Klasse ${classData.name} - ${classData.title} | FahrschulFinder`,
    description: `Alles über den Führerschein Klasse ${classData.name}: Voraussetzungen, Kosten (${classData.costRange}), Ausbildung und Prüfung. Finde jetzt passende Fahrschulen!`,
  }
}
