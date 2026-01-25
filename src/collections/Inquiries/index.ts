import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: {
    singular: 'Anfrage',
    plural: 'Anfragen',
  },
  admin: {
    useAsTitle: 'inquiryNumber',
    defaultColumns: ['inquiryNumber', 'studentName', 'licenseClass', 'status', 'createdAt'],
    group: 'Anfragen',
    description: 'Anfragen von Fahrschülern an Fahrschulen',
  },
  access: {
    // Jeder kann Anfragen erstellen (Frontend-Formular)
    create: () => true,
    // Nur authentifizierte Benutzer können lesen/bearbeiten
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  hooks: {
    beforeValidate: [
      async ({ data, operation }) => {
        // Automatische Anfragenummer generieren
        if (operation === 'create' && data && !data.inquiryNumber) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          data.inquiryNumber = `ANF-${timestamp}-${random}`
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, operation }) => {
        // Bei neuer Anfrage: E-Mail-Benachrichtigung an Fahrschulen senden (optional)
        if (operation === 'create') {
          // TODO: E-Mail-Benachrichtigung implementieren
          console.log(`Neue Anfrage erstellt: ${doc.inquiryNumber}`)
        }
      },
    ],
  },
  fields: [
    {
      name: 'inquiryNumber',
      type: 'text',
      label: 'Anfragenummer',
      unique: true,
      admin: {
        readOnly: true,
        description: 'Wird automatisch generiert',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Schüler-Daten',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'studentName',
                  type: 'text',
                  required: true,
                  label: 'Name',
                  admin: { width: '50%' },
                },
                {
                  name: 'studentEmail',
                  type: 'email',
                  required: true,
                  label: 'E-Mail',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'studentPhone',
                  type: 'text',
                  label: 'Telefon (optional)',
                  admin: { width: '50%' },
                },
                {
                  name: 'studentAge',
                  type: 'number',
                  label: 'Alter',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'studentCity',
              type: 'text',
              required: true,
              label: 'Stadt/PLZ',
              admin: {
                description: 'Wohnort des Fahrschülers',
              },
            },
          ],
        },
        {
          label: 'Führerschein-Wunsch',
          fields: [
            {
              name: 'licenseClass',
              type: 'select',
              required: true,
              label: 'Gewünschte Führerscheinklasse',
              options: [
                { label: 'B - PKW', value: 'B' },
                { label: 'B197 - PKW Automatik/Schaltung', value: 'B197' },
                { label: 'BF17 - Begleitetes Fahren', value: 'BF17' },
                { label: 'A - Motorrad', value: 'A' },
                { label: 'A1 - Leichtkrafträder', value: 'A1' },
                { label: 'A2 - Mittelschwere Motorräder', value: 'A2' },
                { label: 'AM - Moped/Roller', value: 'AM' },
                { label: 'BE - PKW mit Anhänger', value: 'BE' },
                { label: 'C - LKW', value: 'C' },
                { label: 'CE - LKW mit Anhänger', value: 'CE' },
                { label: 'D - Bus', value: 'D' },
                { label: 'T - Traktor', value: 'T' },
              ],
            },
            {
              name: 'preferredStart',
              type: 'select',
              label: 'Wann möchtest du anfangen?',
              options: [
                { label: 'So schnell wie möglich', value: 'asap' },
                { label: 'In 1-2 Wochen', value: '1-2weeks' },
                { label: 'In 1 Monat', value: '1month' },
                { label: 'In 2-3 Monaten', value: '2-3months' },
                { label: 'Später / Noch unentschlossen', value: 'later' },
              ],
            },
            {
              name: 'courseType',
              type: 'select',
              label: 'Bevorzugte Kursart',
              options: [
                { label: 'Regulärer Kurs', value: 'regular' },
                { label: 'Intensivkurs / Ferienkurs', value: 'intensive' },
                { label: 'Wochenendkurs', value: 'weekend' },
                { label: 'Abendkurs', value: 'evening' },
                { label: 'Flexibel', value: 'flexible' },
              ],
            },
            {
              name: 'hasFirstAid',
              type: 'checkbox',
              label: 'Erste-Hilfe-Kurs bereits absolviert',
            },
            {
              name: 'hasEyeTest',
              type: 'checkbox',
              label: 'Sehtest bereits absolviert',
            },
            {
              name: 'preferences',
              type: 'select',
              hasMany: true,
              label: 'Besondere Wünsche',
              options: [
                { label: 'Online-Theorie', value: 'online-theory' },
                { label: 'Automatik-Fahrzeug', value: 'automatic' },
                { label: 'Fahrsimulator', value: 'simulator' },
                { label: 'Elektro-Fahrzeug', value: 'electric' },
                { label: 'Fremdsprache benötigt', value: 'foreign-language' },
              ],
            },
            {
              name: 'preferredLanguage',
              type: 'select',
              label: 'Bevorzugte Unterrichtssprache',
              admin: {
                condition: (data) => data?.preferences?.includes('foreign-language'),
              },
              options: [
                { label: 'Deutsch', value: 'de' },
                { label: 'Englisch', value: 'en' },
                { label: 'Türkisch', value: 'tr' },
                { label: 'Arabisch', value: 'ar' },
                { label: 'Russisch', value: 'ru' },
                { label: 'Andere', value: 'other' },
              ],
            },
          ],
        },
        {
          label: 'Nachricht & Budget',
          fields: [
            {
              name: 'message',
              type: 'textarea',
              label: 'Deine Nachricht an die Fahrschulen',
              admin: {
                description: 'Teile den Fahrschulen weitere Details mit (optional)',
              },
            },
            {
              name: 'budgetRange',
              type: 'select',
              label: 'Budget-Rahmen',
              options: [
                { label: 'Unter 2.000 €', value: 'under-2000' },
                { label: '2.000 - 2.500 €', value: '2000-2500' },
                { label: '2.500 - 3.000 €', value: '2500-3000' },
                { label: '3.000 - 3.500 €', value: '3000-3500' },
                { label: 'Über 3.500 €', value: 'over-3500' },
                { label: 'Keine Angabe', value: 'no-preference' },
              ],
            },
          ],
        },
        {
          label: 'Angefragte Fahrschulen',
          fields: [
            {
              name: 'drivingSchools',
              type: 'relationship',
              relationTo: 'driving-schools',
              hasMany: true,
              required: true,
              label: 'Angefragte Fahrschulen',
              admin: {
                description: 'Diese Fahrschulen erhalten die Anfrage',
              },
            },
          ],
        },
      ],
    },
    // Sidebar Fields
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      defaultValue: 'pending',
      options: [
        { label: '⏳ Offen', value: 'pending' },
        { label: '📬 Antworten erhalten', value: 'responded' },
        { label: '✅ Abgeschlossen', value: 'closed' },
        { label: '❌ Storniert', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'responseCount',
      type: 'number',
      label: 'Anzahl Antworten',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'accessToken',
      type: 'text',
      label: 'Zugangstoken',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Für Schüler-Zugang ohne Login',
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            if (operation === 'create' && !value) {
              // Generiere sicheren Token
              const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
              let token = ''
              for (let i = 0; i < 32; i++) {
                token += chars.charAt(Math.floor(Math.random() * chars.length))
              }
              return token
            }
            return value
          },
        ],
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Gültig bis',
      admin: {
        position: 'sidebar',
        description: 'Anfrage verfällt nach diesem Datum',
      },
      hooks: {
        beforeValidate: [
          ({ value, operation }) => {
            if (operation === 'create' && !value) {
              // Anfrage 30 Tage gültig
              const expires = new Date()
              expires.setDate(expires.getDate() + 30)
              return expires.toISOString()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'privacyAccepted',
      type: 'checkbox',
      label: 'Datenschutz akzeptiert',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
