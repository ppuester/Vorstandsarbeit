import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    label: 'Größe',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'Ein Drittel',
        value: 'oneThird',
      },
      {
        label: 'Hälfte',
        value: 'half',
      },
      {
        label: 'Zwei Drittel',
        value: 'twoThirds',
      },
      {
        label: 'Volle Breite',
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    label: 'Text',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: 'Link aktivieren',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: {
    plural: 'Inhaltsblöcke',
    singular: 'Inhaltsblock',
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Spalten',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
