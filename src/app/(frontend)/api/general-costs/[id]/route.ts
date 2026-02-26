import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    const updated = await payload.update({
      collection: 'general-costs' as CollectionSlug,
      id,
      data: body as Record<string, unknown>,
      depth: 0,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating general cost:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren der allgemeinen Kosten' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    await payload.delete({
      collection: 'general-costs' as CollectionSlug,
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting general cost:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der allgemeinen Kosten' },
      { status: 500 },
    )
  }
}
