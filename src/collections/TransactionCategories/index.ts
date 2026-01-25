import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const TransactionCategories: CollectionConfig = {
  slug: 'transaction-categories',
  labels: {
    singular: 'Kategorie',
    plural: 'Kategorien',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'color'],
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
      label: 'Name',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Typ',
      options: [
        { label: 'Einnahme', value: 'income' },
        { label: 'Ausgabe', value: 'expense' },
      ],
      defaultValue: 'expense',
    },
    {
      name: 'color',
      type: 'text',
      label: 'Farbe (Hex)',
      admin: {
        description: 'Hex-Farbcode für die Anzeige (z.B. #3B82F6)',
        placeholder: '#3B82F6',
      },
      defaultValue: '#6B7280',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
    },
  ],
  timestamps: true,
}
