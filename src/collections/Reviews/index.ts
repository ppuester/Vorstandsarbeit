import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: {
    singular: 'Bewertung',
    plural: 'Bewertungen',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'drivingSchool', 'rating', 'approved', 'createdAt'],
    group: 'Fahrschulen',
  },
  access: {
    create: () => true, // Jeder kann Bewertungen erstellen
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'drivingSchool',
      type: 'relationship',
      relationTo: 'driving-schools',
      required: true,
      label: 'Fahrschule',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titel',
      maxLength: 100,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      label: 'Gesamtbewertung',
      min: 1,
      max: 5,
    },
    {
      name: 'ratings',
      type: 'group',
      label: 'Detailbewertungen',
      fields: [
        {
          name: 'theory',
          type: 'number',
          label: 'Theorieunterricht',
          min: 1,
          max: 5,
        },
        {
          name: 'practice',
          type: 'number',
          label: 'Praxisunterricht',
          min: 1,
          max: 5,
        },
        {
          name: 'friendliness',
          type: 'number',
          label: 'Freundlichkeit',
          min: 1,
          max: 5,
        },
        {
          name: 'pricePerformance',
          type: 'number',
          label: 'Preis-Leistung',
          min: 1,
          max: 5,
        },
        {
          name: 'flexibility',
          type: 'number',
          label: 'Flexibilität',
          min: 1,
          max: 5,
        },
      ],
    },
    {
      name: 'licenseClass',
      type: 'select',
      label: 'Führerscheinklasse',
      options: [
        { label: 'B - PKW', value: 'B' },
        { label: 'A - Motorrad', value: 'A' },
        { label: 'A1', value: 'A1' },
        { label: 'A2', value: 'A2' },
        { label: 'AM', value: 'AM' },
        { label: 'BE', value: 'BE' },
        { label: 'Andere', value: 'other' },
      ],
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
      label: 'Bewertungstext',
      minLength: 50,
      maxLength: 2000,
    },
    {
      name: 'pros',
      type: 'array',
      label: 'Vorteile',
      maxRows: 5,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'cons',
      type: 'array',
      label: 'Nachteile',
      maxRows: 5,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'recommendationScore',
      type: 'number',
      label: 'Weiterempfehlung (%)',
      min: 0,
      max: 100,
      admin: {
        description: 'Wie wahrscheinlich würden Sie diese Fahrschule weiterempfehlen?',
      },
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      label: 'Name',
      admin: {
        description: 'Wird öffentlich angezeigt',
      },
    },
    {
      name: 'authorEmail',
      type: 'email',
      required: true,
      label: 'E-Mail',
      admin: {
        description: 'Wird nicht öffentlich angezeigt',
      },
    },
    {
      name: 'approved',
      type: 'checkbox',
      label: 'Freigegeben',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Bewertung wird erst nach Freigabe angezeigt',
      },
    },
    {
      name: 'helpful',
      type: 'number',
      label: 'Hilfreich-Stimmen',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Führerschein erhalten am',
      admin: {
        description: 'Wann wurde die Ausbildung abgeschlossen?',
      },
    },
  ],
  timestamps: true,
}
