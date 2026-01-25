import type { Block } from 'payload'

export const Code: Block = {
  slug: 'code',
  interfaceName: 'CodeBlock',
  labels: {
    plural: 'Code-Blöcke',
    singular: 'Code-Block',
  },
  fields: [
    {
      name: 'language',
      type: 'select',
      label: 'Programmiersprache',
      defaultValue: 'typescript',
      options: [
        {
          label: 'Typescript',
          value: 'typescript',
        },
        {
          label: 'Javascript',
          value: 'javascript',
        },
        {
          label: 'CSS',
          value: 'css',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: 'Code',
      required: true,
    },
  ],
}
