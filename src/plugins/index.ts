import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { getSiteName } from '@/utilities/getSiteName'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  const siteName = getSiteName()
  return doc?.title ? `${doc.title} | ${siteName}` : siteName
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  // Vercel Blob Storage für Media-Uploads
  vercelBlobStorage({
    // Nur aktivieren wenn BLOB_READ_WRITE_TOKEN gesetzt ist (Production)
    enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    // Collections die Vercel Blob nutzen sollen
    collections: {
      media: true,
    },
    // Token von Vercel (wird automatisch gesetzt wenn Blob Storage hinzugefügt wird)
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
    // Client-seitige Uploads aktivieren für Dateien > 4.5MB
    clientUploads: true,
  }),
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      labels: {
        singular: 'Weiterleitung',
        plural: 'Weiterleitungen',
      },
      // @ts-expect-error - Dies ist eine gültige Überschreibung, gemappte Felder lösen sich nicht zum gleichen Typ auf
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              label: 'Von',
              admin: {
                description: 'Sie müssen die Website neu erstellen, wenn Sie dieses Feld ändern.',
              },
            }
          }
          if ('name' in field && field.name === 'to') {
            return {
              ...field,
              label: 'Zu',
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
    uploadsCollection: 'media',
    tabbedUI: true,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      labels: {
        singular: 'Formular-Einsendung',
        plural: 'Formular-Einsendungen',
      },
    },
    formOverrides: {
      labels: {
        singular: 'Formular',
        plural: 'Formulare',
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'title') {
            return {
              ...field,
              label: 'Titel',
            }
          }
          if ('name' in field && field.name === 'fields') {
            return {
              ...field,
              label: 'Formularfelder',
            }
          }
          if ('name' in field && field.name === 'submitButtonLabel') {
            return {
              ...field,
              label: 'Beschriftung Senden-Button',
            }
          }
          if ('name' in field && field.name === 'confirmationType') {
            return {
              ...field,
              label: 'Bestätigungstyp',
            }
          }
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              label: 'Bestätigungsnachricht',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      labels: {
        singular: 'Suchergebnis',
        plural: 'Suchergebnisse',
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
