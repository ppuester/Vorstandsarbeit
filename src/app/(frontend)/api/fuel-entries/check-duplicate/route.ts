import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      date,
      name,
      aircraft,
      fuelType,
      meterReadingOld,
      meterReadingNew,
      liters,
      pricePerLiter,
      gasStation,
      invoiceNumber,
    } = body

    const payload = await getPayload({ config: configPromise })

    // Suche nach identischen Einträgen
    // Ein Eintrag gilt als Duplikat, wenn alle folgenden Felder übereinstimmen:
    // - Datum
    // - Name
    // - Flugzeug
    // - Kraftstofftyp
    // - Zählerstand alt
    // - Zählerstand neu
    // - Tankstelle (falls vorhanden)
    // - Rechnungsnummer (falls vorhanden)

    const where: any = {
      and: [
        { date: { equals: date } },
        { name: { equals: name } },
        { aircraft: { equals: aircraft } },
        { fuelType: { equals: fuelType } },
        { meterReadingOld: { equals: meterReadingOld } },
        { meterReadingNew: { equals: meterReadingNew } },
      ],
    }

    // Füge optionale Felder hinzu, wenn sie vorhanden sind
    if (gasStation) {
      where.and.push({ gasStation: { equals: gasStation } })
    } else {
      where.and.push({ gasStation: { exists: false } })
    }

    if (invoiceNumber) {
      where.and.push({ invoiceNumber: { equals: invoiceNumber } })
    } else {
      where.and.push({ invoiceNumber: { exists: false } })
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
