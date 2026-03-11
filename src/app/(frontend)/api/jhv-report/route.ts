import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

const SONSTIGE_LABEL = 'Sonstige'

function getCategoryName(cat: { name?: string } | string | null | undefined): string {
  if (cat == null) return SONSTIGE_LABEL
  if (typeof cat === 'string') return SONSTIGE_LABEL
  return (cat.name && cat.name.trim()) || SONSTIGE_LABEL
}

function aggregateByCategory(
  docs: { type: string; amount: number; category?: { name?: string } | string | null }[],
  type: 'income' | 'expense'
) {
  const map = new Map<string, number>()
  docs
    .filter((d) => d.type === type)
    .forEach((d) => {
      const name = getCategoryName(d.category)
      const amt = Math.abs(Number(d.amount)) || 0
      map.set(name, (map.get(name) ?? 0) + amt)
    })
  return Array.from(map.entries())
    .map(([name, sum]) => ({ category: name, sum }))
    .sort((a, b) => b.sum - a.sum)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const compareYearParam = searchParams.get('compareYear')

    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()
    const compareYear = compareYearParam ? parseInt(compareYearParam, 10) : null

    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: 'Ungültiges Jahr' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    const dateToPrevYear = `${year - 1}-12-31`
    const dateFromYear = `${year}-01-01`
    const dateToYear = `${year}-12-31`

    const [
      transactionsBeforeYear,
      transactionsInYear,
      membershipStatsRes,
      flightLogsRes,
      activeMembersRes,
    ] = await Promise.all([
        payload.find({
          collection: 'transactions' as CollectionSlug,
          where: { date: { less_than_equal: dateToPrevYear } },
          depth: 0,
          limit: 100000,
          sort: 'date',
        }),
        payload.find({
          collection: 'transactions' as CollectionSlug,
          where: {
            date: {
              greater_than_equal: dateFromYear,
              less_than_equal: dateToYear,
            },
          },
          depth: 1,
          limit: 100000,
          sort: 'date',
        }),
        payload.find({
          collection: 'membership-fee-stats' as CollectionSlug,
          where: { year: { equals: year } },
          depth: 1,
          limit: 500,
        }),
        payload.find({
          collection: 'flight-logs' as CollectionSlug,
          where: { year: { equals: year } },
          depth: 0,
          limit: 500,
        }),
        payload.find({
          collection: 'members' as CollectionSlug,
          where: { active: { equals: true } },
          depth: 0,
          limit: 5000,
        }),
      ])

    let openingBalance = 0
    ;(transactionsBeforeYear.docs as any[]).forEach((d) => {
      const amt = Number(d.amount) || 0
      if (d.type === 'income') openingBalance += amt
      else openingBalance -= amt
    })

    let income = 0
    let expenses = 0
    ;(transactionsInYear.docs as any[]).forEach((d) => {
      const amt = Math.abs(Number(d.amount)) || 0
      if (d.type === 'income') income += amt
      else expenses += amt
    })

    const result = income - expenses
    const closingBalance = openingBalance + result

    const incomeByCategory = aggregateByCategory(
      transactionsInYear.docs as any[],
      'income'
    )
    const expensesByCategory = aggregateByCategory(
      transactionsInYear.docs as any[],
      'expense'
    )

    let memberCount = 0
    let membershipIncome = 0
    ;(membershipStatsRes.docs || []).forEach((doc: any) => {
      memberCount += Number(doc.memberCount) || 0
      membershipIncome +=
        doc.totalIncome != null
          ? Number(doc.totalIncome)
          : (Number(doc.memberCount) || 0) * (Number(doc.amountPerMember) || 0)
    })

    let totalStarts = 0
    let totalFlightHours = 0
    ;(flightLogsRes.docs || []).forEach((doc: any) => {
      totalStarts += Number(doc.starts) || 0
      totalFlightHours += Number(doc.flightHours) || 0
    })

    const activeMemberCount = activeMembersRes.totalDocs || 0
    const incomePerActiveMember =
      activeMemberCount > 0 ? income / activeMemberCount : 0
    const expensesPerActiveMember =
      activeMemberCount > 0 ? expenses / activeMemberCount : 0
    const resultPerActiveMember =
      activeMemberCount > 0 ? result / activeMemberCount : 0
    const membershipIncomePerActiveMember =
      activeMemberCount > 0 ? membershipIncome / activeMemberCount : 0
    const flightHoursPerActiveMember =
      activeMemberCount > 0 ? totalFlightHours / activeMemberCount : 0
    const startsPerActiveMember =
      activeMemberCount > 0 ? totalStarts / activeMemberCount : 0

    const report: JhvReport = {
      year,
      openingBalance,
      income,
      expenses,
      result,
      closingBalance,
      transactionCount: transactionsInYear.totalDocs,
      incomeByCategory,
      expensesByCategory,
      memberCount,
      membershipIncome,
      totalStarts,
      totalFlightHours,
      activeMemberCount,
      incomePerActiveMember,
      expensesPerActiveMember,
      resultPerActiveMember,
      membershipIncomePerActiveMember,
      flightHoursPerActiveMember,
      startsPerActiveMember,
      priorYear: null,
    }

    if (compareYear != null && !Number.isNaN(compareYear) && compareYear >= 2000 && compareYear <= 2100 && compareYear !== year) {
      const dateToComparePrev = `${compareYear - 1}-12-31`
      const dateFromCompare = `${compareYear}-01-01`
      const dateToCompare = `${compareYear}-12-31`

      const [beforeCompare, inCompare, membershipCompare, flightLogsCompare] =
        await Promise.all([
          payload.find({
            collection: 'transactions' as CollectionSlug,
            where: { date: { less_than_equal: dateToComparePrev } },
            depth: 0,
            limit: 100000,
            sort: 'date',
          }),
          payload.find({
            collection: 'transactions' as CollectionSlug,
            where: {
              date: {
                greater_than_equal: dateFromCompare,
                less_than_equal: dateToCompare,
              },
            },
            depth: 1,
            limit: 100000,
            sort: 'date',
          }),
          payload.find({
            collection: 'membership-fee-stats' as CollectionSlug,
            where: { year: { equals: compareYear } },
            depth: 1,
            limit: 500,
          }),
          payload.find({
            collection: 'flight-logs' as CollectionSlug,
            where: { year: { equals: compareYear } },
            depth: 0,
            limit: 500,
          }),
        ])

      let openingCompare = 0
      ;(beforeCompare.docs as any[]).forEach((d) => {
        const amt = Number(d.amount) || 0
        if (d.type === 'income') openingCompare += amt
        else openingCompare -= amt
      })

      let incomeCompare = 0
      let expensesCompare = 0
      ;(inCompare.docs as any[]).forEach((d) => {
        const amt = Math.abs(Number(d.amount)) || 0
        if (d.type === 'income') incomeCompare += amt
        else expensesCompare += amt
      })

      let memberCountCompare = 0
      let membershipIncomeCompare = 0
      ;(membershipCompare.docs || []).forEach((doc: any) => {
        memberCountCompare += Number(doc.memberCount) || 0
        membershipIncomeCompare +=
          doc.totalIncome != null
            ? Number(doc.totalIncome)
            : (Number(doc.memberCount) || 0) * (Number(doc.amountPerMember) || 0)
      })

      let totalStartsCompare = 0
      let totalFlightHoursCompare = 0
      ;(flightLogsCompare.docs || []).forEach((doc: any) => {
        totalStartsCompare += Number(doc.starts) || 0
        totalFlightHoursCompare += Number(doc.flightHours) || 0
      })

      report.priorYear = {
        year: compareYear,
        openingBalance: openingCompare,
        income: incomeCompare,
        expenses: expensesCompare,
        result: incomeCompare - expensesCompare,
        closingBalance: openingCompare + (incomeCompare - expensesCompare),
        transactionCount: inCompare.totalDocs,
        memberCount: memberCountCompare,
        membershipIncome: membershipIncomeCompare,
        totalStarts: totalStartsCompare,
        totalFlightHours: totalFlightHoursCompare,
      }
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('JHV report error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der JHV-Auswertung' },
      { status: 500 }
    )
  }
}

export interface JhvCategoryRow {
  category: string
  sum: number
}

export interface JhvPriorYear {
  year: number
  openingBalance: number
  income: number
  expenses: number
  result: number
  closingBalance: number
  transactionCount: number
  memberCount: number
  membershipIncome: number
  totalStarts: number
  totalFlightHours: number
}

export interface JhvReport {
  year: number
  openingBalance: number
  income: number
  expenses: number
  result: number
  closingBalance: number
  transactionCount: number
  incomeByCategory: JhvCategoryRow[]
  expensesByCategory: JhvCategoryRow[]
  memberCount: number
  membershipIncome: number
  totalStarts: number
  totalFlightHours: number
   /**
   * Aktive Mitglieder (Flag im Mitgliederstamm, aktueller Stand)
   */
  activeMemberCount: number
  incomePerActiveMember: number
  expensesPerActiveMember: number
  resultPerActiveMember: number
  membershipIncomePerActiveMember: number
  flightHoursPerActiveMember: number
  startsPerActiveMember: number
  priorYear: JhvPriorYear | null
}
