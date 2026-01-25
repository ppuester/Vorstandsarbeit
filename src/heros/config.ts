import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  label: 'Hero-Bereich',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Typ',
      options: [
        {
          label: 'Keiner',
          value: 'none',
        },
        {
          label: 'Video Hero (Vollbild)',
          value: 'videoHero',
        },
        {
          label: 'Hohe Wirkung',
          value: 'highImpact',
        },
        {
          label: 'Mittlere Wirkung',
          value: 'mediumImpact',
        },
        {
          label: 'Geringe Wirkung',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
      label: 'Text',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      label: 'Medium',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: false,
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video URL',
      admin: {
        condition: (_, { type } = {}) => type === 'videoHero',
        description: 'URL zum Hero-Video (MP4). Leer lassen für Standard-Video.',
      },
    },
    {
      name: 'videoPoster',
      type: 'text',
      label: 'Video Poster (Vorschaubild)',
      admin: {
        condition: (_, { type } = {}) => type === 'videoHero',
        description: 'URL zum Vorschaubild während das Video lädt.',
      },
    },
  ],
}
