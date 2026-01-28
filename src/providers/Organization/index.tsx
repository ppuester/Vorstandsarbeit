'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { organizationConfigs, type OrganizationConfig } from '@/config/organizations'
import type { User } from '@/payload-types'

export type Organization = 'lsv-sauerland' | 'cdu-stadtverband' | 'cdu-fraktion'

interface OrganizationContextType {
  organization: Organization
  setOrganization: (org: Organization) => void
  organizationName: string
  organizationConfig: OrganizationConfig
  isFeatureEnabled: (feature: keyof OrganizationConfig['features']) => boolean
  user: User | null
  setUser: (user: User | null) => void
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
  const [user, setUser] = useState<User | null>(null)

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

  // Lade Benutzerdaten
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user || null)
        }
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdaten:', error)
      }
    }
    fetchUser()
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

  const isFeatureEnabled = useCallback(
    (feature: keyof OrganizationConfig['features']) => {
      // Prüfe zuerst die Organisations-Features
      const orgFeatureEnabled = organizationConfigs[organization]?.features[feature] ?? false
      
      // Wenn das Feature auf Organisationsebene deaktiviert ist, ist es auch für den Benutzer nicht verfügbar
      if (!orgFeatureEnabled) {
        return false
      }

      // Wenn kein Benutzer eingeloggt ist, keine Berechtigung
      if (!user) {
        return false
      }

      // Admin-Nutzer haben alle Berechtigungen
      // Prüfe ob der Nutzer Admin ist (erster Nutzer oder spezielle E-Mail)
      const userEmail = (user as any).email || ''
      const isAdmin = 
        userEmail === 'patrick.puester@gmail.com' || // Ihr Admin-Nutzer
        (user as any).roles?.includes('admin') || // Payload Admin-Rolle
        false

      if (isAdmin) {
        return orgFeatureEnabled
      }

      // Prüfe Benutzerberechtigungen
      if ((user as any).permissions) {
        const userPermission = ((user as any).permissions as any)?.[feature]
        // Wenn Benutzerberechtigung explizit gesetzt ist, verwende diese
        if (userPermission !== undefined) {
          return userPermission === true
        }
      }

      // Standard: Keine Berechtigung, wenn nicht explizit gesetzt
      return false
    },
    [organization, user]
  )

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        setOrganization,
        organizationName: organizationNames[organization],
        organizationConfig: organizationConfigs[organization],
        isFeatureEnabled,
        user,
        setUser,
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
