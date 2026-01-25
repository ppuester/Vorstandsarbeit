'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Organization = 'lsv-sauerland' | 'cdu-stadtverband' | 'cdu-fraktion'

interface OrganizationContextType {
  organization: Organization
  setOrganization: (org: Organization) => void
  organizationName: string
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

const STORAGE_KEY = 'selectedOrganization'

const organizationNames: Record<Organization, string> = {
  'lsv-sauerland': 'LSV Sauerland',
  'cdu-stadtverband': 'CDU Stadtverband',
  'cdu-fraktion': 'CDU Fraktion',
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [organization, setOrganizationState] = useState<Organization>('lsv-sauerland')
  const [isHydrated, setIsHydrated] = useState(false)

  // Lade Organisation aus LocalStorage nach Hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && (stored === 'lsv-sauerland' || stored === 'cdu-stadtverband' || stored === 'cdu-fraktion')) {
        setOrganizationState(stored as Organization)
      }
    } catch (e) {
      console.error('Fehler beim Laden der Organisation:', e)
    }
    setIsHydrated(true)
  }, [])

  // Speichere Organisation in LocalStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, organization)
      } catch (e) {
        console.error('Fehler beim Speichern der Organisation:', e)
      }
    }
  }, [organization, isHydrated])

  const setOrganization = useCallback((org: Organization) => {
    setOrganizationState(org)
  }, [])

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        setOrganization,
        organizationName: organizationNames[organization],
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
