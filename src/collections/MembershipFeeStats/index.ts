import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const MembershipFeeStats: CollectionConfig = {
  slug: 'membership-fee-stats',
  labels: {
    singular: 'Mitgliederbestand / Beitragsstand',
    plural: 'Mitgliederbestände / Beitragsstände',
  },
  admin: {
    useAsTitle: 'adminLabel',
    defaultColumns: ['year', 'feeType', 'memberCount', 'totalIncome', 'snapshotDate'],
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
        description: 'Wird automatisch aus Jahr und Beitragsart berechnet.',
      },
    },
    {
      name: 'year',
      type: 'number',
      required: true,
      label: 'Jahr',
      admin: {
        description: 'Geschäftsjahr, für das der Stand gilt (z.B. 2024).',
      },
    },
    {
      name: 'snapshotDate',
      type: 'date',
      required: true,
      label: 'Stichtag',
      admin: {
        description: 'Datum, zu dem der Mitgliederbestand bewertet wurde.',
      },
    },
    {
      name: 'feeType',
      type: 'relationship',
      relationTo: 'membership-fee-types' as any,
      required: true,
      label: 'Beitragsart',
    },
    {
      name: 'memberCount',
      type: 'number',
      required: true,
      label: 'Anzahl Mitglieder',
      admin: {
        description: 'z.B. 10 aktive Mitglieder.',
      },
    },
    {
      name: 'amountPerMember',
      type: 'number',
      required: true,
      label: 'Beitrag je Mitglied (€ / Jahr)',
      admin: {
        description: 'z.B. 700 € pro aktivem Mitglied.',
      },
    },
    {
      name: 'totalIncome',
      type: 'number',
      label: 'Gesamtbeitrag (€)',
      admin: {
        description:
          'Wird automatisch als Anzahl * Beitrag berechnet, kann bei Bedarf aber manuell angepasst werden.',
      },
    },
    {
      name: 'generalCost',
      type: 'relationship',
      relationTo: 'general-costs' as any,
      label: 'Zuordnung zu Allgemeiner Kostenstelle',
      admin: {
        description:
          'Optional: Kostengruppe, der diese Beitragseinnahmen gutgeschrieben werden (z.B. „Fixkosten“). Ist nichts gesetzt, wird die Zuordnung der Beitragsart verwendet.',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }: any) => {
        if (!data) return data

        if (data.memberCount != null && data.amountPerMember != null) {
          const count = Number(data.memberCount)
          const amount = Number(data.amountPerMember)
          if (!Number.isNaN(count) && !Number.isNaN(amount)) {
            if (data.totalIncome == null) {
              data.totalIncome = count * amount
            }
          }
        }

        if (data.year && data.feeType) {
          data.adminLabel = `${data.year} – Beitragsart ${typeof data.feeType === 'object' && data.feeType !== null ? data.feeType.name ?? data.feeType.id : data.feeType
            }`
        }

        return data
      },
    ],
  },
  timestamps: true,
}

