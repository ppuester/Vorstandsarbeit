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
      relationTo: 'transaction-categories' as any,
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
    {
      name: 'costAllocations',
      type: 'array',
      label: 'Kostenstellen-Zuordnung',
      admin: {
        description: 'Ordnen Sie diese Kosten mehreren Stellen zu (z.B. Flugzeugen) mit Gewichtung',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'aircraft',
          type: 'relationship',
          relationTo: 'aircraft' as any,
          required: true,
          label: 'Flugzeug',
          admin: {
            description: 'Flugzeug, dem diese Kosten zugeordnet werden',
          },
        },
        {
          name: 'weight',
          type: 'number',
          required: true,
          label: 'Gewichtung (%)',
          min: 0,
          max: 100,
          defaultValue: 100,
          admin: {
            description: 'Prozentualer Anteil dieser Kostenstelle (z.B. 50 für 50%)',
            step: 0.01,
          },
        },
      ],
      minRows: 0,
      maxRows: 20,
    },
  ],
  timestamps: true,
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        // Validierung der Gewichtungen
        if (data && data.costAllocations && Array.isArray(data.costAllocations)) {
          const totalWeight = data.costAllocations.reduce(
            (sum: number, allocation: any) => sum + (allocation.weight || 0),
            0
          )

          // Warnung wenn Gesamtgewichtung nicht 100% ist (aber nicht blockieren)
          if (totalWeight > 0 && Math.abs(totalWeight - 100) > 0.01) {
            console.warn(
              `Warnung: Gesamtgewichtung beträgt ${totalWeight.toFixed(2)}% statt 100%`
            )
          }
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, operation: _operation }: any) => {
        // Automatisch Typ basierend auf Betrag setzen, wenn nicht bereits gesetzt
        if (data && data.amount !== undefined) {
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
