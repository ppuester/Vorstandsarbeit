import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

export const DrivingSchools: CollectionConfig = {
  slug: 'driving-schools',
  labels: {
    singular: 'Fahrschule',
    plural: 'Fahrschulen',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'rating', 'verified', '_status'],
    group: 'Fahrschulen',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name der Fahrschule',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Bilder',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Kontakt & Standort',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'street',
                  type: 'text',
                  required: true,
                  label: 'Straße & Hausnummer',
                  admin: { width: '50%' },
                },
                {
                  name: 'postalCode',
                  type: 'text',
                  required: true,
                  label: 'PLZ',
                  admin: { width: '25%' },
                },
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                  label: 'Stadt',
                  admin: { width: '25%' },
                },
              ],
            },
            {
              name: 'state',
              type: 'select',
              label: 'Bundesland',
              required: true,
              options: [
                { label: 'Baden-Württemberg', value: 'BW' },
                { label: 'Bayern', value: 'BY' },
                { label: 'Berlin', value: 'BE' },
                { label: 'Brandenburg', value: 'BB' },
                { label: 'Bremen', value: 'HB' },
                { label: 'Hamburg', value: 'HH' },
                { label: 'Hessen', value: 'HE' },
                { label: 'Mecklenburg-Vorpommern', value: 'MV' },
                { label: 'Niedersachsen', value: 'NI' },
                { label: 'Nordrhein-Westfalen', value: 'NW' },
                { label: 'Rheinland-Pfalz', value: 'RP' },
                { label: 'Saarland', value: 'SL' },
                { label: 'Sachsen', value: 'SN' },
                { label: 'Sachsen-Anhalt', value: 'ST' },
                { label: 'Schleswig-Holstein', value: 'SH' },
                { label: 'Thüringen', value: 'TH' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Telefon',
                  admin: { width: '50%' },
                },
                {
                  name: 'email',
                  type: 'email',
                  label: 'E-Mail',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'website',
              type: 'text',
              label: 'Website',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'latitude',
                  type: 'number',
                  label: 'Breitengrad',
                  admin: {
                    width: '50%',
                    description: 'Für Kartenanzeige (optional)',
                  },
                },
                {
                  name: 'longitude',
                  type: 'number',
                  label: 'Längengrad',
                  admin: {
                    width: '50%',
                    description: 'Für Kartenanzeige (optional)',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Angebot',
          fields: [
            {
              name: 'licenseClasses',
              type: 'select',
              hasMany: true,
              required: true,
              label: 'Führerscheinklassen',
              options: [
                { label: 'AM - Moped/Roller', value: 'AM' },
                { label: 'A1 - Leichtkrafträder', value: 'A1' },
                { label: 'A2 - Mittelschwere Motorräder', value: 'A2' },
                { label: 'A - Motorräder', value: 'A' },
                { label: 'B - PKW', value: 'B' },
                { label: 'B197 - PKW Automatik/Schaltung', value: 'B197' },
                { label: 'B196 - Leichtkrafträder für B', value: 'B196' },
                { label: 'BE - PKW mit Anhänger', value: 'BE' },
                { label: 'B96 - Anhänger bis 4.250 kg', value: 'B96' },
                { label: 'C1 - LKW bis 7,5t', value: 'C1' },
                { label: 'C - LKW', value: 'C' },
                { label: 'CE - LKW mit Anhänger', value: 'CE' },
                { label: 'D1 - Kleinbus', value: 'D1' },
                { label: 'D - Bus', value: 'D' },
                { label: 'L - Land- und Forstwirtschaft', value: 'L' },
                { label: 'T - Land- und Forstwirtschaft', value: 'T' },
              ],
            },
            {
              name: 'languages',
              type: 'select',
              hasMany: true,
              label: 'Unterrichtssprachen',
              defaultValue: ['de'],
              options: [
                { label: 'Deutsch', value: 'de' },
                { label: 'Englisch', value: 'en' },
                { label: 'Türkisch', value: 'tr' },
                { label: 'Arabisch', value: 'ar' },
                { label: 'Russisch', value: 'ru' },
                { label: 'Polnisch', value: 'pl' },
                { label: 'Spanisch', value: 'es' },
                { label: 'Französisch', value: 'fr' },
                { label: 'Italienisch', value: 'it' },
                { label: 'Portugiesisch', value: 'pt' },
              ],
            },
            {
              name: 'features',
              type: 'select',
              hasMany: true,
              label: 'Besonderheiten',
              options: [
                { label: 'Online-Theorie', value: 'online-theory' },
                { label: 'Intensivkurse', value: 'intensive' },
                { label: 'Ferienkurse', value: 'holiday-courses' },
                { label: 'Fahrsimulator', value: 'simulator' },
                { label: 'Automatik-Fahrzeuge', value: 'automatic' },
                { label: 'Elektro-Fahrzeuge', value: 'electric' },
                { label: 'Behindertengerecht', value: 'accessible' },
                { label: 'Erste-Hilfe-Kurs', value: 'first-aid' },
                { label: 'Sehtest vor Ort', value: 'eye-test' },
                { label: 'Passbilder vor Ort', value: 'photos' },
                { label: 'Auffrischungskurse', value: 'refresher' },
                { label: 'ASF-Kurse', value: 'asf' },
                { label: 'Wochenendkurse', value: 'weekend' },
                { label: 'Abendkurse', value: 'evening' },
              ],
            },
            {
              name: 'vehicleTypes',
              type: 'select',
              hasMany: true,
              label: 'Fahrzeugtypen',
              options: [
                { label: 'Schaltgetriebe', value: 'manual' },
                { label: 'Automatik', value: 'automatic' },
                { label: 'Elektro', value: 'electric' },
                { label: 'Hybrid', value: 'hybrid' },
              ],
            },
          ],
        },
        {
          label: 'Preise',
          fields: [
            {
              name: 'priceRange',
              type: 'select',
              label: 'Preiskategorie',
              options: [
                { label: '€ - Günstig', value: 'budget' },
                { label: '€€ - Mittel', value: 'medium' },
                { label: '€€€ - Gehoben', value: 'premium' },
              ],
            },
            {
              name: 'prices',
              type: 'array',
              label: 'Preisliste',
              fields: [
                {
                  name: 'licenseClass',
                  type: 'select',
                  required: true,
                  label: 'Führerscheinklasse',
                  options: [
                    { label: 'B - PKW', value: 'B' },
                    { label: 'A - Motorrad', value: 'A' },
                    { label: 'A1', value: 'A1' },
                    { label: 'A2', value: 'A2' },
                    { label: 'AM', value: 'AM' },
                    { label: 'BE', value: 'BE' },
                  ],
                },
                {
                  name: 'basePrice',
                  type: 'number',
                  label: 'Grundgebühr (€)',
                },
                {
                  name: 'lessonPrice',
                  type: 'number',
                  label: 'Fahrstunde (€)',
                },
                {
                  name: 'examPrice',
                  type: 'number',
                  label: 'Prüfungsgebühr (€)',
                },
              ],
            },
          ],
        },
        {
          label: 'Öffnungszeiten',
          fields: [
            {
              name: 'openingHours',
              type: 'array',
              label: 'Öffnungszeiten',
              fields: [
                {
                  name: 'day',
                  type: 'select',
                  required: true,
                  label: 'Tag',
                  options: [
                    { label: 'Montag', value: 'monday' },
                    { label: 'Dienstag', value: 'tuesday' },
                    { label: 'Mittwoch', value: 'wednesday' },
                    { label: 'Donnerstag', value: 'thursday' },
                    { label: 'Freitag', value: 'friday' },
                    { label: 'Samstag', value: 'saturday' },
                    { label: 'Sonntag', value: 'sunday' },
                  ],
                },
                {
                  name: 'openTime',
                  type: 'text',
                  label: 'Öffnet',
                  admin: { placeholder: '09:00' },
                },
                {
                  name: 'closeTime',
                  type: 'text',
                  label: 'Schließt',
                  admin: { placeholder: '18:00' },
                },
                {
                  name: 'closed',
                  type: 'checkbox',
                  label: 'Geschlossen',
                },
              ],
            },
          ],
        },
        {
          label: 'Beschreibung',
          fields: [
            {
              name: 'shortDescription',
              type: 'textarea',
              label: 'Kurzbeschreibung',
              maxLength: 300,
              admin: {
                description: 'Wird in Suchergebnissen angezeigt (max. 300 Zeichen)',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Ausführliche Beschreibung',
            },
          ],
        },
        {
          label: 'Checkliste',
          fields: [
            {
              name: 'checklist',
              type: 'array',
              label: 'Checkliste - Was wird benötigt',
              admin: {
                description: 'Liste der benötigten Dokumente und Voraussetzungen für die Anmeldung',
              },
              fields: [
                {
                  name: 'item',
                  type: 'text',
                  required: true,
                  label: 'Checkliste-Item',
                  admin: {
                    placeholder: 'z.B. Sehtest, Erste-Hilfe-Kurs, etc.',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Beschreibung (optional)',
                  admin: {
                    placeholder: 'Zusätzliche Informationen zu diesem Item',
                  },
                },
                {
                  name: 'required',
                  type: 'checkbox',
                  label: 'Erforderlich',
                  defaultValue: true,
                  admin: {
                    description: 'Ist dieses Item zwingend erforderlich?',
                  },
                },
                {
                  name: 'category',
                  type: 'select',
                  label: 'Kategorie',
                  defaultValue: 'general',
                  options: [
                    { label: 'Allgemein', value: 'general' },
                    { label: 'Dokumente', value: 'documents' },
                    { label: 'Kurse', value: 'courses' },
                    { label: 'Untersuchungen', value: 'examinations' },
                    { label: 'Sonstiges', value: 'other' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    // Sidebar Fields
    {
      name: 'rating',
      type: 'number',
      label: 'Durchschnittsbewertung',
      min: 0,
      max: 5,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Wird automatisch aus Bewertungen berechnet',
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      label: 'Anzahl Bewertungen',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'verified',
      type: 'checkbox',
      label: 'Verifiziert',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Fahrschule wurde überprüft',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Hervorgehoben',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'In Suchergebnissen priorisieren',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Veröffentlicht am',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL-Slug',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Wird für die URL der Fahrschule verwendet',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ data, value }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[äöüß]/g, (char: string) => {
                  const map: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }
                  return map[char] || char
                })
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
            }
            return value
          },
        ],
      },
    },
  ],
}
