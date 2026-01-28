import type { CollectionConfig } from 'payload'
import { APIError } from 'payload' // Laufzeit-Error-Typ, TS-Warnung ist bekannt und ungefährlich

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
      async ({ data, req, originalDoc, operation }: any) => {
        // Ensure year is set to current year if not provided
        if (data && !data.year) {
          data.year = new Date().getFullYear()
        }

        // Verhindere doppelte Einträge pro Flugzeug und Jahr
        if (data && data.aircraft && data.year && req?.payload) {
          const aircraftId =
            typeof data.aircraft === 'object' && data.aircraft !== null
              ? data.aircraft.id
              : data.aircraft

          if (aircraftId) {
            const where: any = {
              and: [
                { aircraft: { equals: aircraftId } },
                { year: { equals: data.year } },
              ],
            }

            // Beim Update aktuellen Datensatz von der Duplikatsprüfung ausschließen
            if (operation === 'update' && originalDoc?.id) {
              where.and.push({ id: { not_equals: originalDoc.id } })
            }

            const existing = await req.payload.find({
              collection: 'flight-logs',
              where,
              limit: 1,
              depth: 0,
              req,
              overrideAccess: false,
            })

            if (existing.totalDocs > 0) {
              throw new APIError(
                'Für dieses Flugzeug existiert bereits ein Eintrag für dieses Jahr. Bitte passen Sie den bestehenden Eintrag an oder wählen Sie ein anderes Jahr.',
                400,
              )
            }
          }
        }

        return data
      },
    ],
  },
}
