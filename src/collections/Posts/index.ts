import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'

export const Posts: CollectionConfig<'posts'> = {
  slug: 'posts',
  labels: {
    singular: 'Beitrag',
    plural: 'Beiträge',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // Diese Konfiguration steuert, was standardmäßig befüllt wird, wenn auf einen Beitrag verwiesen wird
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Typsicher, wenn der Collection-Slug-Generic an `CollectionConfig` übergeben wird - `CollectionConfig<'posts'>
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Titel',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              label: 'Titelbild',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Inhalt',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              required: true,
            },
          ],
          label: 'Inhalt',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              label: 'Verwandte Beiträge',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              label: 'Kategorien',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Metadaten',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // wenn die `generateUrl` Funktion konfiguriert ist
              hasGenerateFn: true,

              // Feldpfade, um das Zielfeld für Daten abzugleichen
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Veröffentlicht am',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      label: 'Autoren',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // Dieses Feld wird nur verwendet, um die Benutzerdaten über den `populateAuthors` Hook zu befüllen
    // Dies liegt daran, dass die `user` Collection gesperrte Access Control hat, um die Privatsphäre der Benutzer zu schützen
    // GraphQL gibt auch keine mutierten Benutzerdaten zurück, die vom zugrunde liegenden Schema abweichen
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // Wir setzen dieses Intervall für optimale Live-Vorschau
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
