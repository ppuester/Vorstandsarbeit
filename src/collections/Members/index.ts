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
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
      admin: {
        description: 'Zusätzliche Informationen',
      },
    },
  ],
  timestamps: true,
}
