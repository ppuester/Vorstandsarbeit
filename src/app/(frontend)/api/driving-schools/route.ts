import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(req.url)
    const ids = searchParams.get('ids')

    if (!ids) {
      return NextResponse.json(
        { error: 'IDs erforderlich' },
        { status: 400 }
      )
    }

    const idArray = ids.split(',').filter(Boolean)

    const schools = await payload.find({
      collection: 'driving-schools',
      where: {
        id: { in: idArray },
        _status: { equals: 'published' },
      },
      limit: 20,
    })

    return NextResponse.json(schools)
  } catch (error) {
    console.error('Fehler beim Abrufen der Fahrschulen:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Fahrschulen' },
      { status: 500 }
    )
  }
}
