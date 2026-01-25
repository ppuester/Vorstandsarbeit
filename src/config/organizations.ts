import type { Organization } from '@/providers/Organization'

export interface OrganizationFeature {
  id: string
  name: string
  description: string
  enabled: boolean
}

export interface OrganizationConfig {
  id: Organization
  name: string
  description: string
  features: {
    transactions: boolean // Kontobewegungen
    aircraft: boolean // Flugzeuge
    flightLogs: boolean // Flugbücher
    costCenters: boolean // Kostenstellen
    costAllocations: boolean // Kostenstellen-Zuordnung zu Flugzeugen
    yearlyComparison: boolean // Jahresvergleich
    costCalculation: boolean // Kostenermittlung
    fuelTracking: boolean // Kraftstofferfassung
  }
}

export const organizationConfigs: Record<Organization, OrganizationConfig> = {
  'lsv-sauerland': {
    id: 'lsv-sauerland',
    name: 'LSV Sauerland',
    description: 'Luftsportverein Sauerland',
    features: {
      transactions: true,
      aircraft: true,
      flightLogs: true,
      costCenters: true,
      costAllocations: true,
      yearlyComparison: true,
      costCalculation: true,
      fuelTracking: true,
    },
  },
  'cdu-stadtverband': {
    id: 'cdu-stadtverband',
    name: 'CDU Stadtverband',
    description: 'CDU Stadtverband',
    features: {
      transactions: true,
      aircraft: false,
      flightLogs: false,
      costCenters: true,
      costAllocations: false,
      yearlyComparison: true,
      costCalculation: false,
      fuelTracking: false,
    },
  },
  'cdu-fraktion': {
    id: 'cdu-fraktion',
    name: 'CDU Fraktion',
    description: 'CDU Fraktion',
    features: {
      transactions: true,
      aircraft: false,
      flightLogs: false,
      costCenters: true,
      costAllocations: false,
      yearlyComparison: true,
      costCalculation: false,
      fuelTracking: false,
    },
  },
}

/**
 * Prüft, ob eine Funktion für die aktuelle Organisation aktiviert ist
 */
export function isFeatureEnabled(
  organization: Organization,
  feature: keyof OrganizationConfig['features']
): boolean {
  return organizationConfigs[organization]?.features[feature] ?? false
}

/**
 * Gibt alle verfügbaren Funktionen für eine Organisation zurück
 */
export function getOrganizationFeatures(organization: Organization): OrganizationConfig['features'] {
  return organizationConfigs[organization]?.features ?? {
    transactions: false,
    aircraft: false,
    flightLogs: false,
    costCenters: false,
    costAllocations: false,
    yearlyComparison: false,
    costCalculation: false,
    fuelTracking: false,
  }
}
