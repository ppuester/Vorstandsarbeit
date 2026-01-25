import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const Aircraft: CollectionConfig = {
  slug: 'aircraft',
  labels: {
    singular: 'Flugzeug',
    plural: 'Flugzeuge',
  },
  admin: {
    useAsTitle: 'registration',
    defaultColumns: ['registration', 'type', 'aircraftGroup', 'active'],
    group: 'Flugzeuge',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'registration',
      type: 'text',
      required: true,
      label: 'Kennzeichen',
      admin: {
        description: 'Offizielles Kennzeichen des Flugzeugs (z.B. D-ABCD)',
      },
    },
    {
      name: 'name',
      type: 'text',
      label: 'Name/Bezeichnung',
      admin: {
        description: 'Optional: Zusätzliche Bezeichnung oder Name',
      },
    },
    {
      name: 'aircraftGroup',
      type: 'select',
      required: true,
      label: 'Flugzeugtyp',
      options: [
        { label: 'UL (Ultraleicht)', value: 'ul' },
        { label: 'Segelflugzeug', value: 'glider' },
        { label: 'Motorflugzeug', value: 'motor' },
        { label: 'Motorsegler', value: 'motor-glider' },
        { label: 'Hubschrauber', value: 'helicopter' },
        { label: 'Sonstiges', value: 'other' },
      ],
      defaultValue: 'motor',
      admin: {
        description: 'Hauptkategorie des Flugzeugs',
      },
    },
    {
      name: 'manufacturer',
      type: 'text',
      label: 'Hersteller',
      admin: {
        description: 'Hersteller des Flugzeugs (z.B. Cessna, Piper, etc.)',
      },
    },
    {
      name: 'model',
      type: 'text',
      label: 'Modell',
      admin: {
        description: 'Modellbezeichnung (z.B. C172, PA-28, etc.)',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Stammdaten',
          fields: [
            {
              name: 'purchaseDate',
              type: 'date',
              label: 'Kaufdatum',
              admin: {
                description: 'Datum des Erwerbs',
              },
            },
            {
              name: 'purchasePrice',
              type: 'number',
              label: 'Kaufpreis (€)',
              admin: {
                description: 'Anschaffungspreis des Flugzeugs',
                step: 0.01,
              },
            },
            {
              name: 'insurance',
              type: 'number',
              label: 'Versicherung p.a. (€)',
              admin: {
                description: 'Jährliche Versicherungskosten',
                step: 0.01,
              },
            },
            {
              name: 'hangar',
              type: 'number',
              label: 'Hangar/Standplatz p.a. (€)',
              admin: {
                description: 'Jährliche Kosten für Hangar oder Standplatz',
                step: 0.01,
              },
            },
            {
              name: 'annualInspection',
              type: 'number',
              label: 'Jährliche Inspektion (€)',
              admin: {
                description: 'Durchschnittliche Kosten für jährliche Inspektion',
                step: 0.01,
              },
            },
            {
              name: 'fixedCosts',
              type: 'number',
              label: 'Weitere Fixkosten p.a. (€)',
              admin: {
                description: 'Sonstige jährliche Fixkosten',
                step: 0.01,
              },
            },
          ],
        },
        {
          label: 'Betriebsdaten',
          fields: [
            {
              name: 'engineHours',
              type: 'number',
              label: 'Motorstunden (Gesamt)',
              admin: {
                description: 'Aktuelle Gesamtmotorstunden',
                step: 0.01,
              },
            },
            {
              name: 'totalFlightHours',
              type: 'number',
              label: 'Gesamtflugstunden',
              admin: {
                description: 'Aktuelle Gesamtflugstunden',
                step: 0.01,
              },
            },
            {
              name: 'fuelConsumption',
              type: 'number',
              label: 'Kraftstoffverbrauch (l/h)',
              admin: {
                description: 'Durchschnittlicher Kraftstoffverbrauch pro Stunde',
                step: 0.01,
              },
            },
            {
              name: 'fuelPrice',
              type: 'number',
              label: 'Kraftstoffpreis (€/l)',
              admin: {
                description: 'Aktueller Kraftstoffpreis pro Liter',
                step: 0.01,
              },
            },
            {
              name: 'maintenanceCostPerHour',
              type: 'number',
              label: 'Wartungskosten pro Stunde (€)',
              admin: {
                description: 'Durchschnittliche Wartungskosten pro Flugstunde',
                step: 0.01,
              },
            },
          ],
        },
        {
          label: 'Weitere Informationen',
          fields: [
            {
              name: 'notes',
              type: 'textarea',
              label: 'Notizen',
              admin: {
                description: 'Zusätzliche Informationen zum Flugzeug',
              },
            },
            {
              name: 'active',
              type: 'checkbox',
              label: 'Aktiv',
              defaultValue: true,
              admin: {
                description: 'Flugzeug ist aktiv im Betrieb',
              },
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
