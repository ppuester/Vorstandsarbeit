import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

type GroupType = 'aircraft' | 'generalCost'
type Kind = 'income' | 'expense'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupType = (searchParams.get('groupType') as GroupType) || 'aircraft'
    const groupId = searchParams.get('groupId')
    const kind = (searchParams.get('kind') as Kind) || 'income'

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId ist erforderlich' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Für allgemeine Kosten: alle Untergruppen (mehrstufig) mit einbeziehen
    let generalCostIds: Set<string> | null = null

    if (groupType === 'generalCost') {
      const generalCosts = await payload.find({
        collection: 'general-costs' as CollectionSlug,
        limit: 1000,
        depth: 0,
      })

      generalCostIds = new Set<string>()
      const childrenByParent = new Map<string, string[]>()

      generalCosts.docs.forEach((gc: any) => {
        const id = gc.id as string
        const parent =
          typeof gc.parent === 'object' && gc.parent !== null
            ? gc.parent.id
            : (gc.parent as string | undefined)

        if (parent) {
          if (!childrenByParent.has(parent)) {
            childrenByParent.set(parent, [])
          }
          childrenByParent.get(parent)!.push(id)
        }
      })

      const queue: string[] = [groupId]
      generalCostIds.add(groupId)

      while (queue.length > 0) {
        const current = queue.shift()!
        const children = childrenByParent.get(current) || []
        for (const childId of children) {
          if (!generalCostIds.has(childId)) {
            generalCostIds.add(childId)
            queue.push(childId)
          }
        }
      }
    }

    // Transaktionsbasierte Details
    const result = await payload.find({
      collection: 'transactions' as CollectionSlug,
      limit: 10000,
      sort: 'date',
      depth: 2,
    })

    type DetailItem = {
      id: string
      source: 'transaction' | 'membershipFee'
      year: number
      date?: string
      description: string
      reference?: string
      type: Kind
      amount: number
      weightedAmount: number
      allocationWeight?: number
    }

    const details: DetailItem[] = []

    result.docs.forEach((transaction: any) => {
      if (!transaction.costAllocations || !Array.isArray(transaction.costAllocations)) {
        return
      }

      if (transaction.type !== kind) return

      const date = new Date(transaction.date)
      const year = date.getFullYear()

      transaction.costAllocations.forEach((alloc: any, index: number) => {
        const allocationType =
          alloc.allocationType || (alloc.aircraft ? 'aircraft' : 'generalCost')

        if (allocationType !== groupType) return

        let matches = false

        if (groupType === 'aircraft') {
          const aircraftId =
            typeof alloc.aircraft === 'object' && alloc.aircraft !== null
              ? alloc.aircraft.id
              : alloc.aircraft
          matches = aircraftId === groupId
        } else {
          const generalCostId =
            typeof alloc.generalCost === 'object' && alloc.generalCost !== null
              ? alloc.generalCost.id
              : alloc.generalCost

          if (!generalCostId) return

          matches = generalCostIds
            ? generalCostIds.has(generalCostId)
            : generalCostId === groupId
        }

        if (!matches) return

        const weightedAmount = (transaction.amount * alloc.weight) / 100

        details.push({
          id: `tx-${transaction.id}-${index}`,
          source: 'transaction',
          year,
          date: transaction.date,
          description: transaction.description || '(ohne Beschreibung)',
          reference: transaction.reference,
          type: transaction.type,
          amount: transaction.amount,
          weightedAmount,
          allocationWeight: alloc.weight,
        })
      })
    })

    // Statische Mitgliedsbeitrags-Stände ebenfalls hinzufügen (nur Einnahmen)
    if (groupType === 'generalCost' && kind === 'income') {
      const membershipStats = await payload.find({
        collection: 'membership-fee-stats' as CollectionSlug,
        limit: 1000,
        depth: 1,
      })

      membershipStats.docs.forEach((doc: any) => {
        if (!doc.totalIncome) return

        const year = Number(doc.year)
        if (Number.isNaN(year)) return

        let targetGeneralCostId: string | null = null

        if (doc.generalCost) {
          targetGeneralCostId =
            typeof doc.generalCost === 'object' && doc.generalCost !== null
              ? doc.generalCost.id
              : doc.generalCost
        } else if (doc.feeType && doc.feeType.generalCost) {
          const gcRel = doc.feeType.generalCost
          targetGeneralCostId =
            typeof gcRel === 'object' && gcRel !== null ? gcRel.id : gcRel
        }

        if (!targetGeneralCostId) return

        const matchesGroup =
          generalCostIds && generalCostIds.size > 0
            ? generalCostIds.has(targetGeneralCostId)
            : targetGeneralCostId === groupId

        if (!matchesGroup) return

        const feeTypeName =
          doc.feeType && typeof doc.feeType === 'object' && doc.feeType !== null
            ? doc.feeType.name || ''
            : ''

        details.push({
          id: `membership-${doc.id}`,
          source: 'membershipFee',
          year,
          date: doc.snapshotDate,
          description: `Mitgliedsbeiträge ${feeTypeName}`.trim(),
          type: 'income',
          amount: Number(doc.totalIncome),
          weightedAmount: Number(doc.totalIncome),
        })
      })
    }

    // Nach Jahr und Datum sortieren (neueste oben)
    details.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime()
      return 0
    })

    return NextResponse.json(details)
  } catch (error) {
    console.error('Error fetching group details:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Detailauswertung' },
      { status: 500 },
    )
  }
}

