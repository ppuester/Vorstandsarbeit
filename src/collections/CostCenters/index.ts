import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const CostCenters: CollectionConfig = {
  slug: 'cost-centers',
  labels: {
    singular: 'Kostenstelle',
    plural: 'Kostenstellen',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'active'],
    group: 'Finanzen',
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
      label: 'Name der Kostenstelle',
      admin: {
        description: 'Bezeichnung der Kostenstelle (z.B. "Verwaltung", "Flugbetrieb", "Marketing")',
      },
    },
    {
      name: 'code',
      type: 'text',
      label: 'Kostenstellencode',
      admin: {
        description: 'Optional: Kurzcode für die Kostenstelle (z.B. "VW", "FB", "MK")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
      admin: {
        description: 'Zusätzliche Informationen zur Kostenstelle',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      admin: {
        description: 'Ist diese Kostenstelle aktiv und kann zugeordnet werden?',
      },
    },
    {
      name: 'color',
      type: 'text',
      label: 'Farbe (Hex-Code)',
      admin: {
        description: 'Optional: Hex-Code für die Anzeige der Kostenstelle (z.B. #FF0000)',
      },
    },
  ],
  timestamps: true,
}
