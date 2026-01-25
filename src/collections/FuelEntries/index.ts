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
    defaultColumns: ['date', 'name', 'aircraft', 'fuelType', 'meterReadingOld', 'meterReadingNew', 'liters', 'totalPrice'],
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name (in Druckbuchstaben)',
      admin: {
        description: 'Name der Person, die getankt hat',
      },
    },
    {
      name: 'meterReadingOld',
      type: 'number',
      required: true,
      label: 'Zählerstand alt',
      min: 0,
      admin: {
        description: 'Zählerstand vor dem Tanken',
        step: 0.01,
      },
    },
    {
      name: 'meterReadingNew',
      type: 'number',
      required: true,
      label: 'Zählerstand neu',
      min: 0,
      admin: {
        description: 'Zählerstand nach dem Tanken',
        step: 0.01,
      },
    },
    {
      name: 'liters',
      type: 'number',
      required: true,
      label: 'Menge (Liter)',
      admin: {
        description: 'Getankte Liter (wird automatisch berechnet: Zählerstand neu - Zählerstand alt)',
        readOnly: true,
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
        // Berechne Liter automatisch aus Zählerständen
        if (
          data &&
          data.meterReadingOld !== undefined &&
          data.meterReadingNew !== undefined
        ) {
          data.liters = Math.max(0, data.meterReadingNew - data.meterReadingOld)
        }
        // Berechne Gesamtpreis automatisch
        if (data && data.liters !== undefined && data.pricePerLiter !== undefined) {
          data.totalPrice = Number((data.liters * data.pricePerLiter).toFixed(2))
        }
        return data
      },
    ],
  },
}
