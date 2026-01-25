import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  interfaceName: 'MediaBlock',
  labels: {
    plural: 'Medienblöcke',
    singular: 'Medienblock',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: 'Medium',
      relationTo: 'media',
      required: true,
    },
  ],
}
