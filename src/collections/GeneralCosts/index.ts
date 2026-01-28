import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const GeneralCosts: CollectionConfig = {
  slug: 'general-costs',
  labels: {
    singular: 'Allgemeine Kosten',
    plural: 'Allgemeine Kosten',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'availableForIncome', 'availableForExpense', 'active'],
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
      name: 'parent',
      type: 'relationship',
      relationTo: 'general-costs',
      label: 'Übergeordnete Kostengruppe',
      admin: {
        description:
          'Optional: ordnet diese Kostenstelle einer Obergruppe zu (z.B. Fixkosten → Pacht)',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
      admin: {
        description: 'Bezeichnung der allgemeinen Kosten (z.B. "Pacht", "Versicherung", "Wartung")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
      admin: {
        description: 'Zusätzliche Informationen zu diesen Kosten',
      },
    },
    {
      name: 'availableForIncome',
      type: 'checkbox',
      label: 'Für Einnahmen verfügbar',
      defaultValue: false,
      admin: {
        description: 'Kann diese allgemeine Kostenstelle für Einnahmen zugeordnet werden?',
      },
    },
    {
      name: 'availableForExpense',
      type: 'checkbox',
      label: 'Für Ausgaben verfügbar',
      defaultValue: true,
      admin: {
        description: 'Kann diese allgemeine Kostenstelle für Ausgaben zugeordnet werden?',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      admin: {
        description: 'Ist diese allgemeine Kostenstelle aktiv und kann zugeordnet werden?',
      },
    },
  ],
  timestamps: true,
}
