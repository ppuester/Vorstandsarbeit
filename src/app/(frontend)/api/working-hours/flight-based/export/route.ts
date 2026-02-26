import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import * as XLSX from 'xlsx'
import { aggregateWorkingHoursByMember, roundHours } from '@/utilities/aggregateWorkingHoursByMember'

export const runtime = 'nodejs'

const HEADERS = [
  'Mitglied',
  'Mitgliedsnummer',
  'MatchStatus',
  'Segelflug_min_base',
  'Segelflug_h_base',
  'Motorflug_min_base',
  'Motorflug_h_base',
  'Schlepp_min_base',
  'Schlepp_h_base',
  'Summe_min_base',
  'Summe_h_base',
  'Segelflug_min_adjusted',
  'Segelflug_h_adjusted',
  'Motorflug_min_adjusted',
  'Motorflug_h_adjusted',
  'Schlepp_min_adjusted',
  'Schlepp_h_adjusted',
  'Summe_min_adjusted',
  'Summe_h_adjusted',
] as const

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
      limit: 10000,
      depth: 0,
      overrideAccess: true,
    })
    const memberNumberById = new Map<string, string>()
    const exemptMemberIds = new Set<string>()
    for (const m of membersRes.docs) {
      const member = m as { id: string; memberNumber?: string | null; isWorkingHoursExempt?: boolean }
      if (member.memberNumber != null && member.memberNumber !== '') {
        memberNumberById.set(member.id, String(member.memberNumber))
      }
      if (member.isWorkingHoursExempt === true) {
        exemptMemberIds.add(member.id)
      }
    }

    const rows = await aggregateWorkingHoursByMember(
      payload,
      year,
      includeUnmatched,
      exemptMemberIds
    )

    const sheetRows = rows.map((r) => {
      const sumBase = r.base.gliderMin + r.base.motorMin + r.base.towMin
      const sumAdj = r.adjusted.gliderMin + r.adjusted.motorMin + r.adjusted.towMin
      return {
        Mitglied: r.memberName,
        Mitgliedsnummer: r.memberId ? memberNumberById.get(r.memberId) ?? '' : '',
        MatchStatus: r.matchStatus,
        Segelflug_min_base: r.base.gliderMin,
        Segelflug_h_base: roundHours(r.base.gliderMin),
        Motorflug_min_base: r.base.motorMin,
        Motorflug_h_base: roundHours(r.base.motorMin),
        Schlepp_min_base: r.base.towMin,
        Schlepp_h_base: roundHours(r.base.towMin),
        Summe_min_base: sumBase,
        Summe_h_base: roundHours(sumBase),
        Segelflug_min_adjusted: r.adjusted.gliderMin,
        Segelflug_h_adjusted: roundHours(r.adjusted.gliderMin),
        Motorflug_min_adjusted: r.adjusted.motorMin,
        Motorflug_h_adjusted: roundHours(r.adjusted.motorMin),
        Schlepp_min_adjusted: r.adjusted.towMin,
        Schlepp_h_adjusted: roundHours(r.adjusted.towMin),
        Summe_min_adjusted: sumAdj,
        Summe_h_adjusted: roundHours(sumAdj),
      }
    })

    const sheetName = `Arbeitsstunden ${year}`.slice(0, 31)
    const ws = XLSX.utils.json_to_sheet(sheetRows, { header: [...HEADERS] })

    const hourColIndices = [4, 6, 8, 10, 12, 14, 16, 18]
    const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1')
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (const C of hourColIndices) {
        const ref = XLSX.utils.encode_cell({ r: R, c: C })
        if (ws[ref] && typeof ws[ref] === 'object' && ws[ref] !== null) {
          ;(ws[ref] as { z?: string }).z = '0.00'
        }
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const filename = `arbeitsstunden_${year}.xlsx`
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('working-hours export error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Export' },
      { status: 500 }
    )
  }
}
