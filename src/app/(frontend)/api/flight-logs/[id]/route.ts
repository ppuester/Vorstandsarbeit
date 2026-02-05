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
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      { status: 500 }
    )
  }
}
