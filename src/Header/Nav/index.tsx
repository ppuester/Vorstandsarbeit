'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Header as HeaderType } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react'

// Types für Nav Items
type NavItemChild = NonNullable<NonNullable<HeaderType['navItems']>[number]['children']>[number]
type NavItemLink = NonNullable<HeaderType['navItems']>[number]['link']

// Styles als Konstanten außerhalb der Komponente
const overlayStyles = {
  base: {
    position: 'fixed' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 9998,
    transition: 'opacity 300ms ease-out',
  },
  open: {
    opacity: 1,
    pointerEvents: 'auto' as const,
  },
  closed: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },
}

const sidebarStyles = {
  base: {
    position: 'fixed' as const,
    top: 0,
    right: 0,
    bottom: 0,
    width: '300px',
    maxWidth: '85vw',
    backgroundColor: 'white',
    zIndex: 9999,
    boxShadow: '-20px 0 60px -15px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  open: {
    transform: 'translateX(0)',
  },
  closed: {
    transform: 'translateX(100%)',
  },
}

// Standard-Link für Startseite
const homeLink = {
  label: 'Startseite',
  url: '/',
}

interface HeaderNavProps {
  data: HeaderType
  isDark?: boolean
}

// Helper um URL aus Link zu extrahieren
const getLinkUrl = (link: NavItemLink | NavItemChild['link']): string => {
  if (link?.type === 'reference' && link?.reference?.value) {
    return typeof link.reference.value === 'object' 
      ? `/${link.reference.value.slug}`
      : '/'
  }
  return link?.url || '/'
}

// Desktop Dropdown Komponente
const DesktopDropdown: React.FC<{
  label: string
  items: NavItemChild[]
  isDark: boolean
  pathname: string | null
}> = ({ label, items, isDark, pathname }) => {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const textColor = isDark ? 'text-white' : 'text-foreground'
  const mutedColor = isDark ? 'text-white/70' : 'text-muted-foreground'
  const hoverColor = isDark ? 'hover:text-white' : 'hover:text-foreground'

  // Prüfe ob ein Child aktiv ist
  const isChildActive = items.some(child => {
    const url = getLinkUrl(child.link)
    return pathname === url || (url !== '/' && pathname?.startsWith(url))
  })

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div 
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={`flex items-center gap-1.5 text-base transition-colors duration-200 ${
          isChildActive 
            ? `${textColor} font-medium` 
            : `${mutedColor} ${hoverColor}`
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute top-full left-0 pt-2 transition-all duration-200 ${
          isOpen 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="bg-background border border-border rounded-xl shadow-lg py-2 min-w-[200px]">
          {items.map((child, index) => {
            const url = getLinkUrl(child.link)
            const isActive = pathname === url || (url !== '/' && pathname?.startsWith(url))

            return (
              <Link
                key={index}
                href={url}
                className={`block px-4 py-2.5 text-sm transition-colors duration-200 ${
                  isActive 
                    ? 'text-foreground font-medium bg-muted/50' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
                target={child.link?.newTab ? '_blank' : undefined}
                rel={child.link?.newTab ? 'noopener noreferrer' : undefined}
              >
                {child.link?.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Mobile Accordion Item
const MobileAccordion: React.FC<{
  label: string
  items: NavItemChild[]
  pathname: string | null
  onLinkClick: () => void
}> = ({ label, items, pathname, onLinkClick }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Prüfe ob ein Child aktiv ist
  const isChildActive = items.some(child => {
    const url = getLinkUrl(child.link)
    return pathname === url || (url !== '/' && pathname?.startsWith(url))
  })

  // Auto-expand wenn ein Child aktiv ist
  useEffect(() => {
    if (isChildActive) setIsExpanded(true)
  }, [isChildActive])

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between w-full py-3 text-lg transition-colors duration-200 ${
          isChildActive 
            ? 'text-foreground font-medium' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
        aria-expanded={isExpanded}
      >
        {label}
        <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expandable Children */}
      <div 
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-4 pb-2 space-y-1">
          {items.map((child, index) => {
            const url = getLinkUrl(child.link)
            const isActive = pathname === url || (url !== '/' && pathname?.startsWith(url))

            return (
              <Link
                key={index}
                href={url}
                className={`block py-2 text-base transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={onLinkClick}
                target={child.link?.newTab ? '_blank' : undefined}
                rel={child.link?.newTab ? 'noopener noreferrer' : undefined}
              >
                {child.link?.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, isDark = false }) => {
  const navItems = data?.navItems || []
  const [isOpen, setIsOpen] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [])

  const toggle = () => setIsOpen(prev => !prev)
  const close = () => setIsOpen(false)

  const isHomeActive = pathname === '/'

  // Text-Farben basierend auf isDark
  const textColor = isDark ? 'text-white' : 'text-foreground'
  const mutedColor = isDark ? 'text-white/70' : 'text-muted-foreground'
  const hoverColor = isDark ? 'hover:text-white' : 'hover:text-foreground'

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-10">
        <Link 
          href="/"
          className={`text-base transition-colors duration-200 ${
            isHomeActive 
              ? `${textColor} font-medium` 
              : `${mutedColor} ${hoverColor}`
          }`}
        >
          {homeLink.label}
        </Link>

        {navItems.map((item, i) => {
          // Dropdown mit Children
          if (item.type === 'dropdown' && item.children && item.children.length > 0) {
            return (
              <DesktopDropdown
                key={i}
                label={item.label}
                items={item.children}
                isDark={isDark}
                pathname={pathname}
              />
            )
          }

          // Einfacher Link
          if (item.type === 'link' && item.link) {
            const url = getLinkUrl(item.link)
            const isActive = pathname === url || (url !== '/' && pathname?.startsWith(url))
            
            return (
              <Link
                key={i}
                href={url}
                className={`text-base transition-colors duration-200 ${
                  isActive 
                    ? `${textColor} font-medium` 
                    : `${mutedColor} ${hoverColor}`
                }`}
                target={item.link.newTab ? '_blank' : undefined}
                rel={item.link.newTab ? 'noopener noreferrer' : undefined}
              >
                {item.label}
              </Link>
            )
          }

          return null
        })}
      </nav>

      {/* Mobile Menu Button */}
      <button
        className={`md:hidden flex items-center justify-center w-10 h-10 transition-colors ${mutedColor} ${hoverColor}`}
        onClick={toggle}
        aria-label={isOpen ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar Portal */}
      {portalContainer && createPortal(
        <div className="md:hidden">
          <div 
            onClick={close}
            aria-hidden="true"
            style={{
              ...overlayStyles.base,
              ...(isOpen ? overlayStyles.open : overlayStyles.closed),
            }}
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            style={{
              ...sidebarStyles.base,
              ...(isOpen ? sidebarStyles.open : sidebarStyles.closed),
            }}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <Link href="/" onClick={close} className="hover:opacity-70 transition-opacity">
                <Logo loading="eager" priority="high" className="h-8 w-auto" />
              </Link>
              <button
                onClick={close}
                className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Menü schließen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col p-6 overflow-y-auto space-y-1">
              {/* Startseite */}
              <Link
                href="/"
                className={`block py-3 text-lg transition-colors duration-200 ${
                  isHomeActive 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={close}
              >
                {homeLink.label}
              </Link>

              {/* Nav Items */}
              {navItems.map((item, i) => {
                // Dropdown mit Children -> Accordion
                if (item.type === 'dropdown' && item.children && item.children.length > 0) {
                  return (
                    <MobileAccordion
                      key={i}
                      label={item.label}
                      items={item.children}
                      pathname={pathname}
                      onLinkClick={close}
                    />
                  )
                }

                // Einfacher Link
                if (item.type === 'link' && item.link) {
                  const url = getLinkUrl(item.link)
                  const isActive = pathname === url || (url !== '/' && pathname?.startsWith(url))

                  return (
                    <Link
                      key={i}
                      href={url}
                      className={`block py-3 text-lg transition-colors duration-200 ${
                        isActive 
                          ? 'text-foreground font-medium' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={close}
                      target={item.link.newTab ? '_blank' : undefined}
                      rel={item.link.newTab ? 'noopener noreferrer' : undefined}
                    >
                      {item.label}
                    </Link>
                  )
                }

                return null
              })}
            </nav>

            <div className="p-5 border-t border-border">
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">MSC Lennetal</p>
                <p className="text-xs text-muted-foreground">Bamenohl/Attendorn e.V.</p>
              </div>
            </div>
          </aside>
        </div>,
        portalContainer
      )}
    </>
  )
}
