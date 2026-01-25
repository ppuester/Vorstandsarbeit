import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'flight-logs' as CollectionSlug,
      depth: 1, // Include aircraft relationship
      sort: '-year',
      limit: 10000,
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
