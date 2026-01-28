import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Benutzer',
    plural: 'Benutzer',
  },
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Name',
    },
    {
      name: 'permissions',
      type: 'group',
      label: 'Berechtigungen',
      admin: {
        description: 'Aktivieren Sie die Funktionen, auf die dieser Benutzer zugreifen kann',
      },
      fields: [
        {
          name: 'transactions',
          type: 'checkbox',
          label: 'Kontobewegungen',
          defaultValue: false,
          admin: {
            description: 'Zugriff auf Kontobewegungen (Import, Übersicht, Jahresvergleich)',
          },
        },
        {
          name: 'aircraft',
          type: 'checkbox',
          label: 'Flugzeuge',
          defaultValue: false,
          admin: {
            description: 'Zugriff auf Flugzeugverwaltung und Übersicht',
          },
        },
        {
          name: 'flightLogs',
          type: 'checkbox',
          label: 'Flugbücher',
          defaultValue: false,
          admin: {
            description: 'Zugriff auf Flugstunden & Starts',
          },
        },
        {
          name: 'costCenters',
          type: 'checkbox',
          label: 'Kostenstellen',
          defaultValue: false,
          admin: {
            description: 'Zugriff auf Kostenstellen-Verwaltung',
          },
        },
        {
          name: 'costAllocations',
          type: 'checkbox',
          label: 'Kostenstellen-Zuordnung',
          defaultValue: false,
          admin: {
            description: 'Zugriff auf Zuordnung von Kosten zu Flugzeugen',
          },
        },
        {
          name: 'yearlyComparison',
          type: 'checkbox',
          label: 'Jahresvergleich',
          defaultValue: false,
          admin: {
            description: 'Zugriff auf Jahresvergleich der Kontobewegungen',
          },
        },
        {
          name: 'costCalculation',
          type: 'checkbox',
          label: 'Kostenermittlung',
          defaultValue: false,
          admin: {
            description: 'Zugriff auf Kostenermittlung pro Flugzeug',
          },
        },
        {
          name: 'fuelTracking',
          type: 'checkbox',
          label: 'Kraftstofferfassung',
          defaultValue: false,
          admin: {
            description: 'Zugriff auf Kraftstofferfassung',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        // Normalisiere permissions-Feld, falls es als leeres Objekt oder undefined kommt
        if (data && data.permissions) {
          // Stelle sicher, dass alle Checkbox-Felder boolean-Werte haben
          const permissionFields = [
            'transactions',
            'aircraft',
            'flightLogs',
            'costCenters',
            'costAllocations',
            'yearlyComparison',
            'costCalculation',
            'fuelTracking',
          ]
          
          permissionFields.forEach((field) => {
            if (data.permissions[field] === undefined || data.permissions[field] === null) {
              data.permissions[field] = false
            } else {
              // Stelle sicher, dass der Wert ein Boolean ist
              data.permissions[field] = Boolean(data.permissions[field])
            }
          })
        } else if (data && !data.permissions) {
          // Wenn permissions nicht vorhanden ist, erstelle ein leeres Objekt mit allen false-Werten
          data.permissions = {
            transactions: false,
            aircraft: false,
            flightLogs: false,
            costCenters: false,
            costAllocations: false,
            yearlyComparison: false,
            costCalculation: false,
            fuelTracking: false,
          }
        }
        return data
      },
    ],
  },
  ],
  timestamps: true,
}
