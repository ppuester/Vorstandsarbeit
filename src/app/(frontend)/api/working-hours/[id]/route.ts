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
      collection: 'working-hours' as CollectionSlug,
      id,
      data: body as any,
      depth: 1,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating working hours:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Aktualisieren der Arbeitsstunden' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    await payload.delete({
      collection: 'working-hours' as CollectionSlug,
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting working hours:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Löschen der Arbeitsstunden' },
      { status: 500 },
    )
  }
}
