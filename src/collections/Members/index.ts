import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const Members: CollectionConfig = {
  slug: 'members',
  labels: {
    singular: 'Mitglied',
    plural: 'Mitglieder',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'memberNumber', 'email', 'active'],
    group: 'Stammdaten',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
      admin: {
        description: 'Vollständiger Name des Mitglieds',
      },
    },
    {
      name: 'memberNumber',
      type: 'text',
      label: 'Mitgliedsnummer',
      admin: {
        description: 'Eindeutige Mitgliedsnummer',
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-Mail',
      admin: {
        description: 'E-Mail-Adresse des Mitglieds',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Telefon',
      admin: {
        description: 'Telefonnummer',
      },
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Adresse',
      admin: {
        description: 'Vollständige Adresse',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      admin: {
        description: 'Ist das Mitglied aktiv?',
      },
    },
    {
      name: 'costTier',
      type: 'text',
      label: 'Kostenstufe',
      admin: {
        description: 'Importwert aus Spalte „Kostenstufe“ (z.B. Barzahler)',
      },
    },
    {
      name: 'isWorkingHoursExempt',
      type: 'checkbox',
      label: 'Von Arbeitsstunden ausgenommen',
      defaultValue: false,
      admin: {
        description: 'Wird aus Kostenstufe „Barzahler“ abgeleitet; diese Mitglieder erscheinen nicht in der Arbeitsstunden-Auswertung.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
      admin: {
        description: 'Zusätzliche Informationen',
      },
    },
    {
      name: 'importFingerprint',
      type: 'text',
      label: 'Import-Fingerprint',
      admin: {
        hidden: true,
        description: 'SHA1 der importierten Felder für Delta-Import',
      },
    },
    {
      name: 'lastImportedAt',
      type: 'date',
      label: 'Zuletzt importiert',
      admin: {
        hidden: true,
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'sourceSystem',
      type: 'text',
      label: 'Quellsystem',
      defaultValue: 'members-xlsx',
      admin: {
        hidden: true,
        description: 'Herkunft des letzten Imports',
      },
    },
  ],
  timestamps: true,
}
