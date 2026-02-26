import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

/**
 * Aggregiert Flüge (flights) nach Flugzeug + Jahr und erstellt/aktualisiert
 * Flugbucheinträge (flight-logs). Nützlich, wenn Flüge importiert wurden,
 * die Flugbücher aber z. B. wegen Zugriffskontrolle nicht geschrieben wurden.
 */
export async function POST() {
  try {
    const payload = await getPayload({ config: configPromise })

    const flightsRes = await payload.find({
      collection: 'flights' as CollectionSlug,
      where: { aircraft: { exists: true } },
      depth: 0,
      limit: 50000,
      overrideAccess: true,
    })

    const byKey = new Map<
      string,
      { aircraftId: string; year: number; starts: number; flightHours: number }
    >()

    for (const flight of flightsRes.docs) {
      const f = flight as {
        aircraft?: string | { id: string }
        date?: string
        sourceYear?: number
        starts?: number
        flightHours?: number
      }
      const aircraftId =
        typeof f.aircraft === 'object' && f.aircraft != null
          ? (f.aircraft as { id: string }).id
          : (f.aircraft as string | undefined)
      if (!aircraftId) continue

      const year = f.sourceYear ?? (f.date ? new Date(f.date).getFullYear() : null)
      if (year == null) continue

      const key = `${aircraftId}-${year}`
      const current = byKey.get(key) ?? {
        aircraftId,
        year,
        starts: 0,
        flightHours: 0,
      }
      byKey.set(key, {
        ...current,
        starts: current.starts + (f.starts ?? 1),
        flightHours: current.flightHours + (Number(f.flightHours) || 0),
      })
    }

    let created = 0
    let updated = 0
    const syncErrors: string[] = []

    for (const [, stats] of byKey.entries()) {
      try {
        const existing = await payload.find({
          collection: 'flight-logs' as CollectionSlug,
          where: {
            and: [
              { aircraft: { equals: stats.aircraftId } },
              { year: { equals: stats.year } },
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
              starts: stats.starts,
              flightHours: Math.round(stats.flightHours * 100) / 100,
            },
            overrideAccess: true,
          })
          updated++
        } else {
          await payload.create({
            collection: 'flight-logs' as CollectionSlug,
            data: {
              aircraft: stats.aircraftId,
              year: stats.year,
              starts: stats.starts,
              flightHours: Math.round(stats.flightHours * 100) / 100,
            },
            overrideAccess: true,
          })
          created++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error('Flight-logs sync single entry failed:', msg)
        syncErrors.push(`${stats.aircraftId}/${stats.year}: ${msg}`)
      }
    }

    return NextResponse.json({
      success: true,
      synced: byKey.size,
      created,
      updated,
      errors: syncErrors.length > 0 ? syncErrors.slice(0, 10) : undefined,
    })
  } catch (error) {
    console.error('Flight-logs sync error:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Aktualisieren der Flugbücher',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    )
  }
}
