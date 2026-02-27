import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'

export type MemberFlightCategory = 'glider' | 'motor' | 'tow'

export interface MemberFlightDetail {
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
  startTime?: string
  landingTime?: string
  notes?: string
}

interface MemberFlightQuery {
  year: number
  category: MemberFlightCategory | null
  memberId?: string | null
  pilotName?: string | null
}

export async function getMemberFlightDetails(
  payload: Payload,
  { year, category, memberId, pilotName }: MemberFlightQuery
): Promise<MemberFlightDetail[]> {
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

  return flightsRes.docs.map((doc) => {
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
      startTime?: string | null
      landingTime?: string | null
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
    const factor =
      aircraft && typeof aircraft.workingHourFactor === 'number'
        ? aircraft.workingHourFactor || 1
        : 1
    const baseForCategory =
      category === 'glider'
        ? gliderMin
        : category === 'motor'
          ? motorMin
          : category === 'tow'
            ? towMin
            : gliderMin + motorMin + towMin
    const adjustedMinutes = Math.round(baseForCategory * factor)
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
      startTime: d.startTime ?? undefined,
      landingTime: d.landingTime ?? undefined,
      notes: d.notes ?? undefined,
    }
  })
}

