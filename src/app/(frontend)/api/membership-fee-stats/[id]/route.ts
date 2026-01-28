import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    const updated = await payload.update({
      collection: 'membership-fee-stats' as CollectionSlug,
      id,
      data: body as any,
      depth: 1,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating membership fee stat:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Mitgliederbestands' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    await payload.delete({
      collection: 'membership-fee-stats' as CollectionSlug,
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting membership fee stat:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Mitgliederbestands' },
      { status: 500 },
    )
  }
}

