import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <main className="bg-background min-h-[80vh] flex items-center">
      <div className="container py-8 md:py-12 lg:py-16">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Seite nicht <span className="text-secondary">gefunden</span>
          </h1>
        </div>

        {/* Content Container */}
        <div className="bg-muted/30 rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="p-6 md:p-10 lg:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* 404 Illustration */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <span className="text-[120px] md:text-[180px] lg:text-[220px] font-bold text-primary/10 leading-none select-none">
                    404
                  </span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                  Ups, hier geht&apos;s nicht weiter!
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Keine Sorge – auch die besten Fahrer verfahren sich mal. Hier sind ein paar
                  Möglichkeiten, wie du wieder auf die Strecke kommst:
                </p>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Zur Startseite
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold bg-background border border-border text-foreground hover:bg-muted transition-all duration-300"
                  >
                    Kontakt
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
