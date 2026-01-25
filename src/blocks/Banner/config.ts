import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Banner: Block = {
  slug: 'banner',
  labels: {
    plural: 'Banner',
    singular: 'Banner',
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      label: 'Stil',
      defaultValue: 'info',
      options: [
        { label: 'Information', value: 'info' },
        { label: 'Warnung', value: 'warning' },
        { label: 'Fehler', value: 'error' },
        { label: 'Erfolg', value: 'success' },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: 'Inhalt',
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
}
