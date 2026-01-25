import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const FuelEntries: CollectionConfig = {
  slug: 'fuel-entries',
  labels: {
    singular: 'Kraftstoffeintrag',
    plural: 'Kraftstoffeinträge',
  },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'aircraft', 'fuelType', 'liters', 'pricePerLiter', 'totalPrice', 'gasStation'],
    group: 'Flugzeuge',
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
      name: 'aircraft',
      type: 'relationship',
      relationTo: 'aircraft' as any,
      required: true,
      label: 'Flugzeug',
      admin: {
        description: 'Flugzeug, für das der Kraftstoff getankt wurde',
      },
    },
    {
      name: 'fuelType',
      type: 'select',
      required: true,
      label: 'Kraftstoff',
      options: [
        { label: 'Avgas', value: 'avgas' },
        { label: 'Mogas', value: 'mogas' },
      ],
      admin: {
        description: 'Art des Kraftstoffs',
      },
    },
    {
      name: 'liters',
      type: 'number',
      required: true,
      label: 'Liter',
      min: 0,
      admin: {
        description: 'Getankte Liter',
        step: 0.01,
      },
    },
    {
      name: 'pricePerLiter',
      type: 'number',
      required: true,
      label: 'Preis pro Liter',
      min: 0,
      admin: {
        description: 'Preis pro Liter in Euro',
        step: 0.01,
      },
    },
    {
      name: 'totalPrice',
      type: 'number',
      required: true,
      label: 'Gesamtpreis',
      admin: {
        description: 'Gesamtpreis (wird automatisch berechnet)',
        readOnly: true,
        step: 0.01,
      },
    },
    {
      name: 'gasStation',
      type: 'text',
      label: 'Tankstelle',
      admin: {
        description: 'Name der Tankstelle',
      },
    },
    {
      name: 'invoiceNumber',
      type: 'text',
      label: 'Rechnungsnummer',
      admin: {
        description: 'Rechnungsnummer der Tankstelle',
      },
    },
    {
      name: 'invoice',
      type: 'upload',
      relationTo: 'media',
      label: 'Rechnung',
      admin: {
        description: 'Hochgeladene Rechnung',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
      admin: {
        description: 'Zusätzliche Notizen',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeChange: [
      ({ data, operation: _operation }: any) => {
        // Berechne Gesamtpreis automatisch
        if (data && data.liters !== undefined && data.pricePerLiter !== undefined) {
          data.totalPrice = (data.liters * data.pricePerLiter).toFixed(2)
        }
        return data
      },
    ],
  },
}
