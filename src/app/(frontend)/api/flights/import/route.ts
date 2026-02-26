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

/** Hash für Dedupe: datum|lfz|pilot|start|landung|zeit|schleppzeit|schlepp-lfz|startort|landeort */
function buildRowHash(values: Record<string, string>): string {
  const s = [
    values.datum ?? '',
    values.lfz ?? '',
    values.pilot ?? '',
    values.start ?? '',
    values.landung ?? '',
    values.zeit ?? '',
    values.schleppzeit ?? '',
    values['schlepp-lfz'] ?? '',
    values.startort ?? '',
    values.landeort ?? '',
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
  datum: string
  lfz: string
  pilot: string
  zeit: string
  schleppzeit: string
  'schlepp-lfz': string
  abr: string
  bemerkung: string
  start: string
  landung: string
  startort: string
  landeort: string
  [key: string]: string
}

function getRowValues(row: string[], headerToIndex: Record<string, number>): ParsedRow {
  const get = (key: string) => {
    const i = headerToIndex[key]
    return i === undefined ? '' : String((row[i] ?? '').trim())
  }
  return {
    datum: get('datum'),
    lfz: get('lfz') || get('kennzeichen'),
    pilot: get('pilot'),
    zeit: get('zeit'),
    schleppzeit: get('schleppzeit'),
    'schlepp-lfz': get('schlepp-lfz'),
    abr: get('abr'),
    bemerkung: get('bemerkung') || get('notiz'),
    start: get('start'),
    landung: get('landung'),
    startort: get('startort'),
    landeort: get('landeort'),
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    const fileName = (file.name || '').toLowerCase()
    const isExcel =
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'

    let rows: string[][] = []
    let headerToIndex: Record<string, number> = {}

    if (isExcel) {
      const buffer = Buffer.from(await file.arrayBuffer())
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
      const normalizedHeaders = rawHeaders.map(normalizeHeader)
      headerToIndex = Object.fromEntries(
        normalizedHeaders.map((h, i) => [h, i])
      ) as Record<string, number>
      // Auch "lfz." / "lfz" abdecken
      const lfzIdx = rawHeaders.findIndex(
        (h) => normalizeHeader(h).includes('lfz') || normalizeHeader(h).includes('kennzeichen')
      )
      if (lfzIdx >= 0) headerToIndex['lfz'] = lfzIdx
      const datumIdx = rawHeaders.findIndex((h) => normalizeHeader(h).includes('datum'))
      if (datumIdx >= 0) headerToIndex['datum'] = datumIdx
      rows = data.slice(1)
    } else {
      const text = await file.text()
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
      const normalizedHeaders = rawHeaders.map(normalizeHeader)
      headerToIndex = Object.fromEntries(
        normalizedHeaders.map((h, i) => [h, i])
      ) as Record<string, number>
      const lfzIdx = rawHeaders.findIndex(
        (h) => normalizeHeader(h).includes('lfz') || normalizeHeader(h).includes('kennzeichen')
      )
      if (lfzIdx >= 0) headerToIndex['lfz'] = lfzIdx
      const datumIdx = rawHeaders.findIndex((h) => normalizeHeader(h).includes('datum'))
      if (datumIdx >= 0) headerToIndex['datum'] = datumIdx
      rows = data.slice(1)
    }

    if (headerToIndex['datum'] === undefined && headerToIndex['lfz'] === undefined) {
      const hasDatum = Object.keys(headerToIndex).some((k) => k.includes('datum'))
      const hasLfz = Object.keys(headerToIndex).some(
        (k) => k.includes('lfz') || k.includes('kennzeichen')
      )
      if (!hasDatum || !hasLfz) {
        return NextResponse.json(
          { error: 'Erforderliche Spalten "Datum" und "Lfz." nicht gefunden' },
          { status: 400 }
        )
      }
    }

    const payload = await getPayload({ config: configPromise })

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

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const raw = getRowValues(row, headerToIndex)
      const datumStr = raw.datum ?? ''
      const lfzStr = raw.lfz ?? ''
      if (!datumStr || !lfzStr) {
        skipped++
        if (errors.length < 50) errors.push(`Zeile ${i + 2}: Datum oder Lfz. fehlt`)
        continue
      }

      const date = parseDate(datumStr)
      if (!date) {
        skipped++
        if (errors.length < 50) errors.push(`Zeile ${i + 2}: Ungültiges Datum "${datumStr}"`)
        continue
      }

      const year = date.getFullYear()
      const rowHash = buildRowHash(raw)

      const existingByHash = await payload.find({
        collection: 'flights' as CollectionSlug,
        where: {
          and: [
            { sourceRowHash: { equals: rowHash } },
            { sourceYear: { equals: year } },
          ],
        },
        limit: 1,
      })
      if (existingByHash.totalDocs > 0) {
        skipped++
        continue
      }

      const aircraftForRow = await findAircraftByRegistration(payload, lfzStr)
      const towReg = (raw['schlepp-lfz'] ?? '').trim()
      const towAircraft = towReg ? await findAircraftByRegistration(payload, towReg) : null
      const towAircraftExists = towAircraft !== null
      const towLfzFilled = towReg.length > 0
      const timeMinutes = Math.max(0, parseInt(raw.zeit ?? '0', 10) || 0)
      const towTimeMinutes = Math.max(0, parseInt(raw.schleppzeit ?? '0', 10) || 0)

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
      if (flightHours === 0) {
        const startTime = raw.start ?? ''
        const landingTime = raw.landung ?? ''
        if (startTime && landingTime) {
          const dur = calculateFlightDuration(startTime, landingTime)
          if (dur !== null) flightHours = dur / 60
        }
      }

      const pilotText = (raw.pilot ?? '').trim()
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

      const aircraftId = aircraftForRow?.id
      if (!aircraftId) {
        skipped++
        if (errors.length < 50)
          errors.push(`Zeile ${i + 2}: Flugzeug "${lfzStr}" nicht gefunden (Zeile wird nicht als Flug importiert, wenn kein Vereinsflugzeug)`)
        continue
      }

      try {
        await payload.create({
          collection: 'flights' as CollectionSlug,
          data: {
            date: date.toISOString().split('T')[0],
            aircraft: aircraftId,
            pilot: pilotId,
            pilotName: pilotText || undefined,
            startTime: raw.start || undefined,
            landingTime: raw.landung || undefined,
            flightHours,
            flightMinutes: timeMinutes || flightHours * 60,
            starts: 1,
            departureLocation: raw.startort || undefined,
            landingLocation: raw.landeort || undefined,
            notes: raw.bemerkung || undefined,
            sourceYear: year,
            sourceRowHash: rowHash,
            sourceTowAircraftRegistration: towReg || undefined,
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

        const key = `${aircraftId}-${year}`
        const current = flightLogsMap.get(key) || { starts: 0, flightHours: 0 }
        flightLogsMap.set(key, {
          starts: current.starts + 1,
          flightHours: current.flightHours + flightHours,
        })
      } catch (err) {
        skipped++
        if (errors.length < 50)
          errors.push(
            `Zeile ${i + 2}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
          )
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
          })
        }
      } catch (_err) {
        // optional
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      unmatchedMembers,
      aggregated: flightLogsMap.size,
      errors: errors.slice(0, 50),
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
