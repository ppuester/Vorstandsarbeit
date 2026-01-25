import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const FlightLogs: CollectionConfig = {
  slug: 'flight-logs',
  labels: {
    singular: 'Flugbuch',
    plural: 'Flugbücher',
  },
  admin: {
    useAsTitle: 'year',
    defaultColumns: ['aircraft', 'year', 'starts', 'flightHours', 'createdAt'],
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
      name: 'aircraft',
      type: 'relationship',
      relationTo: 'aircraft' as any,
      required: true,
      label: 'Flugzeug',
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      label: 'Jahr',
      min: 2000,
      max: 2100,
      admin: {
        description: 'Jahr für das diese Daten gelten',
      },
    },
    {
      name: 'starts',
      type: 'number',
      required: true,
      label: 'Anzahl Starts',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Anzahl der Starts in diesem Jahr',
      },
    },
    {
      name: 'flightHours',
      type: 'number',
      required: true,
      label: 'Flugstunden',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Gesamte Flugstunden in diesem Jahr',
        step: 0.01,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
      admin: {
        description: 'Zusätzliche Informationen zu diesem Jahr',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        // Ensure year is set to current year if not provided
        if (data && !data.year) {
          data.year = new Date().getFullYear()
        }
        return data
      },
    ],
  },
}
