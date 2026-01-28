import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

type GroupType = 'aircraft' | 'generalCost'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupType = (searchParams.get('groupType') as GroupType) || 'aircraft'
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId ist erforderlich' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Alle Transaktionen laden (ähnlich yearly-stats)
    const result = await payload.find({
      collection: 'transactions' as CollectionSlug,
      limit: 10000,
      sort: 'date',
    })

    type YearData = {
      income: number
      expenses: number
      count: number
    }

    const yearMap = new Map<number, YearData>()

    result.docs.forEach((transaction: any) => {
      if (!transaction.costAllocations || !Array.isArray(transaction.costAllocations)) {
        return
      }

      const date = new Date(transaction.date)
      const year = date.getFullYear()

      // Finde die relevante Zuordnung für dieses groupId
      const allocation = transaction.costAllocations.find((alloc: any) => {
        const allocationType =
          alloc.allocationType || (alloc.aircraft ? 'aircraft' : 'generalCost')

        if (allocationType !== groupType) return false

        if (groupType === 'aircraft') {
          const aircraftId =
            typeof alloc.aircraft === 'object' && alloc.aircraft !== null
              ? alloc.aircraft.id
              : alloc.aircraft
          return aircraftId === groupId
        }

        const generalCostId =
          typeof alloc.generalCost === 'object' && alloc.generalCost !== null
            ? alloc.generalCost.id
            : alloc.generalCost
        return generalCostId === groupId
      })

      if (!allocation) return

      if (!yearMap.has(year)) {
        yearMap.set(year, { income: 0, expenses: 0, count: 0 })
      }

      const yearData = yearMap.get(year)!
      yearData.count++

      const weightedAmount = (transaction.amount * allocation.weight) / 100

      if (transaction.type === 'income') {
        yearData.income += weightedAmount
      } else {
        yearData.expenses += weightedAmount
      }
    })

    const stats = Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
        transactionCount: data.count,
      }))
      .sort((a, b) => a.year - b.year)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching group stats:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Gruppenauswertung' },
      { status: 500 },
    )
  }
}

