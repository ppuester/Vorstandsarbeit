import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const year = searchParams.get('year')
    const type = searchParams.get('type')

    const payload = await getPayload({ config: configPromise })

    const where: any = {}

    if (memberId) {
      where.member = { equals: memberId }
    }

    if (year) {
      const yearNum = Number.parseInt(year, 10)
      if (!Number.isNaN(yearNum)) {
        const startDate = new Date(yearNum, 0, 1)
        const endDate = new Date(yearNum, 11, 31, 23, 59, 59)
        where.date = {
          greater_than_equal: startDate.toISOString(),
          less_than_equal: endDate.toISOString(),
        }
      }
    }

    if (type) {
      where.type = { equals: type }
    }

    const result = await payload.find({
      collection: 'working-hours' as CollectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      depth: 1,
      sort: '-date',
      limit: 1000,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching working hours:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Arbeitsstunden' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const result = await payload.create({
      collection: 'working-hours' as CollectionSlug,
      data: body,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error creating working hours:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Erstellen der Arbeitsstunden' },
      { status: 500 },
    )
  }
}
