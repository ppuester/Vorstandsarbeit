import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { syncFlightLogsFromFlights } from '@/utilities/syncFlightLogsFromFlights'

/**
 * Aggregiert Flüge (flights) nach Flugzeug + Jahr und erstellt/aktualisiert
 * Flugbucheinträge (flight-logs). Setzt Einträge auf 0, wenn keine Flüge mehr existieren.
 */
export async function POST() {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await syncFlightLogsFromFlights(payload)

    return NextResponse.json({
      success: true,
      synced: result.synced,
      created: result.created,
      updated: result.updated,
      zeroed: result.zeroed,
      errors: result.errors.length > 0 ? result.errors.slice(0, 10) : undefined,
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
