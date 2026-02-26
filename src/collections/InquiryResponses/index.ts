import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const InquiryResponses: CollectionConfig = {
  slug: 'inquiry-responses',
  labels: {
    singular: 'Antwort',
    plural: 'Antworten',
  },
  admin: {
    useAsTitle: 'responseNumber',
    defaultColumns: ['responseNumber', 'inquiry', 'drivingSchool', 'status', 'createdAt'],
    group: 'Anfragen',
    description: 'Antworten von Fahrschulen auf Anfragen',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        if (operation === 'create' && data && !data.responseNumber) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          data.responseNumber = `ANT-${timestamp}-${random}`
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req, operation }) => {
        // Bei neuer Antwort: Anfrage-Status und Zähler aktualisieren
        if (operation === 'create' && doc.inquiry) {
          try {
            const inquiryId = typeof doc.inquiry === 'object' ? doc.inquiry.id : doc.inquiry
            
            // Zähle alle Antworten für diese Anfrage
            const responseCount = await req.payload.count({
              collection: 'inquiry-responses' as import('payload').CollectionSlug,
              where: {
                inquiry: { equals: inquiryId },
              },
            })
            
            // Aktualisiere die Anfrage
            await req.payload.update({
              collection: 'inquiries' as import('payload').CollectionSlug,
              id: inquiryId,
              data: {
                responseCount: responseCount.totalDocs,
                status: 'responded',
              } as Record<string, unknown>,
              req,
            })
          } catch (error) {
            console.error('Fehler beim Aktualisieren der Anfrage:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'responseNumber',
      type: 'text',
      label: 'Antwortnummer',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'inquiry',
      type: 'relationship',
      relationTo: 'inquiries' as import('payload').CollectionSlug,
      required: true,
      label: 'Anfrage',
      admin: {
        description: 'Die Anfrage, auf die geantwortet wird',
      },
    },
    {
      name: 'drivingSchool',
      type: 'relationship',
      relationTo: 'driving-schools' as import('payload').CollectionSlug,
      required: true,
      label: 'Fahrschule',
      admin: {
        description: 'Die antwortende Fahrschule',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Angebot',
          fields: [
            {
              name: 'greeting',
              type: 'textarea',
              label: 'Begrüßung / Einleitung',
              admin: {
                description: 'Persönliche Nachricht an den Fahrschüler',
              },
            },
            {
              name: 'availability',
              type: 'select',
              label: 'Verfügbarkeit',
              options: [
                { label: '✅ Sofort verfügbar', value: 'immediate' },
                { label: '📅 In 1-2 Wochen', value: '1-2weeks' },
                { label: '📆 In 2-4 Wochen', value: '2-4weeks' },
                { label: '⏰ Warteliste (1-2 Monate)', value: 'waitlist' },
                { label: '❌ Aktuell keine Kapazität', value: 'no-capacity' },
              ],
            },
            {
              name: 'canFulfillPreferences',
              type: 'checkbox',
              label: 'Alle Wünsche erfüllbar',
              defaultValue: true,
              admin: {
                description: 'Können alle Präferenzen des Schülers erfüllt werden?',
              },
            },
            {
              name: 'preferencesNote',
              type: 'textarea',
              label: 'Anmerkungen zu den Wünschen',
              admin: {
                condition: (data) => !data?.canFulfillPreferences,
                description: 'Falls nicht alle Wünsche erfüllt werden können',
              },
            },
          ],
        },
        {
          label: 'Preisangebot',
          fields: [
            {
              name: 'priceOffer',
              type: 'group',
              label: 'Preisdetails',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'basePrice',
                      type: 'number',
                      label: 'Grundgebühr (€)',
                      admin: { width: '33%' },
                    },
                    {
                      name: 'lessonPrice',
                      type: 'number',
                      label: 'Fahrstunde (€)',
                      admin: { width: '33%' },
                    },
                    {
                      name: 'specialLessonPrice',
                      type: 'number',
                      label: 'Sonderfahrt (€)',
                      admin: { width: '33%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'theoryMaterial',
                      type: 'number',
                      label: 'Lehrmaterial (€)',
                      admin: { width: '33%' },
                    },
                    {
                      name: 'theoryExam',
                      type: 'number',
                      label: 'Theorieprüfung (€)',
                      admin: { width: '33%' },
                    },
                    {
                      name: 'practicalExam',
                      type: 'number',
                      label: 'Praxisprüfung (€)',
                      admin: { width: '33%' },
                    },
                  ],
                },
                {
                  name: 'estimatedTotal',
                  type: 'number',
                  label: 'Geschätzte Gesamtkosten (€)',
                  admin: {
                    description: 'Basierend auf durchschnittlicher Anzahl Fahrstunden',
                  },
                },
                {
                  name: 'estimatedLessons',
                  type: 'number',
                  label: 'Geschätzte Fahrstunden',
                  admin: {
                    description: 'Durchschnittliche Anzahl benötigter Fahrstunden',
                  },
                },
              ],
            },
            {
              name: 'specialOffers',
              type: 'array',
              label: 'Sonderangebote / Rabatte',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  label: 'Angebot',
                },
                {
                  name: 'discount',
                  type: 'text',
                  label: 'Rabatt / Wert',
                },
                {
                  name: 'validUntil',
                  type: 'date',
                  label: 'Gültig bis',
                },
              ],
            },
            {
              name: 'paymentOptions',
              type: 'select',
              hasMany: true,
              label: 'Zahlungsoptionen',
              options: [
                { label: 'Einmalzahlung', value: 'single' },
                { label: 'Ratenzahlung', value: 'installments' },
                { label: 'Zahlung pro Fahrstunde', value: 'per-lesson' },
                { label: 'Bildungsgutschein', value: 'voucher' },
                { label: 'EC-Karte', value: 'ec' },
                { label: 'Kreditkarte', value: 'credit-card' },
                { label: 'Überweisung', value: 'transfer' },
                { label: 'Bar', value: 'cash' },
              ],
            },
          ],
        },
        {
          label: 'Zusätzliche Infos',
          fields: [
            {
              name: 'nextSteps',
              type: 'richText',
              label: 'Nächste Schritte',
              admin: {
                description: 'Was der Fahrschüler als nächstes tun soll',
              },
            },
            {
              name: 'additionalServices',
              type: 'array',
              label: 'Zusätzliche Leistungen',
              fields: [
                {
                  name: 'service',
                  type: 'text',
                  required: true,
                  label: 'Leistung',
                },
                {
                  name: 'included',
                  type: 'checkbox',
                  label: 'Im Preis enthalten',
                },
                {
                  name: 'price',
                  type: 'number',
                  label: 'Preis (€)',
                  admin: {
                    condition: (data, siblingData) => !siblingData?.included,
                  },
                },
              ],
            },
            {
              name: 'freeTrialLesson',
              type: 'checkbox',
              label: 'Kostenlose Probestunde anbieten',
            },
            {
              name: 'attachments',
              type: 'array',
              label: 'Anhänge',
              fields: [
                {
                  name: 'file',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  label: 'Datei',
                },
                {
                  name: 'description',
                  type: 'text',
                  label: 'Beschreibung',
                },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'sent',
      options: [
        { label: '📤 Gesendet', value: 'sent' },
        { label: '👁️ Gelesen', value: 'read' },
        { label: '⭐ Favorisiert', value: 'favorited' },
        { label: '✅ Angenommen', value: 'accepted' },
        { label: '❌ Abgelehnt', value: 'declined' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'readAt',
      type: 'date',
      label: 'Gelesen am',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'contactPerson',
      type: 'text',
      label: 'Ansprechpartner',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'directPhone',
      type: 'text',
      label: 'Direkter Kontakt',
      admin: {
        position: 'sidebar',
        description: 'Telefon/WhatsApp für Rückfragen',
      },
    },
  ],
}
