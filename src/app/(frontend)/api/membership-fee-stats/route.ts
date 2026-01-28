import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')

    const payload = await getPayload({ config: configPromise })

    const where: any = {}

    if (yearParam) {
      const year = Number(yearParam)
      if (!Number.isNaN(year)) {
        where.year = { equals: year }
      }
    }

    const result = await payload.find({
      collection: 'membership-fee-stats' as CollectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      limit: 1000,
      sort: '-year',
      depth: 1,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching membership fee stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Mitgliederbestände' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    const created = await payload.create({
      collection: 'membership-fee-stats' as CollectionSlug,
      data: body as any,
      depth: 1,
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error creating membership fee stat:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Mitgliederbestands' },
      { status: 500 },
    )
  }
}

