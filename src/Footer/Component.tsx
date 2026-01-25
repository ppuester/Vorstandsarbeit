import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import { Car, MapPin, Mail } from 'lucide-react'
import type { Footer as FooterType } from '@/payload-types'

import { FooterNav } from './FooterNav'

// Social Media Icons als SVG Komponenten
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
      clipRule="evenodd"
    />
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
      clipRule="evenodd"
    />
  </svg>
)

const YouTubeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
      clipRule="evenodd"
    />
  </svg>
)

const TikTokIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
      clipRule="evenodd"
    />
  </svg>
)

// Icon Mapping
const socialIcons: Record<string, React.FC> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  twitter: TwitterIcon,
  linkedin: LinkedInIcon,
}

const platformNames: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitter: 'Twitter / X',
  linkedin: 'LinkedIn',
}

export async function Footer() {
  let footerData: FooterType | null = null
  try {
    footerData = await getCachedGlobal('footer', 1)()
  } catch (error) {
    console.warn('Could not fetch footer data:', error)
  }

  const navItems = footerData?.navItems || []
  const socialLinks = footerData?.socialLinks || []
  const currentYear = new Date().getFullYear()

  const navigationItems = navItems.filter((item) => item.category === 'navigation')
  const legalItems = navItems.filter((item) => item.category === 'legal')

  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-white">FahrschulFinder</span>
                <span className="block text-sm text-white/60">Deine Fahrschule finden</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Die #1 Plattform für die Fahrschulsuche in Deutschland. Vergleiche Preise, lies echte 
              Bewertungen und finde die perfekte Fahrschule in deiner Nähe.
            </p>
            
            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = socialIcons[social.platform || '']
                  if (!Icon || !social.url) return null

                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-white/10 hover:bg-violet-600 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                      aria-label={platformNames[social.platform || ''] || social.platform}
                    >
                      <Icon />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6">Schnelllinks</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/fahrschulen" className="text-white/60 hover:text-white transition-colors">
                  Fahrschulen finden
                </Link>
              </li>
              <li>
                <Link href="/posts" className="text-white/60 hover:text-white transition-colors">
                  Ratgeber & Tipps
                </Link>
              </li>
              <li>
                <Link href="/fahrschulen?class=B" className="text-white/60 hover:text-white transition-colors">
                  PKW Führerschein
                </Link>
              </li>
              <li>
                <Link href="/fahrschulen?class=A" className="text-white/60 hover:text-white transition-colors">
                  Motorrad Führerschein
                </Link>
              </li>
              <li>
                <Link href="/fahrschulen?features=intensive" className="text-white/60 hover:text-white transition-colors">
                  Intensivkurse
                </Link>
              </li>
              {navigationItems.length > 0 && <FooterNav items={navigationItems} showCookieButton />}
            </ul>
          </div>

          {/* Beliebte Städte */}
          <div>
            <h3 className="text-white font-semibold mb-6">Beliebte Städte</h3>
            <ul className="space-y-3">
              {['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Stuttgart'].map((city) => (
                <li key={city}>
                  <Link 
                    href={`/fahrschulen?city=${city}`} 
                    className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Fahrschulen in {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches & Kontakt */}
          <div>
            <h3 className="text-white font-semibold mb-6">Rechtliches</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/impressum" className="text-white/60 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-white/60 hover:text-white transition-colors">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="text-white/60 hover:text-white transition-colors">
                  AGB
                </Link>
              </li>
              {legalItems.length > 0 && <FooterNav items={legalItems} />}
            </ul>
            
            <h3 className="text-white font-semibold mt-8 mb-4">Kontakt</h3>
            <a 
              href="mailto:kontakt@fahrschulfinder.de" 
              className="text-white/60 hover:text-white transition-colors flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              kontakt@fahrschulfinder.de
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/50">
              © {currentYear} FahrschulFinder. Alle Rechte vorbehalten.
            </p>
            <p className="text-sm text-white/50">
              Made with ❤️ in Deutschland
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
