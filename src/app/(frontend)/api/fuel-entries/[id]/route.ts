import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import { hasPermission } from '@/utilities/validateAccessToken'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Prüfe Token-Berechtigung
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || new URL(request.url).searchParams.get('token')
    
    if (token) {
      const hasAccess = await hasPermission(token, 'fuelTracking')
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Keine Berechtigung für Kraftstofferfassung' },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const payload = await getPayload({ config: configPromise })

    // Berechne Liter automatisch, falls Zählerstände geändert wurden
    if (body.meterReadingOld !== undefined && body.meterReadingNew !== undefined) {
      body.liters = Math.max(0, body.meterReadingNew - body.meterReadingOld)
    }

    const updated = await payload.update({
      collection: 'fuel-entries' as CollectionSlug,
      id,
      data: body as any,
      depth: 2,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating fuel entry:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Aktualisieren des Kraftstoffeintrags',
      },
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
    
    // Prüfe Token-Berechtigung
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || new URL(request.url).searchParams.get('token')
    
    if (token) {
      const hasAccess = await hasPermission(token, 'fuelTracking')
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Keine Berechtigung für Kraftstofferfassung' },
          { status: 403 }
        )
      }
    }

    const payload = await getPayload({ config: configPromise })

    await payload.delete({
      collection: 'fuel-entries' as CollectionSlug,
      id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fuel entry:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Löschen des Kraftstoffeintrags',
      },
      { status: 500 }
    )
  }
}
