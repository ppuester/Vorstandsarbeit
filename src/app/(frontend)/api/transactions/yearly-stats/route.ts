import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get all transactions
    const result = await payload.find({
      collection: 'transactions' as const,
      limit: 10000,
      sort: 'date',
    })

    // Group by year
    const yearMap = new Map<number, { income: number; expenses: number; count: number }>()

    result.docs.forEach((transaction) => {
      const date = new Date(transaction.date)
      const year = date.getFullYear()

      if (!yearMap.has(year)) {
        yearMap.set(year, { income: 0, expenses: 0, count: 0 })
      }

      const yearData = yearMap.get(year)!
      yearData.count++

      if (transaction.type === 'income') {
        yearData.income += transaction.amount
      } else {
        yearData.expenses += transaction.amount
      }
    })

    // Convert to array and calculate balance
    const yearStats = Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
        transactionCount: data.count,
      }))
      .sort((a, b) => a.year - b.year)

    return NextResponse.json(yearStats)
  } catch (error) {
    console.error('Error fetching yearly stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Jahresstatistiken' },
      { status: 500 }
    )
  }
}
