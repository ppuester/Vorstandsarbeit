import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const payload = await getPayload({ config: configPromise })

    // Extrahiere Daten aus FormData
    const date = formData.get('date') as string
    const name = formData.get('name') as string
    const aircraft = formData.get('aircraft') as string
    const fuelType = formData.get('fuelType') as string
    const meterReadingOld = parseFloat(formData.get('meterReadingOld') as string)
    const meterReadingNew = parseFloat(formData.get('meterReadingNew') as string)
    const liters = parseFloat(formData.get('liters') as string)
    const pricePerLiter = parseFloat(formData.get('pricePerLiter') as string)
    const totalPrice = parseFloat(formData.get('totalPrice') as string)
    const gasStation = formData.get('gasStation') as string
    const invoiceNumber = formData.get('invoiceNumber') as string
    const notes = formData.get('notes') as string
    const invoiceFile = formData.get('invoice') as File | null

    // Lade Datei hoch, falls vorhanden
    let invoiceMediaId: string | undefined
    if (invoiceFile && invoiceFile.size > 0) {
      const arrayBuffer = await invoiceFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const uploadedMedia = await payload.create({
        collection: 'media' as CollectionSlug,
        data: {
          alt: `Rechnung ${invoiceNumber || date}`,
        },
        file: {
          data: buffer,
          mimetype: invoiceFile.type,
          name: invoiceFile.name,
          size: invoiceFile.size,
        },
      })

      invoiceMediaId = uploadedMedia.id
    }

    // Erstelle Kraftstoffeintrag
    const entry = await payload.create({
      collection: 'fuel-entries' as CollectionSlug,
      data: {
        date,
        name,
        aircraft,
        fuelType,
        meterReadingOld,
        meterReadingNew,
        liters,
        pricePerLiter,
        totalPrice,
        gasStation: gasStation || undefined,
        invoiceNumber: invoiceNumber || undefined,
        invoice: invoiceMediaId,
        notes: notes || undefined,
      },
      depth: 2,
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creating fuel entry:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Erstellen des Kraftstoffeintrags',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'fuel-entries' as CollectionSlug,
      depth: 2,
      sort: '-date',
      limit: 1000,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching fuel entries:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Laden der Kraftstoffeinträge',
      },
      { status: 500 }
    )
  }
}
