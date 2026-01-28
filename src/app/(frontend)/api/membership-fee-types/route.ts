import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'membership-fee-types' as CollectionSlug,
      limit: 1000,
      sort: 'name',
      depth: 1,
      where: {
        active: { equals: true },
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching membership fee types:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Beitragsarten' },
      { status: 500 },
    )
  }
}

