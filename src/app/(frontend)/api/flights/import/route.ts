import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import crypto from 'crypto'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { matchMemberByName, type MemberForMatch } from '@/utilities/memberMatching'
import {
  computeWorkingMinutesFromRow,
  type AircraftGroup,
  type RowForWorkingMinutes,
} from '@/utilities/workingMinutesFromFlights'

export const runtime = 'nodejs'

// Parse DD.MM.YY or DD.MM.YYYY
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

/** Normalize time to HH:MM for hashing */
function normalizeTimeHHMM(timeStr: string): string {
  if (!timeStr || !String(timeStr).trim()) return ''
  const parts = String(timeStr).trim().split(':')
  if (parts.length < 2) return ''
  const h = parseInt(parts[0]!, 10)
  const m = parseInt(parts[1]!, 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || !String(timeStr).trim()) return null
  const parts = String(timeStr).trim().split(':')
  if (parts.length !== 2) return null
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

function normalizeHeader(h: string): string {
  return String(h)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
}

/** Hauptflugbuch: canonical key -> possible header normalizations (exact preferred) */
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

function buildHeaderToIndex(rawHeaders: string[]): Record<string, number> {
  const normalizedHeaders = rawHeaders.map(normalizeHeader)
  const headerToIndex: Record<string, number> = Object.fromEntries(
    normalizedHeaders.map((h, i) => [h, i])
  ) as Record<string, number>
  for (const [canonical, aliases] of Object.entries(HAUPFLUGBUCH_ALIASES)) {
    const idx = normalizedHeaders.findIndex((h) =>
      aliases.some((a) => h === a || h.replace(/\s|-/g, '') === a.replace(/\s|-/g, ''))
    )
    if (idx >= 0) headerToIndex[canonical] = idx
  }
  return headerToIndex
}

/** Normalisiert Pilot-String (trim, mehrfache Leerzeichen kollabieren) für stabilen Hash */
function normalizePilotForHash(pilot: string): string {
  return (pilot ?? '')
    .trim()
    .replace(/\s+/g, ' ')
}

/** Hash für Dedupe: nur normalisierte Werte, damit gleiche Flüge immer denselben Hash liefern (Delta-Import). */
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

async function findAircraftByRegistration(
  payload: Awaited<ReturnType<typeof getPayload>>,
  registration: string
): Promise<{ id: string; aircraftGroup: AircraftGroup } | null> {
  if (!registration || !String(registration).trim()) return null
  const cleaned = String(registration).trim().toUpperCase()
  const results = await payload.find({
    collection: 'aircraft' as CollectionSlug,
    where: { registration: { contains: cleaned } },
    limit: 1,
    depth: 0,
  })
  if (results.docs.length === 0) return null
  const doc = results.docs[0] as { id: string; aircraftGroup?: string }
  return {
    id: doc.id,
    aircraftGroup: (doc.aircraftGroup as AircraftGroup) ?? 'other',
  }
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

function getRowValues(row: string[], headerToIndex: Record<string, number>): ParsedRow {
  const get = (key: string) => {
    const i = headerToIndex[key]
    return i === undefined ? '' : String((row[i] ?? '').trim())
  }
  return {
    vereinsLfz: get('vereinsLfz'),
    datum: get('datum'),
    lfz: get('lfz'),
    pilot: get('pilot'),
    begleiterFi: get('begleiterFi'),
    start: get('start'),
    zeit: get('zeit'),
    schleppzeit: get('schleppzeit'),
    schleppLfz: get('schleppLfz'),
    startort: get('startort'),
    landung: get('landung'),
    landeort: get('landeort'),
    bemerkung: get('bemerkung'),
  }
}

function computeFileHash(buffer: ArrayBuffer): string {
  return crypto.createHash('sha1').update(Buffer.from(buffer)).digest('hex')
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    const fileBuffer = await file.arrayBuffer()
    const fileSize = fileBuffer.byteLength
    const fileHash = computeFileHash(fileBuffer)
    const sourceFileName = file.name || 'Unbekannt'

    const fileName = (file.name || '').toLowerCase()
    const isExcel =
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'

    let rows: string[][] = []
    let headerToIndex: Record<string, number> = {}

    if (isExcel) {
      const buffer = Buffer.from(fileBuffer)
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!firstSheet) {
        return NextResponse.json(
          { error: 'Keine Tabelle in der Excel-Datei gefunden' },
          { status: 400 }
        )
      }
      const data = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
        header: 1,
        defval: '',
      }) as string[][]
      if (!data.length) {
        return NextResponse.json(
          { error: 'Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten' },
          { status: 400 }
        )
      }
      const rawHeaders = (data[0] ?? []).map((c) => String(c ?? ''))
      headerToIndex = buildHeaderToIndex(rawHeaders)
      rows = data.slice(1)
    } else {
      const text = new TextDecoder().decode(fileBuffer)
      const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      const lineStrings = normalizedText.split('\n').filter((l) => l.trim())
      if (lineStrings.length < 2) {
        return NextResponse.json(
          { error: 'Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten' },
          { status: 400 }
        )
      }
      const firstLineStr = lineStrings[0] ?? ''
      const delimiter = firstLineStr.includes('\t')
        ? '\t'
        : firstLineStr.includes(';')
          ? ';'
          : ','
      const reparse = Papa.parse<string[]>(normalizedText, {
        delimiter,
        skipEmptyLines: true,
      })
      const data = reparse.data as string[][]
      const rawHeaders = (data[0] ?? []).map((c) => String(c ?? '').trim())
      headerToIndex = buildHeaderToIndex(rawHeaders)
      rows = data.slice(1)
    }

    if (headerToIndex['datum'] === undefined || headerToIndex['lfz'] === undefined) {
      return NextResponse.json(
        { error: 'Erforderliche Spalten "Datum" und "Lfz." nicht gefunden (Hauptflugbuch-Format)' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    const importRunDoc = await payload.create({
      collection: 'import-runs' as CollectionSlug,
      data: {
        type: 'flights',
        fileName: sourceFileName,
        fileSize,
        fileHash,
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
    const importRunId = importRunDoc.id as string

    const membersRes = await payload.find({
      collection: 'members' as CollectionSlug,
      limit: 10000,
      depth: 0,
    })
    const members: MemberForMatch[] = (membersRes.docs || []).map((d: any) => ({
      id: d.id,
      name: d.name ?? '',
    }))

    let created = 0
    let skipped = 0
    let unmatchedMembers = 0
    const errors: string[] = []
    const flightLogsMap = new Map<string, { starts: number; flightHours: number }>()
    const yearCounts = new Map<number, number>()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const raw = getRowValues(row, headerToIndex)

      if (!raw.datum || !raw.lfz || !raw.pilot) {
        skipped++
        if (errors.length < 50)
          errors.push(`Zeile ${i + 2}: Datum, Lfz. oder Pilot fehlt`)
        continue
      }

      const date = parseDate(raw.datum)
      if (!date) {
        skipped++
        if (errors.length < 50) errors.push(`Zeile ${i + 2}: Ungültiges Datum "${raw.datum}"`)
        continue
      }

      const zeitStr = (raw.zeit ?? '').trim()
      const schleppzeitStr = (raw.schleppzeit ?? '').trim()
      let timeMinutes: number
      let towTimeMinutes: number
      if (zeitStr === '') {
        timeMinutes = 0
      } else {
        const parsed = parseInt(zeitStr, 10)
        if (Number.isNaN(parsed)) {
          skipped++
          if (errors.length < 50) errors.push(`Zeile ${i + 2}: Ungültige Zeit "${zeitStr}"`)
          continue
        }
        timeMinutes = Math.max(0, parsed)
      }
      if (schleppzeitStr === '') {
        towTimeMinutes = 0
      } else {
        const parsed = parseInt(schleppzeitStr, 10)
        if (Number.isNaN(parsed)) {
          skipped++
          if (errors.length < 50)
            errors.push(`Zeile ${i + 2}: Ungültige Schleppzeit "${schleppzeitStr}"`)
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

      const vereinsLfz = (raw.vereinsLfz ?? '').trim().toLowerCase()
      const isVereinsLfz = vereinsLfz === 'ja'

      const aircraftForRow = isVereinsLfz
        ? await findAircraftByRegistration(payload, raw.lfz)
        : null
      const towReg = (raw.schleppLfz ?? '').trim()
      const towAircraft = towReg ? await findAircraftByRegistration(payload, towReg) : null
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
      if (matchResult.status === 'unmatched' && pilotText) unmatchedMembers++

      const pilotId = matchResult.memberId ?? undefined
      const memberMatchStatus =
        matchResult.status === 'matched'
          ? 'matched'
          : matchResult.status === 'ambiguous'
            ? 'ambiguous'
            : 'unmatched'
      const memberMatchCandidates = (matchResult.candidates || []).slice(0, 5).map((name) => ({ name }))

      const aircraftId = aircraftForRow?.id ?? undefined
      const copilotName = (raw.begleiterFi ?? '').trim() || undefined
      const sourceAircraftReg = (raw.lfz ?? '').trim().toUpperCase() || undefined
      const sourceTowReg = towReg ? towReg.toUpperCase() : undefined

      // Kurz vor dem Anlegen erneut prüfen (Delta: verhindert Duplikate bei parallelen Importen)
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

      try {
        await payload.create({
          collection: 'flights' as CollectionSlug,
          data: {
            date: date,
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
            memberMatchStatus: memberMatchStatus as any,
            memberMatchCandidates: memberMatchCandidates.length ? memberMatchCandidates : undefined,
          } as any,
        })
        created++
        yearCounts.set(year, (yearCounts.get(year) ?? 0) + 1)

        if (aircraftId) {
          const key = `${aircraftId}-${year}`
          const current = flightLogsMap.get(key) || { starts: 0, flightHours: 0 }
          flightLogsMap.set(key, {
            starts: current.starts + 1,
            flightHours: current.flightHours + flightHours,
          })
        }
      } catch (err) {
        const isDuplicate =
          (err as { status?: number })?.status === 409 ||
          (err instanceof Error && err.message.includes('Duplikat'))
        if (isDuplicate) {
          skipped++
        } else {
          skipped++
          if (errors.length < 50)
            errors.push(
              `Zeile ${i + 2}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
            )
        }
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
            } as any,
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
            } as any,
            overrideAccess: true,
          })
        }
      } catch (_err) {
        // optional
      }
    }

    const derivedYear =
      yearCounts.size > 0
        ? [...yearCounts.entries()].sort((a, b) => b[1]! - a[1]!)[0]?.[0]
        : undefined

    await payload.update({
      collection: 'import-runs' as CollectionSlug,
      id: importRunId,
      data: {
        year: derivedYear ?? undefined,
        stats: {
          created,
          updated: 0,
          skipped,
          errors: errors.length,
          unmatchedMembers,
        },
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      created,
      skipped,
      unmatchedMembers,
      aggregated: flightLogsMap.size,
      importRunId,
      errors: errors.slice(0, 50),
      message:
        created > 0 || skipped > 0
          ? `Import abgeschlossen: ${created} neue Flüge angelegt, ${skipped} Zeilen übersprungen (bereits vorhanden oder ungültig). Es werden nur neue Flüge importiert (Delta).`
          : undefined,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Importieren',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    )
  }
}
