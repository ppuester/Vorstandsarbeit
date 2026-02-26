/**
 * Aggregiert alle Flüge (mit aircraft) nach Flugzeug + Jahr und
 * erstellt/aktualisiert Flugbucheinträge (flight-logs).
 * Setzt Einträge auf 0, wenn für ein Flugzeug+Jahr keine Flüge mehr existieren.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncFlightLogsFromFlights(payload: any): Promise<{
  synced: number
  created: number
  updated: number
  zeroed: number
  errors: string[]
}> {
  const flightsRes = await payload.find({
    collection: 'flights',
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
  let zeroed = 0
  const errors: string[] = []

  for (const [, stats] of byKey.entries()) {
    try {
      const existing = await payload.find({
        collection: 'flight-logs',
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
        const doc = existing.docs[0] as { id: string }
        await payload.update({
          collection: 'flight-logs',
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
          collection: 'flight-logs',
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
      errors.push(`${stats.aircraftId}/${stats.year}: ${msg}`)
    }
  }

  const allLogs = await payload.find({
    collection: 'flight-logs',
    limit: 10000,
    depth: 0,
    overrideAccess: true,
  })

  for (const log of allLogs.docs) {
    const l = log as { id: string; aircraft?: string; year?: number }
    const aircraftId = typeof l.aircraft === 'object' && l.aircraft != null ? (l.aircraft as { id: string }).id : l.aircraft
    if (!aircraftId || l.year == null) continue
    const key = `${aircraftId}-${l.year}`
    if (byKey.has(key)) continue
    try {
      await payload.update({
        collection: 'flight-logs',
        id: l.id,
        data: { starts: 0, flightHours: 0 },
        overrideAccess: true,
      })
      zeroed++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`zero ${l.id}: ${msg}`)
    }
  }

  return {
    synced: byKey.size,
    created,
    updated,
    zeroed,
    errors,
  }
}
