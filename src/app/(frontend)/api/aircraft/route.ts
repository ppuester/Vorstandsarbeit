import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'aircraft' as CollectionSlug,
      sort: 'registration',
      limit: 1000,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching aircraft:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Flugzeuge' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    const created = await payload.create({
      collection: 'aircraft' as CollectionSlug,
      data: body as any,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('Error creating aircraft:', error)
    return NextResponse.json(
      {
        error:
          'Fehler beim Erstellen des Flugzeugs: ' +
          (error instanceof Error ? error.message : 'Unbekannter Fehler'),
      },
      { status: 500 }
    )
  }
}
