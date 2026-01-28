import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    const { searchParams } = new URL(request.url)
    const depthParam = searchParams.get('depth')
    const depth = depthParam != null ? parseInt(depthParam, 10) || 0 : 0

    const doc = await payload.findByID({
      collection: 'aircraft-groups' as CollectionSlug,
      id,
      depth,
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error fetching aircraft group:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Laden der Flugzeuggruppe',
      },
      { status: 500 },
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await request.json()

    const payload = await getPayload({ config: configPromise })

    const updated = await payload.update({
      collection: 'aircraft-groups' as CollectionSlug,
      id,
      data: body as any,
      depth: 0,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating aircraft group:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Aktualisieren der Flugzeuggruppe',
      },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const payload = await getPayload({ config: configPromise })

    await payload.delete({
      collection: 'aircraft-groups' as CollectionSlug,
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting aircraft group:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Löschen der Flugzeuggruppe',
      },
      { status: 500 },
    )
  }
}
