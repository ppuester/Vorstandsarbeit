import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const MembershipFeeTypes: CollectionConfig = {
  slug: 'membership-fee-types',
  labels: {
    singular: 'Beitragsart',
    plural: 'Beitragsarten',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'defaultAmount', 'active'],
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
      label: 'Name',
      admin: {
        description: 'z.B. „Aktives Mitglied“, „Passives Mitglied“, „Fördermitglied“',
      },
    },
    {
      name: 'code',
      type: 'text',
      label: 'Kurzbezeichnung',
      admin: {
        description: 'Optionale technische Kennung (z.B. AKTIV, PASSIV)',
      },
    },
    {
      name: 'defaultAmount',
      type: 'number',
      label: 'Standardbeitrag je Mitglied (€ / Jahr)',
      admin: {
        description: 'Vorgabewert, der bei neuen Ständen vorbelegt werden kann',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
    },
  ],
  timestamps: true,
}

