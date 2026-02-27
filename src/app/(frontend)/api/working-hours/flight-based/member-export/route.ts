import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import * as XLSX from 'xlsx'
import {
  getMemberFlightDetails,
  type MemberFlightCategory,
  type MemberFlightDetail,
} from '@/utilities/memberFlightDetails'

export const runtime = 'nodejs'

function sanitizeFilePart(input: string): string {
  return input.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/-+/g, '-')
}

function buildSheetRows(
  details: MemberFlightDetail[],
  category: MemberFlightCategory,
  includeAdjusted: boolean
): { rows: any[][]; totalMinutes: number } {
  const rows: any[][] = []
  const header = [
    'Datum',
    'LFZ',
    'Minuten',
    'Schlepp-LFZ',
    'Startort',
    'Landeort',
    'Startzeit',
    'Landezeit',
    'Bemerkung',
  ]
  rows.push(header)

  let totalMinutes = 0

  for (const d of details) {
    const baseMinutes =
      category === 'glider'
        ? d.workingMinutesGlider
        : category === 'motor'
          ? d.workingMinutesMotor
          : d.workingMinutesTow
    const minutes = includeAdjusted ? d.adjustedMinutes : baseMinutes
    totalMinutes += minutes
    const dateStr = d.date
      ? new Date(d.date).toLocaleDateString('de-DE')
      : ''
    rows.push([
      dateStr,
      d.aircraftRegistration || '',
      minutes,
      d.sourceTowAircraftRegistration || '',
      d.departureLocation || '',
      d.landingLocation || '',
      d.startTime || '',
      d.landingTime || '',
      d.notes || '',
    ])
  }

  return { rows, totalMinutes }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const memberId = searchParams.get('memberId')
    const pilotName = searchParams.get('pilotName')
    const includeAdjustedParam = searchParams.get('includeAdjusted')
    const includeAdjusted = includeAdjustedParam !== 'false'

    if (!yearParam) {
      return NextResponse.json(
        { error: 'Query-Parameter year ist erforderlich' },
        { status: 400 }
      )
    }
    const year = Number.parseInt(yearParam, 10)
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: 'Ungültiges Jahr' }, { status: 400 })
    }

    if (!memberId && !pilotName) {
      return NextResponse.json(
        { error: 'memberId oder pilotName erforderlich' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    let memberLabel = pilotName ?? ''
    if (memberId) {
      const member = await payload.findByID({
        collection: 'members' as CollectionSlug,
        id: memberId,
        depth: 0,
      }).catch(() => null)
      if (member) {
        const m = member as { name?: string | null; memberNumber?: string | null }
        memberLabel = m.name ?? ''
        if (m.memberNumber) {
          memberLabel = `${memberLabel} (${m.memberNumber})`
        }
      }
    }

    const categories: MemberFlightCategory[] = ['glider', 'motor', 'tow']
    const wb = XLSX.utils.book_new()
    let grandTotalMinutes = 0

    for (const category of categories) {
      const details = await getMemberFlightDetails(payload as any, {
        year,
        category,
        memberId: memberId ?? undefined,
        pilotName: pilotName ?? undefined,
      })

      const { rows, totalMinutes } = buildSheetRows(details, category, includeAdjusted)
      grandTotalMinutes += totalMinutes

      const sheetRows: any[][] = []
      const exportDate = new Date()
      const totalHours = totalMinutes / 60
      sheetRows.push([
        `Mitglied: ${memberLabel || pilotName || ''}`,
        `Jahr: ${year}`,
        `Export: ${exportDate.toLocaleString('de-DE')}`,
        `Summe Minuten: ${totalMinutes}`,
        `Summe Stunden: ${totalHours.toFixed(2)}`,
      ])
      sheetRows.push([])
      sheetRows.push(...rows)

      const ws = XLSX.utils.aoa_to_sheet(sheetRows)
      const sheetName =
        category === 'glider'
          ? 'Segelflug'
          : category === 'motor'
            ? 'Motorflug'
            : 'Schlepp'
      XLSX.utils.book_append_sheet(wb, ws, sheetName)
    }

    const filename = `arbeitsstunden_details_${year}_${sanitizeFilePart(
      memberLabel || pilotName || 'mitglied'
    )}.xlsx`
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('member-export error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Mitglieds-Export' },
      { status: 500 }
    )
  }
}

