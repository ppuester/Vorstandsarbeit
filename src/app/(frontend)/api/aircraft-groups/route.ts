import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'aircraft-groups' as CollectionSlug,
      depth: 0,
      sort: 'name',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching aircraft groups:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Laden der Flugzeuggruppen',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const payload = await getPayload({ config: configPromise })

    const created = await payload.create({
      collection: 'aircraft-groups' as CollectionSlug,
      data: body as any,
      depth: 0,
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error creating aircraft group:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Erstellen der Flugzeuggruppe',
      },
      { status: 500 }
    )
  }
}
