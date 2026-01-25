import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import { hasPermission } from '@/utilities/validateAccessToken'

export async function GET(request: Request) {
  try {
    // Prüfe Token-Berechtigung (optional für Kraftstofferfassung)
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '') || new URL(request.url).searchParams.get('token')
    
    // Wenn Token vorhanden, prüfe Berechtigung
    if (token) {
      const hasAccess = await hasPermission(token, 'fuelTracking')
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Keine Berechtigung' },
          { status: 403 }
        )
      }
    }

    const payload = await getPayload({ config: configPromise })

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {}
    if (activeOnly) {
      where.active = { equals: true }
    }

    const result = await payload.find({
      collection: 'members' as CollectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      depth: 0,
      sort: 'name',
      limit: 1000,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Laden der Mitglieder',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const payload = await getPayload({ config: configPromise })

    const created = await payload.create({
      collection: 'members' as CollectionSlug,
      data: body as any,
      depth: 0,
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Erstellen des Mitglieds',
      },
      { status: 500 }
    )
  }
}
