import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'flight-logs' as CollectionSlug,
      depth: 2,
      sort: '-year',
      limit: 1000,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching flight logs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Flugbücher' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const payload = await getPayload({ config: configPromise })

    const created = await payload.create({
      collection: 'flight-logs' as CollectionSlug,
      data: body as any,
      depth: 2,
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error creating flight log:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen des Flugbucheintrags' },
      { status: 500 }
    )
  }
}
