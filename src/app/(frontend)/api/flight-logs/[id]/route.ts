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
    const depth = depthParam != null ? parseInt(depthParam, 10) || 2 : 2

    const doc = await payload.findByID({
      collection: 'flight-logs' as CollectionSlug,
      id,
      depth,
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error fetching flight log:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Flugbucheintrags' },
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
      collection: 'flight-logs' as CollectionSlug,
      id,
      data: body as any,
      depth: 2,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating flight log:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Flugbucheintrags' },
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
      collection: 'flight-logs' as CollectionSlug,
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting flight log:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Flugbucheintrags' },
      { status: 500 },
    )
  }
}
