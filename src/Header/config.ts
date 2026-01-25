import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Kopfzeile',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      label: 'Navigations-Einträge',
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Typ',
          defaultValue: 'link',
          options: [
            {
              label: 'Einfacher Link',
              value: 'link',
            },
            {
              label: 'Dropdown-Menü',
              value: 'dropdown',
            },
          ],
          admin: {
            description: 'Wählen Sie, ob dies ein einfacher Link oder ein Dropdown mit Untermenüpunkten sein soll.',
          },
        },
        {
          name: 'label',
          type: 'text',
          label: 'Beschriftung',
          required: true,
          defaultValue: 'Menüpunkt',
          admin: {
            description: 'Der angezeigte Text im Menü',
          },
        },
        // Link-Felder für einfache Links
        link({
          appearances: false,
          disableLabel: true,
          overrides: {
            name: 'link',
            label: 'Link',
            admin: {
              condition: (_, siblingData) => siblingData?.type === 'link',
            },
          },
        }),
        // Untermenü für Dropdowns
        {
          name: 'children',
          type: 'array',
          label: 'Untermenü-Einträge',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'dropdown',
            description: 'Fügen Sie hier die Untermenüpunkte hinzu.',
            initCollapsed: true,
          },
          fields: [
            link({
              appearances: false,
            }),
          ],
          maxRows: 10,
        },
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
