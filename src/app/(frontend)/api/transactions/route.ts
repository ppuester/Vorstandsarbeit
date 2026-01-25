import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const depth = parseInt(searchParams.get('depth') || '2', 10)
    const type = searchParams.get('type') // 'income' | 'expense' | null
    const search = searchParams.get('search') || ''
    const processed = searchParams.get('processed') // 'true' | 'false' | null
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const amountMin = searchParams.get('amountMin') || ''
    const amountMax = searchParams.get('amountMax') || ''

    const payload = await getPayload({ config: configPromise })

    const where: any = {}

    if (type) {
      where.type = { equals: type }
    }

    if (processed === 'true') {
      where.processed = { equals: true }
    } else if (processed === 'false') {
      where.processed = { equals: false }
    }

    if (search) {
      where.or = [
        { description: { contains: search } },
        { reference: { contains: search } },
      ]
    }

    if (dateFrom) {
      where.date = { ...where.date, greater_than_equal: dateFrom }
    }

    if (dateTo) {
      where.date = { ...where.date, less_than_equal: dateTo }
    }

    if (amountMin) {
      const min = parseFloat(amountMin)
      if (!isNaN(min)) {
        where.amount = { ...where.amount, greater_than_equal: min }
      }
    }

    if (amountMax) {
      const max = parseFloat(amountMax)
      if (!isNaN(max)) {
        where.amount = { ...where.amount, less_than_equal: max }
      }
    }

    // Wenn depth angegeben ist, lade alle Transaktionen ohne Pagination
    const result = await payload.find({
      collection: 'transactions' as CollectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      depth,
      sort: '-date',
      limit: depth > 1 ? 100000 : limit, // Alle laden wenn depth > 1 (für Kostenermittlung)
      page: depth > 1 ? 1 : page,
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
