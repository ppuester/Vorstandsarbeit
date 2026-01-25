'use client'

import React from 'react'
import Link from 'next/link'
import { openCookieBanner } from '@/components/CookieBanner'

interface FooterLinksProps {
  currentYear: number
}

export const FooterLinks: React.FC<FooterLinksProps> = ({ currentYear }) => {
  return (
    <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-sm text-muted-foreground">
        © {currentYear} MSC Lennetal - Bamenohl/Attendorn e.V.
      </p>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Link href="/datenschutz" className="hover:text-foreground transition-colors">
          Datenschutz
        </Link>
        <Link href="/impressum" className="hover:text-foreground transition-colors">
          Impressum
        </Link>
        <button
          onClick={openCookieBanner}
          className="hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0 font-inherit text-inherit"
        >
          Cookie-Einstellungen
        </button>
      </div>
    </div>
  )
}
