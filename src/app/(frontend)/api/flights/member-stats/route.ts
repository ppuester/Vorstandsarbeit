import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const aircraftId = searchParams.get('aircraftId')
    const year = searchParams.get('year')

    const payload = await getPayload({ config: configPromise })

    const where: any = {}

    if (aircraftId) {
      where.aircraft = { equals: aircraftId }
    }

    if (year) {
      const yearNum = parseInt(year, 10)
      const startDate = `${yearNum}-01-01`
      const endDate = `${yearNum}-12-31`
      where.date = {
        greater_than_equal: startDate,
        less_than_equal: endDate,
      }
    }

    const flights = await payload.find({
      collection: 'flights' as CollectionSlug,
      where,
      depth: 2,
      limit: 10000,
    })

    // Aggregiere nach Mitglied
    const memberStats = new Map<
      string,
      {
        memberId: string
        memberName: string
        flights: number
        starts: number
        flightHours: number
      }
    >()

    for (const flight of flights.docs) {
      const flightData = flight as any

      // Pilot
      if (flightData.pilot) {
        const pilotId =
          typeof flightData.pilot === 'object' ? flightData.pilot.id : flightData.pilot
        const pilotName =
          typeof flightData.pilot === 'object'
            ? flightData.pilot.name || flightData.pilotName
            : flightData.pilotName || 'Unbekannt'

        const current = memberStats.get(pilotId) || {
          memberId: pilotId,
          memberName: pilotName,
          flights: 0,
          starts: 0,
          flightHours: 0,
        }

        memberStats.set(pilotId, {
          ...current,
          flights: current.flights + 1,
          starts: current.starts + (flightData.starts || 1),
          flightHours: current.flightHours + (flightData.flightHours || 0),
        })
      }

      // Begleiter (nur wenn als Mitglied zugeordnet)
      if (flightData.copilot && typeof flightData.copilot === 'object') {
        const copilotId = flightData.copilot.id
        const copilotName = flightData.copilot.name || flightData.copilotName || 'Unbekannt'

        const current = memberStats.get(copilotId) || {
          memberId: copilotId,
          memberName: copilotName,
          flights: 0,
          starts: 0,
          flightHours: 0,
        }

        memberStats.set(copilotId, {
          ...current,
          flights: current.flights + 1,
          starts: current.starts + (flightData.starts || 1),
          flightHours: current.flightHours + (flightData.flightHours || 0),
        })
      }
    }

    const stats = Array.from(memberStats.values()).sort(
      (a, b) => b.flightHours - a.flightHours
    )

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching member stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Statistiken' },
      { status: 500 }
    )
  }
}
