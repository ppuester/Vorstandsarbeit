import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import crypto from 'crypto'
import { matchMemberByName, type MemberForMatch } from '@/utilities/memberMatching'
import {
  computeWorkingMinutesFromRow,
  type AircraftGroup,
  type RowForWorkingMinutes,
} from '@/utilities/workingMinutesFromFlights'

export const runtime = 'nodejs'

const CANONICAL_KEYS = [
  'vereinsLfz',
  'datum',
  'lfz',
  'pilot',
  'begleiterFi',
  'start',
  'zeit',
  'schleppzeit',
  'schleppLfz',
  'startort',
  'landung',
  'landeort',
  'bemerkung',
] as const

const HAUPFLUGBUCH_ALIASES: Record<string, string[]> = {
  vereinsLfz: ['vereins-lfz', 'vereins lfz', 'vereinslfz'],
  datum: ['datum'],
  lfz: ['lfz', 'lfz.', 'kennzeichen'],
  pilot: ['pilot'],
  begleiterFi: ['begleiter/fi', 'begleiter fi', 'begleiterfi'],
  start: ['start'],
  zeit: ['zeit'],
  schleppzeit: ['schleppzeit'],
  schleppLfz: ['schlepp-lfz', 'schlepp lfz', 'schlepplfz'],
  startort: ['startort', 'start ort'],
  landung: ['landung'],
  landeort: ['landeort', 'lande ort'],
  bemerkung: ['bemerkung', 'notiz'],
}

function normalizeHeader(h: string): string {
  return String(h)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
}

function buildNormalizedToCanonical(headers: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  const normalizedHeaders = headers.map(normalizeHeader)
  for (const [canonical, aliases] of Object.entries(HAUPFLUGBUCH_ALIASES)) {
    const idx = normalizedHeaders.findIndex((h) =>
      aliases.some(
        (a) =>
          h === a ||
          h.replace(/\s|-/g, '') === a.replace(/\s|-/g, '')
      )
    )
    if (idx >= 0) out[normalizedHeaders[idx]!] = canonical
  }
  return out
}

interface ParsedRow {
  vereinsLfz: string
  datum: string
  lfz: string
  pilot: string
  begleiterFi: string
  start: string
  zeit: string
  schleppzeit: string
  schleppLfz: string
  startort: string
  landung: string
  landeort: string
  bemerkung: string
}

function getRowValuesFromRecord(
  row: Record<string, string | number | null>,
  normalizedToCanonical: Record<string, string>
): ParsedRow {
  const parsed: Record<string, string> = {}
  for (const k of CANONICAL_KEYS) parsed[k] = ''
  for (const [k, v] of Object.entries(row)) {
    const n = normalizeHeader(k)
    const canon = normalizedToCanonical[n]
    if (canon) parsed[canon] = String(v ?? '').trim()
  }
  return parsed as unknown as ParsedRow
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || !String(dateStr).trim()) return null
  const cleaned = String(dateStr).trim()
  const parts = cleaned.split('.')
  if (parts.length !== 3) return null
  const day = parseInt(parts[0]!, 10)
  const month = parseInt(parts[1]!, 10) - 1
  let year = parseInt(parts[2]!, 10)
  if (year < 100) year = year < 50 ? 2000 + year : 1900 + year
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null
  const date = new Date(year, month, day)
  if (Number.isNaN(date.getTime())) return null
  return date
}

function normalizeTimeHHMM(timeStr: string): string {
  if (!timeStr || !String(timeStr).trim()) return ''
  const parts = String(timeStr).trim().split(/[.:]/)
  if (parts.length < 2) return ''
  const h = parseInt(parts[0]!, 10)
  const m = parseInt(parts[1]!, 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || !String(timeStr).trim()) return null
  const parts = String(timeStr).trim().split(/[.:]/)
  if (parts.length < 2) return null
  const hours = parseInt(parts[0]!, 10)
  const minutes = parseInt(parts[1]!, 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

function calculateFlightDuration(startTime: string, landingTime: string): number | null {
  const start = parseTimeToMinutes(startTime)
  const landing = parseTimeToMinutes(landingTime)
  if (start === null || landing === null) return null
  let duration = landing - start
  if (duration < 0) duration += 24 * 60
  return duration
}

function normalizePilotForHash(pilot: string): string {
  return (pilot ?? '').trim().replace(/\s+/g, ' ')
}

function buildRowHash(
  values: {
    lfz: string
    pilot: string
    start: string
    landung: string
    startort: string
    landeort: string
    schleppLfz: string
    timeMinutes: number
    towTimeMinutes: number
  },
  date: Date | null
): string {
  const isoDate = date ? date.toISOString().slice(0, 10) : ''
  const s = [
    isoDate,
    (values.lfz ?? '').trim().toUpperCase(),
    normalizePilotForHash(values.pilot ?? ''),
    normalizeTimeHHMM(values.start ?? ''),
    normalizeTimeHHMM(values.landung ?? ''),
    String(values.timeMinutes),
    String(values.towTimeMinutes),
    (values.schleppLfz ?? '').trim().toUpperCase(),
    (values.startort ?? '').trim(),
    (values.landeort ?? '').trim(),
  ].join('|')
  return crypto.createHash('sha1').update(s, 'utf8').digest('hex')
}

export interface ChunkImportError {
  rowIndexGlobal: number
  reason: string
  raw: {
    Datum?: string
    Start?: string
    Landung?: string
    Lfz?: string
    Pilot?: string
    Zeit?: string
    Schleppzeit?: string
    'Schlepp-LFZ'?: string
  }
}

export interface ChunkImportBody {
  importRunId?: string
  fileName: string
  year?: number
  headers: string[]
  rows: Array<Record<string, string | number | null>>
  chunkIndex: number
  totalChunks: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChunkImportBody
    const {
      importRunId: bodyImportRunId,
      fileName: sourceFileName,
      year: bodyYear,
      headers,
      rows,
      chunkIndex,
      totalChunks,
    } = body

    if (!headers?.length || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: 'headers und rows (Array) erforderlich' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })
    const normalizedToCanonical = buildNormalizedToCanonical(headers)

    if (normalizedToCanonical['datum'] === undefined || normalizedToCanonical['lfz'] === undefined) {
      return NextResponse.json(
        {
          error:
            'Erforderliche Spalten "Datum" und "Lfz." nicht gefunden (Hauptflugbuch-Format)',
        },
        { status: 400 }
      )
    }

    let importRunId = bodyImportRunId

    if (!importRunId) {
      const importRunDoc = await payload.create({
        collection: 'import-runs' as CollectionSlug,
        data: {
          type: 'flights',
          fileName: sourceFileName,
          importedAt: new Date().toISOString(),
          stats: {
            created: 0,
            updated: 0,
            skipped: 0,
            errors: 0,
            unmatchedMembers: 0,
          },
        },
        overrideAccess: true,
      })
      importRunId = importRunDoc.id as string
    }

    const membersRes = await payload.find({
      collection: 'members' as CollectionSlug,
      limit: 10000,
      depth: 0,
    })
    const members: MemberForMatch[] = (membersRes.docs || []).map((d) => ({
      id: String((d as { id: string }).id),
      name: String((d as { name?: string | null }).name ?? ''),
    }))

    const aircraftRes = await payload.find({
      collection: 'aircraft' as CollectionSlug,
      limit: 500,
      depth: 0,
    })
    const aircraftList = aircraftRes.docs as Array<{
      id: string
      registration?: string
      aircraftGroup?: string
    }>

    function findAircraftByRegistration(registration: string): {
      id: string
      aircraftGroup: AircraftGroup
    } | null {
      if (!registration || !String(registration).trim()) return null
      const cleaned = String(registration).trim().toUpperCase()
      const found = aircraftList.find((a) =>
        (a.registration ?? '')
          .toUpperCase()
          .includes(cleaned)
      )
      if (!found) return null
      return {
        id: found.id,
        aircraftGroup: (found.aircraftGroup as AircraftGroup) ?? 'other',
      }
    }

    let created = 0
    let skipped = 0
    let skippedNonClub = 0
    let skippedUnknownAircraft = 0
    const errors: ChunkImportError[] = []
    const flightLogsMap = new Map<string, { starts: number; flightHours: number }>()
    const CHUNK_SIZE = 500
    const baseRowIndex = chunkIndex * CHUNK_SIZE

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowIndexGlobal = baseRowIndex + i
      const raw = getRowValuesFromRecord(row ?? {}, normalizedToCanonical)
      const rawForError = {
        Datum: raw.datum,
        Start: raw.start,
        Landung: raw.landung,
        Lfz: raw.lfz,
        Pilot: raw.pilot,
        Zeit: raw.zeit,
        Schleppzeit: raw.schleppzeit,
        'Schlepp-LFZ': raw.schleppLfz,
      }

      try {
        const clubFlag = (raw.vereinsLfz ?? '').trim().toLowerCase()
        if (clubFlag !== '' && clubFlag !== 'ja') {
          skippedNonClub++
          continue
        }

        const aircraftForRow = findAircraftByRegistration(raw.lfz)
        if (!aircraftForRow) {
          skippedUnknownAircraft++
          continue
        }

        if (!raw.datum || !raw.lfz || !raw.pilot) {
          errors.push({
            rowIndexGlobal,
            reason: 'Datum, Lfz. oder Pilot fehlt',
            raw: rawForError,
          })
          skipped++
          continue
        }

        const date = parseDate(raw.datum)
        if (!date) {
          errors.push({
            rowIndexGlobal,
            reason: `Ungültiges Datum "${raw.datum}"`,
            raw: rawForError,
          })
          skipped++
          continue
        }

        let timeMinutes: number
        let towTimeMinutes: number
        const zeitStr = (raw.zeit ?? '').trim()
        const schleppzeitStr = (raw.schleppzeit ?? '').trim()
        if (zeitStr === '') {
          timeMinutes = 0
        } else {
          const parsed = parseInt(zeitStr, 10)
          if (Number.isNaN(parsed)) {
            errors.push({
              rowIndexGlobal,
              reason: `Ungültige Zeit "${zeitStr}"`,
              raw: rawForError,
            })
            skipped++
            continue
          }
          timeMinutes = Math.max(0, parsed)
        }
        if (schleppzeitStr === '') {
          towTimeMinutes = 0
        } else {
          const parsed = parseInt(schleppzeitStr, 10)
          if (Number.isNaN(parsed)) {
            errors.push({
              rowIndexGlobal,
              reason: `Ungültige Schleppzeit "${schleppzeitStr}"`,
              raw: rawForError,
            })
            skipped++
            continue
          }
          towTimeMinutes = Math.max(0, parsed)
        }

        const year = date.getFullYear()
        const rowHash = buildRowHash(
          {
            lfz: raw.lfz,
            pilot: raw.pilot,
            start: raw.start,
            landung: raw.landung,
            startort: raw.startort,
            landeort: raw.landeort,
            schleppLfz: raw.schleppLfz,
            timeMinutes,
            towTimeMinutes,
          },
          date
        )

        const existingByHash = await payload.find({
          collection: 'flights' as CollectionSlug,
          where: {
            and: [
              { sourceRowHash: { equals: rowHash } },
              { sourceYear: { equals: year } },
            ],
          },
          limit: 1,
          overrideAccess: true,
        })
        if (existingByHash.totalDocs > 0) {
          skipped++
          continue
        }

        const towReg = (raw.schleppLfz ?? '').trim()
        const towAircraft = towReg ? findAircraftByRegistration(towReg) : null
        const towAircraftExists = towAircraft !== null
        const towLfzFilled = towReg.length > 0 || towTimeMinutes > 0

        const rowForWorking: RowForWorkingMinutes = {
          timeMinutes,
          towTimeMinutes,
          towLfzFilled,
          aircraftGroup: aircraftForRow?.aircraftGroup ?? null,
        }
        const working = computeWorkingMinutesFromRow(
          rowForWorking,
          !!aircraftForRow,
          towAircraftExists
        )

        let flightHours = timeMinutes / 60
        if (flightHours === 0 && raw.start && raw.landung) {
          const dur = calculateFlightDuration(raw.start, raw.landung)
          if (dur !== null) flightHours = dur / 60
        }

        const pilotText = raw.pilot.trim()
        const matchResult = matchMemberByName(pilotText, members)
        const pilotId = matchResult.memberId ?? undefined
        const memberMatchStatus =
          matchResult.status === 'matched'
            ? 'matched'
            : matchResult.status === 'ambiguous'
              ? 'ambiguous'
              : 'unmatched'
        const memberMatchCandidates = (matchResult.candidates || [])
          .slice(0, 5)
          .map((name) => ({ name }))

        const aircraftId = aircraftForRow.id
        const copilotName = (raw.begleiterFi ?? '').trim() || undefined
        const sourceAircraftReg = (raw.lfz ?? '').trim().toUpperCase() || undefined
        const sourceTowReg = towReg ? towReg.toUpperCase() : undefined

        const duplicateCheck = await payload.find({
          collection: 'flights' as CollectionSlug,
          where: {
            and: [
              { sourceRowHash: { equals: rowHash } },
              { sourceYear: { equals: year } },
            ],
          },
          limit: 1,
          overrideAccess: true,
        })
        if (duplicateCheck.totalDocs > 0) {
          skipped++
          continue
        }

        await payload.create({
          collection: 'flights' as CollectionSlug,
          data: {
            date: date.toISOString().slice(0, 10),
            aircraft: aircraftId,
            pilot: pilotId,
            pilotName: pilotText || undefined,
            copilotName,
            startTime: raw.start || undefined,
            landingTime: raw.landung || undefined,
            flightHours,
            flightMinutes: timeMinutes || Math.round(flightHours * 60),
            starts: 1,
            departureLocation: raw.startort || undefined,
            landingLocation: raw.landeort || undefined,
            notes: raw.bemerkung || undefined,
            importRun: importRunId,
            sourceFileName: sourceFileName,
            sourceYear: year,
            sourceRowHash: rowHash,
            sourceAircraftRegistration: sourceAircraftReg,
            sourceTowAircraftRegistration: sourceTowReg,
            sourceTowMinutes: towTimeMinutes || undefined,
            sourceMinutes: timeMinutes || undefined,
            workingMinutesGlider: working.workingMinutesGlider || undefined,
            workingMinutesMotor: working.workingMinutesMotor || undefined,
            workingMinutesTow: working.workingMinutesTow || undefined,
            memberMatchStatus,
            memberMatchCandidates:
              memberMatchCandidates.length > 0 ? memberMatchCandidates : undefined,
          },
        })
        created++
        if (aircraftId) {
          const key = `${aircraftId}-${year}`
          const current = flightLogsMap.get(key) || { starts: 0, flightHours: 0 }
          flightLogsMap.set(key, {
            starts: current.starts + 1,
            flightHours: current.flightHours + flightHours,
          })
        }
      } catch (err) {
        const reason =
          err instanceof Error ? err.message : 'Unbekannter Fehler'
        errors.push({
          rowIndexGlobal,
          reason,
          raw: rawForError,
        })
        skipped++
      }
    }

    for (const [key, stats] of flightLogsMap.entries()) {
      const [aircraftId, yearStr] = key.split('-')
      const year = parseInt(yearStr!, 10)
      try {
        const existing = await payload.find({
          collection: 'flight-logs' as CollectionSlug,
          where: {
            and: [
              { aircraft: { equals: aircraftId } },
              { year: { equals: year } },
            ],
          },
          limit: 1,
          overrideAccess: true,
        })
        if (existing.docs.length > 0) {
          const doc = existing.docs[0] as { id: string; starts: number; flightHours: number }
          await payload.update({
            collection: 'flight-logs' as CollectionSlug,
            id: doc.id,
            data: {
              starts: doc.starts + stats.starts,
              flightHours: doc.flightHours + stats.flightHours,
            },
            overrideAccess: true,
          })
        } else {
          await payload.create({
            collection: 'flight-logs' as CollectionSlug,
            data: {
              aircraft: aircraftId,
              year,
              starts: stats.starts,
              flightHours: stats.flightHours,
            },
            overrideAccess: true,
          })
        }
      } catch {
        // optional
      }
    }

    const existingRun = await payload.findByID({
      collection: 'import-runs' as CollectionSlug,
      id: importRunId,
      depth: 0,
      overrideAccess: true,
    })
    const run = existingRun as {
      id: string
      stats?: { created?: number; skipped?: number; errors?: number; unmatchedMembers?: number }
      year?: number
    }
    const prev = run.stats ?? {}
    const derivedYear = bodyYear ?? (rows.length > 0 ? undefined : undefined)
    await payload.update({
      collection: 'import-runs' as CollectionSlug,
      id: importRunId,
      data: {
        year: derivedYear,
        stats: {
          created: (prev.created ?? 0) + created,
          skipped: (prev.skipped ?? 0) + skipped,
          errors: (prev.errors ?? 0) + errors.length,
          unmatchedMembers: prev.unmatchedMembers ?? 0,
        },
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      importRunId,
      created,
      skipped,
      skippedNonClub,
      skippedUnknownAircraft,
      errors,
      chunkIndex,
      totalChunks,
    })
  } catch (error) {
    console.error('Import chunk error:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Chunk-Import',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    )
  }
}
