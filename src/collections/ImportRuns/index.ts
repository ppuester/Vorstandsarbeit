import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const ImportRuns: CollectionConfig = {
  slug: 'import-runs',
  labels: {
    singular: 'Import-Lauf',
    plural: 'Import-Läufe',
  },
  admin: {
    useAsTitle: 'fileName',
    defaultColumns: ['importedAt', 'fileName', 'type', 'stats.created', 'stats.skipped', 'isDeleted'],
    group: 'Flugzeuge',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Typ',
      options: [{ label: 'Flugbewegungen', value: 'flights' }],
      defaultValue: 'flights',
    },
    {
      name: 'fileName',
      type: 'text',
      required: true,
      label: 'Dateiname',
    },
    {
      name: 'fileSize',
      type: 'number',
      label: 'Dateigröße (Bytes)',
    },
    {
      name: 'fileHash',
      type: 'text',
      label: 'Datei-Hash (SHA1)',
      admin: {
        description: 'SHA1 über Datei-Inhalt zur Identifikation',
      },
    },
    {
      name: 'importedAt',
      type: 'date',
      required: true,
      label: 'Importiert am',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'importedBy',
      type: 'relationship',
      relationTo: 'users' as any,
      label: 'Importiert von',
    },
    {
      name: 'year',
      type: 'number',
      label: 'Jahr',
      admin: {
        description: 'Abgeleitetes Jahr aus den importierten Daten',
      },
    },
    {
      name: 'stats',
      type: 'group',
      label: 'Statistik',
      fields: [
        { name: 'created', type: 'number', label: 'Erstellt', defaultValue: 0 },
        { name: 'updated', type: 'number', label: 'Aktualisiert', defaultValue: 0 },
        { name: 'skipped', type: 'number', label: 'Übersprungen', defaultValue: 0 },
        { name: 'errors', type: 'number', label: 'Fehler', defaultValue: 0 },
        { name: 'unmatchedMembers', type: 'number', label: 'Unzugeordnete Piloten', defaultValue: 0 },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notizen',
    },
    {
      name: 'isDeleted',
      type: 'checkbox',
      label: 'Gelöscht',
      defaultValue: false,
      admin: {
        description: 'Import wurde rückgängig gemacht (zugehörige Flüge gelöscht)',
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      label: 'Gelöscht am',
      admin: {
        condition: (data) => Boolean(data?.isDeleted),
      },
    },
    {
      name: 'deletedBy',
      type: 'relationship',
      relationTo: 'users' as any,
      label: 'Gelöscht von',
      admin: {
        condition: (data) => Boolean(data?.isDeleted),
      },
    },
    {
      name: 'deletedFlightsCount',
      type: 'number',
      label: 'Gelöschte Flüge',
      admin: {
        condition: (data) => Boolean(data?.isDeleted),
      },
    },
  ],
  timestamps: true,
}
