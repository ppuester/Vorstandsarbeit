'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  FileText,
  Plane,
  Calculator,
  TrendingUp,
  Menu,
  X,
} from 'lucide-react'
import { useOrganization } from '@/providers/Organization'

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const { isFeatureEnabled } = useOrganization()

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: Home,
      enabled: true,
    },
    {
      label: 'Kontobewegungen',
      href: '/kontobewegungen',
      icon: FileText,
      enabled: isFeatureEnabled('transactions'),
      children: [
        { label: 'Import', href: '/kontobewegungen', enabled: isFeatureEnabled('transactions') },
        { label: 'Übersicht', href: '/kontobewegungen/uebersicht', enabled: isFeatureEnabled('transactions') },
        { label: 'Jahresvergleich', href: '/kontobewegungen/jahresvergleich', enabled: isFeatureEnabled('yearlyComparison') },
      ],
    },
    {
      label: 'Flugzeuge',
      href: '/flugzeuge',
      icon: Plane,
      enabled: isFeatureEnabled('aircraft'),
      children: [
        { label: 'Übersicht', href: '/flugzeuge', enabled: isFeatureEnabled('aircraft') },
        { label: 'Kostenermittlung', href: '/flugzeuge/kostenermittlung', enabled: isFeatureEnabled('costCalculation') },
        { label: 'Kraftstofferfassung', href: '/flugzeuge/kraftstofferfassung', enabled: isFeatureEnabled('fuelTracking') },
      ],
    },
  ].filter((item) => item.enabled)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900">Vorstandsarbeit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              if (item.children) {
                const enabledChildren = item.children.filter((child) => child.enabled)
                if (enabledChildren.length === 0) return null

                return (
                  <div key={item.href} className="relative group">
                    <button
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        active
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        {enabledChildren.map((child) => {
                          const childActive = isActive(child.href)
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-4 py-2 text-sm transition-colors ${
                                childActive
                                  ? 'bg-violet-50 text-violet-700 font-medium'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                            >
                              {child.label}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            aria-label="Menü öffnen"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              if (item.children) {
                const enabledChildren = item.children.filter((child) => child.enabled)
                if (enabledChildren.length === 0) return null

                return (
                  <div key={item.href} className="mb-2">
                    <div className="flex items-center gap-2 px-4 py-2 text-slate-600 font-medium">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    <div className="pl-8 space-y-1">
                      {enabledChildren.map((child) => {
                        const childActive = isActive(child.href)
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                              childActive
                                ? 'bg-violet-50 text-violet-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors mb-2 ${
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
