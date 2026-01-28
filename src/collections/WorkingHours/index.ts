import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const WorkingHours: CollectionConfig = {
  slug: 'working-hours',
  labels: {
    singular: 'Arbeitsstunde',
    plural: 'Arbeitsstunden',
  },
  admin: {
    useAsTitle: 'adminLabel',
    defaultColumns: ['member', 'date', 'hours', 'type', 'createdAt'],
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
      name: 'adminLabel',
      type: 'text',
      label: 'Bezeichnung (intern)',
      admin: {
        readOnly: true,
        description: 'Wird automatisch generiert.',
      },
    },
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'members' as any,
      required: true,
      label: 'Mitglied',
      admin: {
        description: 'Mitglied, das die Arbeitsstunden geleistet hat',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      label: 'Datum',
      admin: {
        description: 'Datum, an dem die Arbeitsstunden geleistet wurden',
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'hours',
      type: 'number',
      required: true,
      label: 'Stunden',
      min: 0,
      admin: {
        description: 'Anzahl der geleisteten Arbeitsstunden',
        step: 0.1,
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Art',
      options: [
        { label: 'Segelflug', value: 'glider' },
        { label: 'Motorflug', value: 'motor' },
        { label: 'Verwaltung', value: 'administration' },
        { label: 'Wartung', value: 'maintenance' },
        { label: 'Sonstiges', value: 'other' },
      ],
      admin: {
        description: 'Art der geleisteten Arbeitsstunden',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
      admin: {
        description: 'Zusätzliche Informationen zu den geleisteten Arbeitsstunden',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
      admin: {
        description: 'Interne Notizen',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        if (!data) return data

        // Generiere adminLabel
        if (data.member && data.date && data.hours != null) {
          const memberName =
            typeof data.member === 'object' && data.member !== null
              ? data.member.name || data.member.id
              : data.member

          const dateStr = data.date
            ? new Date(data.date).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
            : ''

          data.adminLabel = `${memberName} - ${dateStr} - ${data.hours}h`
        }

        return data
      },
    ],
  },
  timestamps: true,
}
