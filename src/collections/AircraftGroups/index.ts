import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const AircraftGroups: CollectionConfig = {
  slug: 'aircraft-groups',
  labels: {
    singular: 'Flugzeuggruppe',
    plural: 'Flugzeuggruppen',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'active'],
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
        description: 'Bezeichnung der Flugzeuggruppe (z.B. "UL (Ultraleicht)", "Segelflugzeug", "Motorflugzeug")',
      },
    },
    {
      name: 'code',
      type: 'text',
      label: 'Code',
      admin: {
        description: 'Optional: Kurzcode für die Gruppe (z.B. "UL", "GL", "MOT")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
      admin: {
        description: 'Zusätzliche Informationen zu dieser Gruppe',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Farbe (Hex-Code)',
      admin: {
        description: 'Optional: Hex-Code für die Anzeige der Gruppe (z.B. #3B82F6)',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      admin: {
        description: 'Ist diese Gruppe aktiv und kann zugeordnet werden?',
      },
    },
  ],
  timestamps: true,
}
