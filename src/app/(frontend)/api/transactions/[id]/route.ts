import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const payload = await getPayload({ config: configPromise })

    const updated = await payload.update({
      collection: 'transactions' as CollectionSlug,
      id: id,
      data: body,
      depth: 2, // Include category and aircraft relationships
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der Kontobewegung' },
      { status: 500 }
    )
  }
}
