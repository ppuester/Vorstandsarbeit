import type { Metadata } from 'next'

export const dynamic = 'force-static'
export const revalidate = false

export const metadata: Metadata = {
  title: 'Kontakt | MSC Lennetal',
  description: 'Kontaktieren Sie den MSC Lennetal - Bamenohl/Attendorn e.V.',
}

export default function ContactPage() {
  return (
    <main className="bg-background min-h-[80vh]">
      <div className="container py-8 md:py-12 lg:py-16">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mb-4">
            Kontakt
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Du hast Fragen, möchtest Mitglied werden oder als Sponsor unterstützen? 
            Wir freuen uns auf deine Nachricht!
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-muted/30 rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="p-6 md:p-10 lg:p-12">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Kontaktinformationen */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                  So erreichst du uns
                </h2>
                
                <div className="space-y-6">
                  {/* Adresse */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Adresse</h3>
                      <p className="text-muted-foreground">
                        MSC Lennetal - Bamenohl/Attendorn e.V.<br />
                        Kartbahn Bamenohl<br />
                        57439 Attendorn
                      </p>
                    </div>
                  </div>

                  {/* E-Mail */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">E-Mail</h3>
                      <a 
                        href="mailto:info@msc-lennetal.de" 
                        className="text-primary hover:underline"
                      >
                        info@msc-lennetal.de
                      </a>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Social Media</h3>
                      <div className="flex gap-3">
                        <a 
                          href="https://www.facebook.com/msclennetal" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Facebook
                        </a>
                        <a 
                          href="https://www.instagram.com/msc_lennetal" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Instagram
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schnellaktionen */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                  Was möchtest du tun?
                </h2>
                
                <div className="space-y-4">
                  {/* Mitglied werden */}
                  <div className="group bg-background rounded-xl md:rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Mitglied werden
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Werde Teil unserer Motorsport-Familie und erlebe den Kartsport hautnah.
                    </p>
                    <a 
                      href="mailto:info@msc-lennetal.de?subject=Mitgliedschaft%20anfragen"
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      Anfrage senden
                      <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>

                  {/* Sponsor werden */}
                  <div className="group bg-background rounded-xl md:rounded-2xl p-5 border border-border hover:border-secondary/30 hover:shadow-lg transition-all duration-300">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-secondary transition-colors">
                      Sponsor werden
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Unterstütze den Motorsport in der Region und profitiere von Sichtbarkeit.
                    </p>
                    <a 
                      href="mailto:info@msc-lennetal.de?subject=Sponsoring%20anfragen"
                      className="inline-flex items-center text-sm font-medium text-secondary hover:underline"
                    >
                      Anfrage senden
                      <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>

                  {/* Allgemeine Anfrage */}
                  <div className="group bg-background rounded-xl md:rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Allgemeine Anfrage
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Hast du andere Fragen? Wir helfen dir gerne weiter.
                    </p>
                    <a 
                      href="mailto:info@msc-lennetal.de"
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      E-Mail schreiben
                      <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
