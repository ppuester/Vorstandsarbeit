import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
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

    // Lade ALLE Transaktionen (ohne Pagination) für die Summenberechnung
    const result = await payload.find({
      collection: 'transactions' as CollectionSlug,
      where: Object.keys(where).length > 0 ? where : undefined,
      depth: 0,
      limit: 100000, // Sehr hohes Limit, um alle Einträge zu bekommen
      sort: '-date',
    })

    // Berechne Summen basierend auf dem type-Feld
    let totalIncome = 0
    let totalExpenses = 0

    result.docs.forEach((doc: any) => {
      if (doc.type === 'income') {
        // Einnahmen sind immer positiv
        totalIncome += Math.abs(doc.amount)
      } else if (doc.type === 'expense') {
        // Ausgaben sind immer negativ, daher Betrag nehmen
        totalExpenses += Math.abs(doc.amount)
      } else {
        // Fallback: Wenn kein type vorhanden ist, basierend auf amount
        if (doc.amount > 0) {
          totalIncome += doc.amount
        } else if (doc.amount < 0) {
          totalExpenses += Math.abs(doc.amount)
        }
      }
    })

    const balance = totalIncome - totalExpenses

    return NextResponse.json({
      income: totalIncome,
      expenses: totalExpenses,
      balance,
      count: result.totalDocs,
    })
  } catch (error) {
    console.error('Error calculating totals:', error)
    return NextResponse.json(
      { error: 'Fehler beim Berechnen der Summen' },
      { status: 500 }
    )
  }
}
