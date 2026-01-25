import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Fußzeile',
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
          name: 'category',
          type: 'select',
          label: 'Kategorie',
          required: true,
          defaultValue: 'navigation',
          options: [
            {
              label: 'Navigation',
              value: 'navigation',
            },
            {
              label: 'Rechtliches',
              value: 'legal',
            },
          ],
          admin: {
            description: 'Bestimmt in welcher Spalte der Link angezeigt wird',
          },
        },
        link({
          appearances: false,
        }),
      ],
      maxRows: 12,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Plattform',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
          admin: {
            placeholder: 'https://...',
          },
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        description: 'Social Media Icons werden unten rechts im Footer angezeigt',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
