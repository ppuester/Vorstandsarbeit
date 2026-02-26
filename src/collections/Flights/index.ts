import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const Flights: CollectionConfig = {
  slug: 'flights',
  labels: {
    singular: 'Flug',
    plural: 'Flüge',
  },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'aircraft', 'pilot', 'flightHours', 'starts', 'createdAt'],
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
      name: 'date',
      type: 'date',
      required: true,
      label: 'Datum',
      admin: {
        description: 'Datum des Flugs',
      },
    },
    {
      name: 'aircraft',
      type: 'relationship',
      relationTo: 'aircraft' as any,
      required: false,
      label: 'Flugzeug',
      admin: {
        description: 'Leer bei Import wenn Vereins-LFZ ≠ Ja (kein Vereinsflugzeug)',
      },
    },
    {
      name: 'pilot',
      type: 'relationship',
      relationTo: 'members' as any,
      label: 'Pilot',
      admin: {
        description: 'Hauptpilot des Flugs',
      },
    },
    {
      name: 'pilotName',
      type: 'text',
      label: 'Pilot (Name)',
      admin: {
        description: 'Name des Piloten (falls nicht als Mitglied zugeordnet)',
      },
    },
    {
      name: 'copilot',
      type: 'relationship',
      relationTo: 'members' as any,
      label: 'Begleiter',
      admin: {
        description: 'Begleiter/Begleitpilot',
      },
    },
    {
      name: 'copilotName',
      type: 'text',
      label: 'Begleiter (Name)',
      admin: {
        description: 'Name des Begleiters (falls nicht als Mitglied zugeordnet)',
      },
    },
    {
      name: 'startTime',
      type: 'text',
      label: 'Startzeit',
      admin: {
        description: 'Startzeit im Format HH:MM',
      },
    },
    {
      name: 'landingTime',
      type: 'text',
      label: 'Landezeit',
      admin: {
        description: 'Landezeit im Format HH:MM',
      },
    },
    {
      name: 'flightHours',
      type: 'number',
      required: true,
      label: 'Flugstunden',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Flugdauer in Stunden',
        step: 0.01,
      },
    },
    {
      name: 'flightMinutes',
      type: 'number',
      label: 'Flugdauer (Minuten)',
      admin: {
        description: 'Flugdauer in Minuten (wird automatisch in Stunden umgerechnet)',
      },
    },
    {
      name: 'starts',
      type: 'number',
      required: true,
      label: 'Anzahl Starts',
      defaultValue: 1,
      min: 0,
      admin: {
        description: 'Anzahl der Starts (meist 1)',
      },
    },
    {
      name: 'departureLocation',
      type: 'text',
      label: 'Startort',
      admin: {
        description: 'Abflugort',
      },
    },
    {
      name: 'landingLocation',
      type: 'text',
      label: 'Landeort',
      admin: {
        description: 'Landeort',
      },
    },
    {
      name: 'landings',
      type: 'text',
      label: 'Landungen',
      admin: {
        description: 'Anzahl und Art der Landungen',
      },
    },
    {
      name: 'flightType',
      type: 'select',
      label: 'Flugart',
      options: [
        { label: 'P (Privat)', value: 'P' },
        { label: 'S (Schulung)', value: 'S' },
        { label: 'N (Sonstiges)', value: 'N' },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Bemerkungen',
      admin: {
        description: 'Zusätzliche Informationen zum Flug',
      },
    },
    // Felder für Import & Arbeitsstunden-Auswertung aus Flugbewegungen
    {
      name: 'sourceYear',
      type: 'number',
      label: 'Quell-Jahr (Import)',
      admin: {
        description: 'Jahr aus Import-Datum',
      },
    },
    {
      name: 'sourceImportId',
      type: 'text',
      label: 'Import-ID (Debug)',
      admin: {
        description: 'Optional für Dedupe/Debug',
      },
    },
    {
      name: 'sourceRowHash',
      type: 'text',
      label: 'Zeilen-Hash',
      admin: {
        description: 'Hash zur Duplikaterkennung',
      },
    },
    {
      name: 'sourceAircraftRegistration',
      type: 'text',
      label: 'Lfz. (Kennzeichen)',
      admin: {
        description: 'Inhalt aus Spalte Lfz. (Hauptflugbuch)',
      },
    },
    {
      name: 'sourceTowAircraftRegistration',
      type: 'text',
      label: 'Schlepp-LFZ (Kennzeichen)',
      admin: {
        description: 'Inhalt aus Spalte Schlepp-LFZ',
      },
    },
    {
      name: 'sourceTowMinutes',
      type: 'number',
      label: 'Schleppzeit (Minuten)',
      admin: {
        description: 'Aus Spalte Schleppzeit',
      },
    },
    {
      name: 'sourceMinutes',
      type: 'number',
      label: 'Zeit (Minuten)',
      admin: {
        description: 'Aus Spalte Zeit',
      },
    },
    {
      name: 'workingMinutesGlider',
      type: 'number',
      label: 'Arbeitsmin. Segelflug',
      admin: {
        description: 'Berechnete Segelflug-Arbeitsminuten',
      },
    },
    {
      name: 'workingMinutesMotor',
      type: 'number',
      label: 'Arbeitsmin. Motorflug',
      admin: {
        description: 'Berechnete Motorflug-Arbeitsminuten',
      },
    },
    {
      name: 'workingMinutesTow',
      type: 'number',
      label: 'Arbeitsmin. Schlepp',
      admin: {
        description: 'Berechnete Schlepp-Arbeitsminuten',
      },
    },
    {
      name: 'memberMatchStatus',
      type: 'select',
      label: 'Mitglied-Match',
      options: [
        { label: 'Zugeordnet', value: 'matched' },
        { label: 'Nicht zugeordnet', value: 'unmatched' },
        { label: 'Mehrdeutig', value: 'ambiguous' },
      ],
      admin: {
        description: 'Status der Pilot-Zuordnung',
      },
    },
    {
      name: 'memberMatchCandidates',
      type: 'array',
      label: 'Match-Kandidaten',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
        },
      ],
      admin: {
        description: 'Top-Kandidaten bei ambiguous/unmatched',
      },
    },
  ],
  timestamps: true,
  hooks: {
    beforeValidate: [
      async ({ data }: any) => {
        // Konvertiere Flugdauer von Minuten zu Stunden, falls vorhanden
        if (data.flightMinutes && !data.flightHours) {
          data.flightHours = data.flightMinutes / 60
        }
        return data
      },
    ],
  },
}
