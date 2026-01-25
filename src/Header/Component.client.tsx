'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { Menu, X, Search, Car } from 'lucide-react'

import type { Header } from '@/payload-types'

import { HeaderNav } from './Nav'
import { useHeaderTheme } from '@/providers/HeaderTheme'

interface HeaderClientProps {
  data: Header | null
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const { headerTheme } = useHeaderTheme()
  const isDark = headerTheme === 'dark'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header 
      className={`
        z-50 w-full transition-all duration-300
        sticky top-0
        ${isDark 
          ? 'bg-slate-900/90 backdrop-blur-lg border-b border-white/10' 
          : 'bg-white/95 backdrop-blur-lg border-b border-slate-200'
        }
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 lg:h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isDark 
                ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' 
                : 'bg-gradient-to-br from-violet-600 to-fuchsia-600'
            }`}>
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                FahrschulFinder
              </span>
              <span className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                Deine Fahrschule finden
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link 
              href="/fahrschulen" 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'text-white/80 hover:text-white hover:bg-white/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Fahrschulen
            </Link>
            <Link 
              href="/posts" 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'text-white/80 hover:text-white hover:bg-white/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Ratgeber
            </Link>
            <Link 
              href="/ueber-uns" 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'text-white/80 hover:text-white hover:bg-white/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Über uns
            </Link>
            {data?.navItems && <HeaderNav data={data} isDark={isDark} />}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/fahrschulen"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              <Search className="w-4 h-4" />
              Fahrschule finden
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg ${
              isDark 
                ? 'text-white hover:bg-white/10' 
                : 'text-slate-700 hover:bg-slate-100'
            }`}
            aria-label="Menü öffnen"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-200/10">
            <nav className="flex flex-col gap-2">
              <Link 
                href="/fahrschulen" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium ${
                  isDark 
                    ? 'text-white/80 hover:text-white hover:bg-white/10' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Fahrschulen
              </Link>
              <Link 
                href="/posts" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium ${
                  isDark 
                    ? 'text-white/80 hover:text-white hover:bg-white/10' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Ratgeber
              </Link>
              <Link 
                href="/ueber-uns" 
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg font-medium ${
                  isDark 
                    ? 'text-white/80 hover:text-white hover:bg-white/10' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Über uns
              </Link>
              <Link
                href="/fahrschulen"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-5 py-3 mt-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl"
              >
                <Search className="w-4 h-4" />
                Fahrschule finden
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
