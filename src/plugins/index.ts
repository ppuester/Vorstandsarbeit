import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Plugin } from 'payload'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

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
]
