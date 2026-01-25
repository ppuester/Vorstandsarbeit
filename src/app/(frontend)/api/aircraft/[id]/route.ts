import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    const aircraft = await payload.findByID({
      collection: 'aircraft' as CollectionSlug,
      id: id,
    })

    return NextResponse.json(aircraft)
  } catch (error) {
    console.error('Error fetching aircraft:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Flugzeugs' },
      { status: 500 }
    )
  }
}
