import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionType = searchParams.get('type') // 'income' or 'expense'
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const payload = await getPayload({ config: configPromise })

    const where: any = {}
    
    if (activeOnly) {
      where.active = { equals: true }
    }

    // Filter by transaction type if provided
    if (transactionType === 'income') {
      where.availableForIncome = { equals: true }
    } else if (transactionType === 'expense') {
      where.availableForExpense = { equals: true }
    }

    const result = await payload.find({
      collection: 'general-costs' as CollectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      depth: 0,
      sort: 'name',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching general costs:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Laden der allgemeinen Kosten',
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
      collection: 'general-costs' as CollectionSlug,
      data: body as any,
      depth: 0,
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error('Error creating general cost:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Erstellen der allgemeinen Kosten',
      },
      { status: 500 }
    )
  }
}
