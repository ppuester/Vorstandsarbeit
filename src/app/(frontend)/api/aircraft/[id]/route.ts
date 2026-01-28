import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

interface RouteContext {
  params: {
    id: string
  }
}

// Einzelnes Flugzeug laden (wird vom Payload-Admin beim Bearbeiten verwendet)
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const payload = await getPayload({ config: configPromise })

    const { searchParams } = new URL(request.url)
    const depthParam = searchParams.get('depth')
    const depth = depthParam != null ? parseInt(depthParam, 10) || 0 : 0

    const doc = await payload.findByID({
      collection: 'aircraft' as CollectionSlug,
      id: params.id,
      depth,
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Error fetching aircraft by id:', error)
    return NextResponse.json(
      {
        error:
          'Fehler beim Laden des Flugzeugs: ' +
          (error instanceof Error ? error.message : 'Unbekannter Fehler'),
      },
      { status: 500 },
    )
  }
}

// Flugzeug aktualisieren (Admin-Speichern)
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { searchParams } = new URL(request.url)
    const depthParam = searchParams.get('depth')
    const depth = depthParam != null ? parseInt(depthParam, 10) || 0 : 0

    const updated = await payload.update({
      collection: 'aircraft' as CollectionSlug,
      id: params.id,
      data: body as any,
      depth,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating aircraft:', error)
    return NextResponse.json(
      {
        error:
          'Fehler beim Aktualisieren des Flugzeugs: ' +
          (error instanceof Error ? error.message : 'Unbekannter Fehler'),
      },
      { status: 500 },
    )
  }
}

// Flugzeug löschen (Admin)
export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const payload = await getPayload({ config: configPromise })

    await payload.delete({
      collection: 'aircraft' as CollectionSlug,
      id: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting aircraft:', error)
    return NextResponse.json(
      {
        error:
          'Fehler beim Löschen des Flugzeugs: ' +
          (error instanceof Error ? error.message : 'Unbekannter Fehler'),
      },
      { status: 500 },
    )
  }
}
