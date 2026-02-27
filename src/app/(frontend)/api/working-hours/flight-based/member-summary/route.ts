import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import { aggregateWorkingHoursByMember } from '@/utilities/aggregateWorkingHoursByMember'

export interface MemberSummaryItem {
  memberId: string | null
  memberName: string
  matched: boolean
  totals: {
    gliderMin: number
    motorMin: number
    towMin: number
    gliderHours: number
    motorHours: number
    towHours: number
  }
  /** Minuten bereits je Flugzeug mit Faktor bewertete Arbeitsstunden */
  adjustedTotals: {
    gliderMin: number
    motorMin: number
    towMin: number
    gliderHours: number
    motorHours: number
    towHours: number
  }
  detailsCount: { glider: number; motor: number; tow: number }
}

function roundHours(min: number): number {
  return Number((min / 60).toFixed(2))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const includeUnmatched = searchParams.get('includeUnmatched') === 'true'

    if (!yearParam) {
      return NextResponse.json(
        { error: 'Query-Parameter year (YYYY) ist erforderlich' },
        { status: 400 }
      )
    }
    const year = parseInt(yearParam, 10)
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: 'Ungültiges Jahr' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    const membersRes = await payload.find({
      collection: 'members' as CollectionSlug,
      where: { isWorkingHoursExempt: { equals: true } },
      limit: 10000,
      depth: 0,
      overrideAccess: true,
    })
    const exemptMemberIds = new Set(
      (membersRes.docs || []).map((d) => String((d as { id: string }).id))
    )

    const flightsRes = await payload.find({
      collection: 'flights' as CollectionSlug,
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
      depth: 1,
      limit: 50000,
    })

    const byMember = new Map<
      string,
      {
        memberId: string | null
        memberName: string
        matched: boolean
        gliderMin: number
        motorMin: number
        towMin: number
        gliderCount: number
        motorCount: number
        towCount: number
      }
    >()

    for (const doc of flightsRes.docs) {
      const d = doc as {
        pilot?: string | { id: string; name?: string } | null
        pilotName?: string | null
        workingMinutesGlider?: number | null
        workingMinutesMotor?: number | null
        workingMinutesTow?: number | null
      }
      const pilotId =
        d.pilot && typeof d.pilot === 'object' ? d.pilot.id : typeof d.pilot === 'string' ? d.pilot : null
      const pilotName =
        d.pilot && typeof d.pilot === 'object'
          ? (d.pilot as { name?: string }).name ?? d.pilotName ?? 'Unbekannt'
          : d.pilotName ?? 'Unbekannt'
      const key = pilotId ?? `name:${pilotName}`
      const matched = !!pilotId

      if (!includeUnmatched && !matched) continue
      if (pilotId != null && exemptMemberIds.has(pilotId)) continue

      const current = byMember.get(key)
      const g = Math.max(0, Number(d.workingMinutesGlider) || 0)
      const m = Math.max(0, Number(d.workingMinutesMotor) || 0)
      const t = Math.max(0, Number(d.workingMinutesTow) || 0)
      if (!current) {
        byMember.set(key, {
          memberId: pilotId,
          memberName: pilotName,
          matched,
          gliderMin: g,
          motorMin: m,
          towMin: t,
          gliderCount: g > 0 ? 1 : 0,
          motorCount: m > 0 ? 1 : 0,
          towCount: t > 0 ? 1 : 0,
        })
      } else {
        current.gliderMin += g
        current.motorMin += m
        current.towMin += t
        if (g > 0) current.gliderCount += 1
        if (m > 0) current.motorCount += 1
        if (t > 0) current.towCount += 1
      }
    }

    const adjustedRows = await aggregateWorkingHoursByMember(
      payload as any,
      year,
      includeUnmatched,
      exemptMemberIds
    )
    const adjustedByKey = new Map<
      string,
      { gliderMin: number; motorMin: number; towMin: number }
    >()
    for (const r of adjustedRows) {
      const key = r.memberId ?? `name:${r.memberName}`
      adjustedByKey.set(key, {
        gliderMin: r.adjusted.gliderMin,
        motorMin: r.adjusted.motorMin,
        towMin: r.adjusted.towMin,
      })
    }

    const list: MemberSummaryItem[] = Array.from(byMember.entries()).map(([key, v]) => {
      const adj = adjustedByKey.get(key) ?? {
        gliderMin: v.gliderMin,
        motorMin: v.motorMin,
        towMin: v.towMin,
      }
      return {
        memberId: v.memberId,
        memberName: v.memberName,
        matched: v.matched,
        totals: {
          gliderMin: v.gliderMin,
          motorMin: v.motorMin,
          towMin: v.towMin,
          gliderHours: roundHours(v.gliderMin),
          motorHours: roundHours(v.motorMin),
          towHours: roundHours(v.towMin),
        },
        adjustedTotals: {
          gliderMin: adj.gliderMin,
          motorMin: adj.motorMin,
          towMin: adj.towMin,
          gliderHours: roundHours(adj.gliderMin),
          motorHours: roundHours(adj.motorMin),
          towHours: roundHours(adj.towMin),
        },
        detailsCount: {
          glider: v.gliderCount,
          motor: v.motorCount,
          tow: v.towCount,
        },
      }
    })

    list.sort((a, b) => {
      const aName = a.memberName.toLowerCase()
      const bName = b.memberName.toLowerCase()
      return aName.localeCompare(bName)
    })

    return NextResponse.json(list)
  } catch (error) {
    console.error('member-summary error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Auswertung' },
      { status: 500 }
    )
  }
}
