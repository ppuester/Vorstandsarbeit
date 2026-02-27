import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export interface FlightDetailItem {
  id: string
  date: string
  aircraftRegistration: string
  pilotName: string
  workingMinutesGlider: number
  workingMinutesMotor: number
  workingMinutesTow: number
  adjustedMinutes: number
  sourceTowAircraftRegistration?: string
  departureLocation?: string
  landingLocation?: string
  notes?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const memberId = searchParams.get('memberId')
    const pilotName = searchParams.get('pilotName')
    const category = searchParams.get('category') as 'glider' | 'motor' | 'tow' | null

    if (!yearParam) {
      return NextResponse.json(
        { error: 'Query-Parameter year ist erforderlich' },
        { status: 400 }
      )
    }
    const year = parseInt(yearParam, 10)
    if (Number.isNaN(year)) {
      return NextResponse.json({ error: 'Ungültiges Jahr' }, { status: 400 })
    }
    if (!memberId && !pilotName) {
      return NextResponse.json(
        { error: 'memberId oder pilotName erforderlich' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    const where: Record<string, unknown> = {
      and: [
        { sourceYear: { equals: year } },
        {
          or: [
            { workingMinutesGlider: { greater_than: 0 } },
            { workingMinutesMotor: { greater_than: 0 } },
            { workingMinutesTow: { greater_than: 0 } },
          ],
        },
      ],
    }

    if (memberId) {
      ;(where.and as unknown[]).push({ pilot: { equals: memberId } })
    } else if (pilotName) {
      ;(where.and as unknown[]).push({ pilotName: { equals: pilotName } })
    }

    if (category === 'glider') {
      ;(where.and as unknown[]).push({ workingMinutesGlider: { greater_than: 0 } })
    } else if (category === 'motor') {
      ;(where.and as unknown[]).push({ workingMinutesMotor: { greater_than: 0 } })
    } else if (category === 'tow') {
      ;(where.and as unknown[]).push({ workingMinutesTow: { greater_than: 0 } })
    }

    const flightsRes = await payload.find({
      collection: 'flights' as CollectionSlug,
      where: where as any,
      depth: 2,
      limit: 5000,
      sort: '-date',
    })

    const list: FlightDetailItem[] = flightsRes.docs.map((doc) => {
      const d = doc as {
        id: string
        date: string
        aircraft?: string | { id: string; registration?: string; workingHourFactor?: number | null } | null
        pilotName?: string | null
        workingMinutesGlider?: number | null
        workingMinutesMotor?: number | null
        workingMinutesTow?: number | null
        sourceTowAircraftRegistration?: string | null
        departureLocation?: string | null
        landingLocation?: string | null
        notes?: string | null
      }
      const aircraft =
        d.aircraft && typeof d.aircraft === 'object'
          ? d.aircraft
          : null
      const aircraftRegistration = aircraft?.registration ?? ''
      const gliderMin = Math.max(0, Number(d.workingMinutesGlider) || 0)
      const motorMin = Math.max(0, Number(d.workingMinutesMotor) || 0)
      const towMin = Math.max(0, Number(d.workingMinutesTow) || 0)
      const baseTotalMin = gliderMin + motorMin + towMin
      const factor =
        aircraft && typeof aircraft.workingHourFactor === 'number'
          ? aircraft.workingHourFactor || 1
          : 1
      const adjustedMinutes = Math.round(baseTotalMin * factor)
      return {
        id: d.id,
        date: d.date ?? '',
        aircraftRegistration,
        pilotName: d.pilotName ?? 'Unbekannt',
        workingMinutesGlider: gliderMin,
        workingMinutesMotor: motorMin,
        workingMinutesTow: towMin,
        adjustedMinutes,
        sourceTowAircraftRegistration: d.sourceTowAircraftRegistration ?? undefined,
        departureLocation: d.departureLocation ?? undefined,
        landingLocation: d.landingLocation ?? undefined,
        notes: d.notes ?? undefined,
      }
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error('member-details error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Details' },
      { status: 500 }
    )
  }
}
