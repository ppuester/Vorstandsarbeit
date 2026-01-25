import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Car, 
  Bike, 
  Truck, 
  Bus, 
  Tractor,
  Clock,
  Euro,
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Führerscheinklassen Übersicht | Alle Klassen erklärt | FahrschulFinder',
  description: 'Alle Führerscheinklassen im Überblick: B, A, A1, A2, AM, BE, C, CE, D, T und mehr. Finde heraus, welcher Führerschein zu dir passt.',
}

const licenseClasses = [
  {
    category: 'PKW',
    icon: Car,
    color: 'from-violet-500 to-fuchsia-500',
    classes: [
      {
        slug: 'b',
        name: 'Klasse B',
        title: 'PKW-Führerschein',
        description: 'Der Standard für alle, die Auto fahren wollen',
        minAge: 18,
        vehicles: 'PKW bis 3,5t, kleine Anhänger',
        duration: '3-6 Monate',
        cost: '2.500-4.000 €',
        popular: true,
      },
      {
        slug: 'b197',
        name: 'Klasse B197',
        title: 'Automatik & Schalter',
        description: 'Lerne auf Automatik, fahre auch Schalter',
        minAge: 18,
        vehicles: 'PKW mit Automatik und Schalter',
        duration: '3-6 Monate',
        cost: '2.600-4.200 €',
        popular: true,
      },
      {
        slug: 'bf17',
        name: 'BF17',
        title: 'Begleitetes Fahren ab 17',
        description: 'Mit Begleitung früher starten',
        minAge: 17,
        vehicles: 'PKW bis 3,5t mit Begleitung',
        duration: '3-6 Monate',
        cost: '2.500-4.000 €',
        popular: true,
      },
      {
        slug: 'be',
        name: 'Klasse BE',
        title: 'PKW mit Anhänger',
        description: 'Für größere Anhänger',
        minAge: 18,
        vehicles: 'PKW + Anhänger über 750 kg',
        duration: '2-4 Wochen',
        cost: '500-1.200 €',
        popular: false,
      },
      {
        slug: 'b96',
        name: 'Klasse B96',
        title: 'Anhänger-Schlüsselzahl',
        description: 'Erweiterung für Anhänger bis 4.250 kg',
        minAge: 18,
        vehicles: 'PKW + Anhänger bis 4.250 kg zGM',
        duration: '1 Tag',
        cost: '300-500 €',
        popular: false,
      },
    ],
  },
  {
    category: 'Motorrad',
    icon: Bike,
    color: 'from-cyan-500 to-blue-500',
    classes: [
      {
        slug: 'a',
        name: 'Klasse A',
        title: 'Alle Motorräder',
        description: 'Unbegrenzter Zugang zu allen Krafträdern',
        minAge: 24,
        vehicles: 'Alle Motorräder, unbegrenzt',
        duration: '3-6 Monate',
        cost: '1.800-3.500 €',
        popular: true,
      },
      {
        slug: 'a2',
        name: 'Klasse A2',
        title: 'Mittelschwere Motorräder',
        description: 'Motorräder bis 35 kW',
        minAge: 18,
        vehicles: 'Motorräder bis 35 kW',
        duration: '3-6 Monate',
        cost: '1.500-2.800 €',
        popular: true,
      },
      {
        slug: 'a1',
        name: 'Klasse A1',
        title: 'Leichtkrafträder',
        description: '125er Motorräder',
        minAge: 16,
        vehicles: 'Motorräder bis 125 ccm, max. 11 kW',
        duration: '3-6 Monate',
        cost: '1.200-2.200 €',
        popular: false,
      },
      {
        slug: 'am',
        name: 'Klasse AM',
        title: 'Moped & Roller',
        description: 'Kleinkrafträder bis 45 km/h',
        minAge: 15,
        vehicles: 'Mopeds, Roller bis 45 km/h',
        duration: '2-4 Wochen',
        cost: '800-1.500 €',
        popular: false,
      },
    ],
  },
  {
    category: 'LKW',
    icon: Truck,
    color: 'from-amber-500 to-orange-500',
    classes: [
      {
        slug: 'c',
        name: 'Klasse C',
        title: 'Schwere LKW',
        description: 'LKW über 7,5 Tonnen',
        minAge: 21,
        vehicles: 'LKW über 7,5t',
        duration: '2-3 Monate',
        cost: '3.000-5.000 €',
        popular: false,
      },
      {
        slug: 'c1',
        name: 'Klasse C1',
        title: 'Leichte LKW',
        description: 'LKW bis 7,5 Tonnen',
        minAge: 18,
        vehicles: 'LKW von 3,5t bis 7,5t',
        duration: '2-3 Monate',
        cost: '2.500-4.000 €',
        popular: false,
      },
      {
        slug: 'ce',
        name: 'Klasse CE',
        title: 'Sattelzüge & Lastzüge',
        description: 'LKW mit schwerem Anhänger',
        minAge: 21,
        vehicles: 'LKW mit Anhänger über 750 kg',
        duration: '2-3 Monate',
        cost: '2.000-4.000 €',
        popular: false,
      },
    ],
  },
  {
    category: 'Bus',
    icon: Bus,
    color: 'from-green-500 to-emerald-500',
    classes: [
      {
        slug: 'd',
        name: 'Klasse D',
        title: 'Große Busse',
        description: 'Busse über 8 Fahrgastplätze',
        minAge: 24,
        vehicles: 'Busse mit über 8 Fahrgastplätzen',
        duration: '3-6 Monate',
        cost: '4.000-7.000 €',
        popular: false,
      },
      {
        slug: 'd1',
        name: 'Klasse D1',
        title: 'Kleinbusse',
        description: 'Busse bis 16 Fahrgastplätze',
        minAge: 21,
        vehicles: 'Kleinbusse bis 16 Plätze',
        duration: '2-4 Monate',
        cost: '3.000-5.000 €',
        popular: false,
      },
    ],
  },
  {
    category: 'Land- und Forstwirtschaft',
    icon: Tractor,
    color: 'from-lime-500 to-green-500',
    classes: [
      {
        slug: 't',
        name: 'Klasse T',
        title: 'Traktoren',
        description: 'Land- und Forstwirtschaft',
        minAge: 16,
        vehicles: 'Traktoren bis 60 km/h',
        duration: '2-4 Wochen',
        cost: '1.000-1.800 €',
        popular: false,
      },
      {
        slug: 'l',
        name: 'Klasse L',
        title: 'Landwirtschaftliche Zugmaschinen',
        description: 'Langsame Zugmaschinen',
        minAge: 16,
        vehicles: 'Zugmaschinen bis 40 km/h',
        duration: '1-2 Wochen',
        cost: '500-1.000 €',
        popular: false,
      },
    ],
  },
]

export default function FuehrerscheinklassenPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white/80 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Alle Klassen im Überblick</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Führerscheinklassen
            <span className="gradient-text-animated"> erklärt</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Finde heraus, welcher Führerschein zu dir passt. Alle Klassen, Voraussetzungen und Kosten auf einen Blick.
          </p>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-8 bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {licenseClasses.map((category) => {
              const Icon = category.icon
              return (
                <a
                  key={category.category}
                  href={`#${category.category.toLowerCase().replace(/\s/g, '-')}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-violet-100 text-slate-700 hover:text-violet-700 transition-colors font-medium"
                >
                  <Icon className="w-4 h-4" />
                  {category.category}
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* License Classes */}
      {licenseClasses.map((category) => {
        const Icon = category.icon
        return (
          <section
            key={category.category}
            id={category.category.toLowerCase().replace(/\s/g, '-')}
            className="py-16 scroll-mt-20"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-4 mb-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">{category.category}</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.classes.map((cls) => (
                  <Link
                    key={cls.slug}
                    href={`/fuehrerscheinklassen/${cls.slug}`}
                    className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-violet-300 transition-all"
                  >
                    {cls.popular && (
                      <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold rounded-full">
                        Beliebt
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-br ${category.color} text-white text-sm font-bold mb-2`}>
                          {cls.name}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                          {cls.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4">{cls.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4 text-violet-500" />
                        <span>Ab {cls.minAge} Jahren</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-fuchsia-500" />
                        <span>{cls.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Euro className="w-4 h-4 text-green-500" />
                        <span>{cls.cost}</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <span className="inline-flex items-center gap-2 text-violet-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        Mehr erfahren
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-violet-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Bereit für deinen Führerschein?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Finde jetzt die perfekte Fahrschule in deiner Nähe und starte deine Fahrausbildung!
          </p>
          <Link
            href="/fahrschulen"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-violet-700 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-xl"
          >
            <Car className="w-5 h-5" />
            Fahrschulen finden
          </Link>
        </div>
      </section>
    </main>
  )
}
