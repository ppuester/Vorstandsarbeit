import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import crypto from 'crypto'

export const AccessTokens: CollectionConfig = {
  slug: 'access-tokens',
  labels: {
    singular: 'Zugang',
    plural: 'Zugänge',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'token', 'permissions', 'active', 'expiresAt', 'lastUsedAt'],
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name/Bezeichnung',
      admin: {
        description: 'Bezeichnung für diesen Zugang (z.B. "Kraftstofferfassung - Hangar 1")',
      },
    },
    {
      name: 'token',
      type: 'text',
      required: true,
      unique: true,
      label: 'Token',
      admin: {
        description: 'Eindeutiger Zugangstoken (wird automatisch generiert)',
        readOnly: true,
      },
      hooks: {
        beforeValidate: [
          async ({ data, operation }) => {
            // Generiere Token nur bei Erstellung, wenn noch keiner vorhanden ist
            if (operation === 'create' && data && !data.token) {
              // Generiere einen sicheren, zufälligen Token
              const randomBytes = crypto.randomBytes(32)
              data.token = randomBytes.toString('hex')
            }
            return data
          },
        ],
      },
    },
    {
      name: 'permissions',
      type: 'select',
      hasMany: true,
      required: true,
      label: 'Berechtigungen',
      options: [
        { label: 'Kraftstofferfassung', value: 'fuelTracking' },
        // Weitere Berechtigungen können hier hinzugefügt werden
        // { label: 'Flugstunden', value: 'flightLogs' },
        // { label: 'Kontobewegungen', value: 'transactions' },
      ],
      admin: {
        description: 'Welche Bereiche sind mit diesem Token zugänglich?',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Ablaufdatum',
      admin: {
        description: 'Optional: Ab wann ist dieser Zugang nicht mehr gültig?',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      admin: {
        description: 'Ist dieser Zugang aktiv und kann verwendet werden?',
      },
    },
    {
      name: 'lastUsedAt',
      type: 'date',
      label: 'Zuletzt verwendet',
      admin: {
        description: 'Wann wurde dieser Zugang zuletzt verwendet?',
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      label: 'Verwendungsanzahl',
      defaultValue: 0,
      admin: {
        description: 'Wie oft wurde dieser Zugang verwendet?',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
