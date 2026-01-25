import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import { hasPermission } from '@/utilities/validateAccessToken'

export async function POST(request: Request) {
  try {
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
    const {
      date,
      member, // Mitglied-ID
      aircraft,
      fuelType,
      meterReadingOld,
      meterReadingNew,
    } = body

    const payload = await getPayload({ config: configPromise })

    // Hole Mitgliedsname aus der Mitglied-ID
    let memberName = ''
    if (member) {
      try {
        const memberDoc = await payload.findByID({
          collection: 'members' as CollectionSlug,
          id: member,
        })
        memberName = (memberDoc as any)?.name?.toUpperCase() || ''
      } catch (error) {
        // Mitglied nicht gefunden, verwende leeren String
      }
    }

    // Suche nach identischen Einträgen
    // Ein Eintrag gilt als Duplikat, wenn alle folgenden Felder übereinstimmen:
    // - Datum
    // - Name (Mitgliedsname)
    // - Flugzeug
    // - Kraftstofftyp
    // - Zählerstand alt
    // - Zählerstand neu

    const where: any = {
      and: [
        { date: { equals: date } },
        { name: { equals: memberName } },
        { aircraft: { equals: aircraft } },
        { fuelType: { equals: fuelType } },
        { meterReadingOld: { equals: meterReadingOld } },
        { meterReadingNew: { equals: meterReadingNew } },
      ],
    }


    const result = await payload.find({
      collection: 'fuel-entries' as CollectionSlug,
      where,
      limit: 1,
    })

    return NextResponse.json({
      isDuplicate: result.totalDocs > 0,
    })
  } catch (error) {
    console.error('Error checking duplicate:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Prüfen auf Duplikate',
      },
      { status: 500 }
    )
  }
}
