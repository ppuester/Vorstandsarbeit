import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import * as XLSX from 'xlsx'
import { aggregateWorkingHoursByMember, roundHours } from '@/utilities/aggregateWorkingHoursByMember'

export const runtime = 'nodejs'

const HEADERS = [
  'Mitgliedsnummer',
  'Name',
  'Arbeitsstunden Segelflug in min',
  'Arbeitsstunden Segelflug in Stunden',
  'Arbeitsstunden Motorflug in min',
  'Arbeitsstunden Motorflug in Stunden',
  'Arbeitsstunden Schlepp in min',
  'Arbeitsstunden Schlepp in Stunden',
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

    const sheetRows = rows.map((r) => ({
      Mitgliedsnummer: r.memberId ? memberNumberById.get(r.memberId) ?? '' : '',
      Name: r.memberName,
      'Arbeitsstunden Segelflug in min': r.adjusted.gliderMin,
      'Arbeitsstunden Segelflug in Stunden': roundHours(r.adjusted.gliderMin),
      'Arbeitsstunden Motorflug in min': r.adjusted.motorMin,
      'Arbeitsstunden Motorflug in Stunden': roundHours(r.adjusted.motorMin),
      'Arbeitsstunden Schlepp in min': r.adjusted.towMin,
      'Arbeitsstunden Schlepp in Stunden': roundHours(r.adjusted.towMin),
    }))

    const sheetName = `Arbeitsstunden ${year}`.slice(0, 31)
    const ws = XLSX.utils.json_to_sheet(sheetRows, { header: [...HEADERS] })

    const hourColIndices = [3, 5, 7] // Spalten "in Stunden" (0-basiert: Segelflug, Motorflug, Schlepp)
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
