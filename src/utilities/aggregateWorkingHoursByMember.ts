/**
 * Aggregiert Arbeitsstunden (Segelflug/Motorflug/Schlepp) pro Mitglied aus Flügen.
 * Pro Flug wird der Aircraft-Faktor angewendet: adjusted = round(min * factor).
 * Segelflug/Motorflug: Faktor des Flugzeugs der Zeile. Schlepp: Faktor der Schleppmaschine (bei fremdem Segler = Faktor des Schlepp-LFZ).
 */

import type { Payload } from 'payload'
import type { CollectionSlug } from 'payload'

export interface MemberWorkingHoursRow {
  memberId: string | null
  memberName: string
  matched: boolean
  matchStatus: 'matched' | 'unmatched' | 'ambiguous'
  base: { gliderMin: number; motorMin: number; towMin: number }
  adjusted: { gliderMin: number; motorMin: number; towMin: number }
}

type FlightDoc = {
  pilot?: string | { id: string; name?: string } | null
  pilotName?: string | null
  memberMatchStatus?: string | null
  workingMinutesGlider?: number | null
  workingMinutesMotor?: number | null
  workingMinutesTow?: number | null
  aircraft?: string | { id: string; workingHourFactor?: number | null } | null
  sourceTowAircraftRegistration?: string | null
}

export async function aggregateWorkingHoursByMember(
  payload: Payload,
  year: number,
  includeUnmatched: boolean,
  exemptMemberIds?: Set<string>
): Promise<MemberWorkingHoursRow[]> {
  const [flightsRes, aircraftRes] = await Promise.all([
    payload.find({
      collection: 'flights',
      where: {
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
      },
      depth: 2,
      limit: 50000,
      overrideAccess: true,
    }),
    payload.find({
      collection: 'aircraft' as CollectionSlug,
      limit: 5000,
      depth: 0,
      overrideAccess: true,
    }),
  ])

  const aircraftFactorByReg = new Map<string, number>()
  for (const ac of aircraftRes.docs) {
    const a = ac as { registration?: string | null; workingHourFactor?: number | null }
    const reg = (a.registration ?? '').trim().toUpperCase()
    if (reg) {
      aircraftFactorByReg.set(reg, Number(a.workingHourFactor) || 1)
    }
  }

  const byMember = new Map<
    string,
    {
      memberId: string | null
      memberName: string
      matched: boolean
      matchStatus: 'matched' | 'unmatched' | 'ambiguous'
      gliderMinBase: number
      motorMinBase: number
      towMinBase: number
      gliderMinAdjusted: number
      motorMinAdjusted: number
      towMinAdjusted: number
    }
  >()

  for (const doc of flightsRes.docs) {
    const d = doc as FlightDoc
    const pilotId =
      d.pilot && typeof d.pilot === 'object'
        ? d.pilot.id
        : typeof d.pilot === 'string'
          ? d.pilot
          : null
    const pilotName =
      d.pilot && typeof d.pilot === 'object'
        ? (d.pilot as { name?: string }).name ?? d.pilotName ?? 'Unbekannt'
        : d.pilotName ?? 'Unbekannt'
    const key = pilotId ?? `name:${pilotName}`
    const matched = !!pilotId

    if (!includeUnmatched && !matched) continue
    if (pilotId != null && exemptMemberIds?.has(pilotId)) continue

    const factorRow =
      d.aircraft && typeof d.aircraft === 'object' && d.aircraft != null
        ? Number((d.aircraft as { workingHourFactor?: number }).workingHourFactor) || 1
        : 1
    const gBase = Math.max(0, Number(d.workingMinutesGlider) || 0)
    const mBase = Math.max(0, Number(d.workingMinutesMotor) || 0)
    const tBase = Math.max(0, Number(d.workingMinutesTow) || 0)
    const towReg = (d.sourceTowAircraftRegistration ?? '').trim().toUpperCase()
    const factorTow =
      tBase > 0 && towReg ? (aircraftFactorByReg.get(towReg) ?? 1) : factorRow
    const gAdj = Math.round(gBase * factorRow)
    const mAdj = Math.round(mBase * factorRow)
    const tAdj = Math.round(tBase * factorTow)

    const matchStatus =
      (d.memberMatchStatus === 'matched' || d.memberMatchStatus === 'unmatched' || d.memberMatchStatus === 'ambiguous')
        ? d.memberMatchStatus
        : matched
          ? 'matched'
          : 'unmatched'

    const current = byMember.get(key)
    if (!current) {
      byMember.set(key, {
        memberId: pilotId,
        memberName: pilotName,
        matched,
        matchStatus,
        gliderMinBase: gBase,
        motorMinBase: mBase,
        towMinBase: tBase,
        gliderMinAdjusted: gAdj,
        motorMinAdjusted: mAdj,
        towMinAdjusted: tAdj,
      })
    } else {
      current.gliderMinBase += gBase
      current.motorMinBase += mBase
      current.towMinBase += tBase
      current.gliderMinAdjusted += gAdj
      current.motorMinAdjusted += mAdj
      current.towMinAdjusted += tAdj
    }
  }

  const list: MemberWorkingHoursRow[] = Array.from(byMember.values()).map((v) => ({
    memberId: v.memberId,
    memberName: v.memberName,
    matched: v.matched,
    matchStatus: v.matchStatus,
    base: {
      gliderMin: v.gliderMinBase,
      motorMin: v.motorMinBase,
      towMin: v.towMinBase,
    },
    adjusted: {
      gliderMin: v.gliderMinAdjusted,
      motorMin: v.motorMinAdjusted,
      towMin: v.towMinAdjusted,
    },
  }))

  list.sort((a, b) => a.memberName.toLowerCase().localeCompare(b.memberName.toLowerCase()))
  return list
}

export function roundHours(min: number): number {
  return Number((min / 60).toFixed(2))
}
