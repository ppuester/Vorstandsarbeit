import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      label: 'Formular',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Einleitungstext aktivieren',
    },
    {
      name: 'introContent',
      type: 'richText',
      label: 'Einleitungstext',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
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
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Formular-Blöcke',
    singular: 'Formular-Block',
  },
}
