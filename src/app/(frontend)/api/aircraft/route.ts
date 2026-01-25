import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'aircraft',
      sort: 'registration',
      limit: 1000,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching aircraft:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Flugzeuge' },
      { status: 500 }
    )
  }
}
