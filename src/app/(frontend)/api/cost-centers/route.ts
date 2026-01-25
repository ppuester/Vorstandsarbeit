import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'cost-centers' as CollectionSlug,
      where: {
        active: {
          equals: true,
        },
      },
      sort: 'name',
      depth: 0,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching cost centers:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Laden der Kostenstellen',
      },
      { status: 500 }
    )
  }
}
