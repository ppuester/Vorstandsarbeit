import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'transactions',
      depth: 2, // Include category and aircraft relationships
      sort: '-date',
      limit: 10000, // Get all transactions
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Kontobewegungen' },
      { status: 500 }
    )
  }
}
