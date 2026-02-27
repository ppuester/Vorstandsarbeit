import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  getMemberFlightDetails,
  type MemberFlightDetail,
  type MemberFlightCategory,
} from '@/utilities/memberFlightDetails'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const memberId = searchParams.get('memberId')
    const pilotName = searchParams.get('pilotName')
    const category = searchParams.get('category') as MemberFlightCategory | null

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

    const list: MemberFlightDetail[] = await getMemberFlightDetails(payload as any, {
      year,
      category,
      memberId: memberId ?? undefined,
      pilotName: pilotName ?? undefined,
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
