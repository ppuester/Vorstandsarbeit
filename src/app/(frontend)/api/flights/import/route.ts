import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

interface FlightRow {
  date?: string
  aircraft?: string
  pilot?: string
  copilot?: string
  startTime?: string
  landingTime?: string
  flightMinutes?: number
  flightHours?: number
  starts?: number
  departureLocation?: string
  landingLocation?: string
  landings?: string
  flightType?: string
  notes?: string
}

// Parse DD.MM.YY to Date
function parseDate(dateStr: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null

  // Entferne Leerzeichen
  const cleaned = dateStr.trim()

  // Versuche DD.MM.YY oder DD.MM.YYYY zu parsen
  const parts = cleaned.split('.')
  if (parts.length !== 3) return null

  let day = parseInt(parts[0], 10)
  let month = parseInt(parts[1], 10) - 1 // Monate sind 0-indexiert
  let year = parseInt(parts[2], 10)

  // Wenn Jahr 2-stellig, interpretiere als 20XX
  if (year < 100) {
    year = year < 50 ? 2000 + year : 1900 + year
  }

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null

  const date = new Date(year, month, day)
  if (isNaN(date.getTime())) return null

  return date
}

// Parse HH:MM to minutes
function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || !timeStr.trim()) return null

  const parts = timeStr.trim().split(':')
  if (parts.length !== 2) return null

  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)

  if (isNaN(hours) || isNaN(minutes)) return null

  return hours * 60 + minutes
}

// Berechne Flugdauer in Minuten aus Start- und Landezeit
function calculateFlightDuration(startTime: string, landingTime: string): number | null {
  const start = parseTimeToMinutes(startTime)
  const landing = parseTimeToMinutes(landingTime)

  if (start === null || landing === null) return null

  // Wenn Landung am nächsten Tag (z.B. Start 23:00, Landung 01:00)
  let duration = landing - start
  if (duration < 0) {
    duration += 24 * 60 // 24 Stunden in Minuten
  }

  return duration
}

// Finde Mitglied anhand Name (verschiedene Formate: "Nachname, Vorname" oder "Vorname Nachname")
async function findMemberByName(
  payload: Awaited<ReturnType<typeof getPayload>>,
  name: string
): Promise<string | null> {
  if (!name || !name.trim()) return null

  const cleanedName = name.trim()

  // Versuche verschiedene Formate
  // Format 1: "Nachname, Vorname"
  if (cleanedName.includes(',')) {
    const [lastName, firstName] = cleanedName.split(',').map((s) => s.trim())
    if (lastName && firstName) {
      // Suche nach "Nachname, Vorname" oder "Vorname Nachname"
      const results = await payload.find({
        collection: 'members' as CollectionSlug,
        where: {
          or: [
            { name: { contains: lastName } },
            { name: { contains: firstName } },
          ],
        },
        limit: 10,
      })

      // Versuche exakte Übereinstimmung
      for (const member of results.docs) {
        const memberName = (member as any).name || ''
        if (
          memberName.includes(lastName) &&
          memberName.includes(firstName)
        ) {
          return member.id
        }
      }

      // Wenn keine exakte Übereinstimmung, nimm den ersten Treffer
      if (results.docs.length > 0) {
        return results.docs[0].id
      }
    }
  }

  // Format 2: "Vorname Nachname" oder einfach "Name"
  const results = await payload.find({
    collection: 'members' as CollectionSlug,
    where: {
      name: { contains: cleanedName },
    },
    limit: 1,
  })

  if (results.docs.length > 0) {
    return results.docs[0].id
  }

  return null
}

// Finde Flugzeug anhand Kennzeichen
async function findAircraftByRegistration(
  payload: Awaited<ReturnType<typeof getPayload>>,
  registration: string
): Promise<string | null> {
  if (!registration || !registration.trim()) return null

  const cleaned = registration.trim().toUpperCase()

  const results = await payload.find({
    collection: 'aircraft' as CollectionSlug,
    where: {
      registration: { contains: cleaned },
    },
    limit: 1,
  })

  if (results.docs.length > 0) {
    return results.docs[0].id
  }

  return null
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    const text = await file.text()
    // Normalisiere Zeilenumbrüche
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const lines = normalizedText.split('\n').filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Parse Header - Excel verwendet Tabs oder Semikolons
    const firstLine = lines[0]
    const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ','
    const headers = firstLine.split(delimiter).map((h) => h.trim().toLowerCase())

    // Finde Spaltenindizes
    const dateIndex = headers.findIndex((h) => h.includes('datum'))
    const aircraftIndex = headers.findIndex((h) => h.includes('lfz') || h.includes('kennzeichen'))
    const pilotIndex = headers.findIndex((h) => h.includes('pilot'))
    const copilotIndex = headers.findIndex((h) => h.includes('begleiter'))
    const startTimeIndex = headers.findIndex((h) => h.includes('start') && !h.includes('ort'))
    const landingTimeIndex = headers.findIndex((h) => h.includes('landung') && !h.includes('ort'))
    const durationIndex = headers.findIndex((h) => h.includes('zeit') || h.includes('dauer'))
    const departureIndex = headers.findIndex((h) => h.includes('startort'))
    const landingLocationIndex = headers.findIndex((h) => h.includes('landeort'))
    const landingsIndex = headers.findIndex((h) => h.includes('landungen'))
    const flightTypeIndex = headers.findIndex((h) => h.includes('flugart') || h.includes('s.-art'))
    const notesIndex = headers.findIndex((h) => h.includes('bemerkung') || h.includes('notiz'))

    if (dateIndex === -1 || aircraftIndex === -1) {
      return NextResponse.json(
        { error: 'Erforderliche Spalten "Datum" und "Lfz." nicht gefunden' },
        { status: 400 }
      )
    }

    let imported = 0
    let skipped = 0
    let aggregated = 0
    const errors: string[] = []
    const flightLogsMap = new Map<string, { starts: number; flightHours: number }>()

    // Parse und importiere Flüge
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const values = line.split(delimiter).map((v) => v.trim())
      if (values.length < Math.max(dateIndex, aircraftIndex) + 1) continue

      const dateStr = values[dateIndex] || ''
      const aircraftStr = values[aircraftIndex] || ''

      if (!dateStr || !aircraftStr) {
        skipped++
        errors.push(`Zeile ${i + 1}: Datum oder Flugzeug fehlt`)
        continue
      }

      const date = parseDate(dateStr)
      if (!date) {
        skipped++
        errors.push(`Zeile ${i + 1}: Ungültiges Datum "${dateStr}"`)
        continue
      }

      const aircraftId = await findAircraftByRegistration(payload, aircraftStr)
      if (!aircraftId) {
        skipped++
        errors.push(`Zeile ${i + 1}: Flugzeug "${aircraftStr}" nicht gefunden`)
        continue
      }

      // Prüfe auf Duplikat (gleiches Datum, Flugzeug, Pilot)
      const pilotName = values[pilotIndex] || ''
      const existing = await payload.find({
        collection: 'flights' as CollectionSlug,
        where: {
          and: [
            { date: { equals: date.toISOString().split('T')[0] } },
            { aircraft: { equals: aircraftId } },
            ...(pilotName ? [{ pilotName: { equals: pilotName } }] : []),
          ],
        },
        limit: 1,
      })

      if (existing.totalDocs > 0) {
        skipped++
        continue // Überspringe Duplikat
      }

      // Berechne Flugdauer
      const startTime = values[startTimeIndex] || ''
      const landingTime = values[landingTimeIndex] || ''
      let flightHours = 0

      if (values[durationIndex]) {
        // Wenn "Zeit" in Minuten angegeben ist
        const minutes = parseInt(values[durationIndex], 10)
        if (!isNaN(minutes)) {
          flightHours = minutes / 60
        }
      } else if (startTime && landingTime) {
        // Berechne aus Start- und Landezeit
        const duration = calculateFlightDuration(startTime, landingTime)
        if (duration !== null) {
          flightHours = duration / 60
        }
      }

      if (flightHours === 0) {
        skipped++
        errors.push(`Zeile ${i + 1}: Flugdauer konnte nicht ermittelt werden`)
        continue
      }

      // Finde Pilot und Begleiter
      const pilotId = pilotName ? await findMemberByName(payload, pilotName) : null
      const copilotName = values[copilotIndex] || ''
      const copilotId = copilotName ? await findMemberByName(payload, copilotName) : null

      // Erstelle Flug
      try {
        await payload.create({
          collection: 'flights' as CollectionSlug,
          data: {
            date: date.toISOString().split('T')[0],
            aircraft: aircraftId,
            pilot: pilotId || undefined,
            pilotName: pilotName || undefined,
            copilot: copilotId || undefined,
            copilotName: copilotName || undefined,
            startTime: startTime || undefined,
            landingTime: landingTime || undefined,
            flightHours,
            flightMinutes: flightHours * 60,
            starts: 1,
            departureLocation: values[departureIndex] || undefined,
            landingLocation: values[landingLocationIndex] || undefined,
            landings: values[landingsIndex] || undefined,
            flightType: values[flightTypeIndex] || undefined,
            notes: values[notesIndex] || undefined,
          } as any,
        })

        imported++

        // Aggregiere für FlightLogs
        const year = date.getFullYear()
        const key = `${aircraftId}-${year}`
        const current = flightLogsMap.get(key) || { starts: 0, flightHours: 0 }
        flightLogsMap.set(key, {
          starts: current.starts + 1,
          flightHours: current.flightHours + flightHours,
        })
      } catch (error) {
        errors.push(
          `Zeile ${i + 1}: Fehler beim Erstellen - ${
            error instanceof Error ? error.message : 'Unbekannter Fehler'
          }`
        )
      }
    }

    // Aggregiere und aktualisiere/erstelle FlightLogs
    for (const [key, stats] of flightLogsMap.entries()) {
      const [aircraftId, yearStr] = key.split('-')
      const year = parseInt(yearStr, 10)

      try {
        // Prüfe ob FlightLog bereits existiert
        const existing = await payload.find({
          collection: 'flight-logs' as CollectionSlug,
          where: {
            and: [{ aircraft: { equals: aircraftId } }, { year: { equals: year } }],
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          // Update bestehenden Eintrag
          const existingDoc = existing.docs[0]
          await payload.update({
            collection: 'flight-logs' as CollectionSlug,
            id: existingDoc.id,
            data: {
              starts: (existingDoc as any).starts + stats.starts,
              flightHours: (existingDoc as any).flightHours + stats.flightHours,
            } as any,
          })
        } else {
          // Erstelle neuen Eintrag
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

        aggregated++
      } catch (error) {
        errors.push(
          `Fehler beim Aggregieren für Flugzeug ${aircraftId}, Jahr ${year}: ${
            error instanceof Error ? error.message : 'Unbekannter Fehler'
          }`
        )
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      aggregated,
      errors: errors.slice(0, 50), // Limitiere Fehler auf 50
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
