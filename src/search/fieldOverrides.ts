import { Field } from 'payload'

export const searchFields: Field[] = [
  {
    name: 'slug',
    type: 'text',
    label: 'URL-Slug',
    index: true,
    admin: {
      readOnly: true,
    },
  },
  {
    name: 'meta',
    label: 'Meta',
    type: 'group',
    index: true,
    admin: {
      readOnly: true,
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Titel',
      },
      {
        type: 'text',
        name: 'description',
        label: 'Beschreibung',
      },
      {
        name: 'image',
        label: 'Bild',
        type: 'upload',
        relationTo: 'media',
      },
    ],
  },
  {
    label: 'Kategorien',
    name: 'categories',
    type: 'array',
    admin: {
      readOnly: true,
    },
    fields: [
      {
        name: 'relationTo',
        type: 'text',
        label: 'Beziehung zu',
      },
      {
        name: 'categoryID',
        type: 'text',
        label: 'Kategorie-ID',
      },
      {
        name: 'title',
        type: 'text',
        label: 'Titel',
      },
    ],
  },
]
