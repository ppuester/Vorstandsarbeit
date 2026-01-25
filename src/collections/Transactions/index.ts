import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  labels: {
    singular: 'Kontobewegung',
    plural: 'Kontobewegungen',
  },
  admin: {
    useAsTitle: 'description',
    defaultColumns: ['date', 'description', 'amount', 'type', 'category', 'processed'],
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
      name: 'date',
      type: 'date',
      required: true,
      label: 'Datum',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      label: 'Beschreibung',
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      label: 'Betrag',
      admin: {
        description: 'Betrag in Euro (negativ für Ausgaben, positiv für Einnahmen)',
        step: 0.01,
      },
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
      admin: {
        description: 'Wird automatisch basierend auf dem Betrag gesetzt, kann aber manuell geändert werden',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'transaction-categories',
      label: 'Kategorie',
      admin: {
        description: 'Optional: Kategorie für diese Bewegung',
      },
    },
    {
      name: 'reference',
      type: 'text',
      label: 'Referenz/Verwendungszweck',
      admin: {
        description: 'Zusätzliche Referenznummer oder Verwendungszweck',
      },
    },
    {
      name: 'processed',
      type: 'checkbox',
      label: 'Verarbeitet',
      defaultValue: false,
      admin: {
        description: 'Markieren Sie diese Bewegung als verarbeitet/kategorisiert',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
      admin: {
        description: 'Zusätzliche Notizen zu dieser Bewegung',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Automatisch Typ basierend auf Betrag setzen, wenn nicht bereits gesetzt
        if (data.amount !== undefined) {
          if (data.amount < 0 && (!data.type || data.type === 'expense')) {
            data.type = 'expense'
            // Betrag positiv machen für Ausgaben
            data.amount = Math.abs(data.amount)
          } else if (data.amount > 0 && (!data.type || data.type === 'income')) {
            data.type = 'income'
          }
        }
        return data
      },
    ],
  },
}
