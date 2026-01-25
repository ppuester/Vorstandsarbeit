'use client'

import React from 'react'
import { CMSLink } from '@/components/Link'
import { openCookieBanner } from '@/components/CookieBanner'

interface FooterNavItem {
  category?: 'navigation' | 'legal' | null
  link: {
    type?: 'reference' | 'custom' | null
    newTab?: boolean | null
    reference?: {
      relationTo: 'pages' | 'posts'
      value: any
    } | null
    url?: string | null
    label: string
  }
}

interface FooterNavProps {
  items: FooterNavItem[]
  showCookieButton?: boolean
}

export const FooterNav: React.FC<FooterNavProps> = ({ items, showCookieButton = false }) => {
  return (
    <nav className="flex flex-col gap-2">
      {items.map(({ link }, i) => (
        <CMSLink
          key={i}
          {...link}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        />
      ))}
      {showCookieButton && (
        <button
          onClick={openCookieBanner}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left bg-transparent border-none cursor-pointer p-0 font-inherit"
        >
          Cookie-Einstellungen
        </button>
      )}
    </nav>
  )
}
