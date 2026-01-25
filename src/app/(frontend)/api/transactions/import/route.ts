import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface TransactionData {
  date: string
  description: string
  amount: number
  reference?: string
}

export async function POST(request: Request) {
  try {
    const { transactions } = (await request.json()) as {
      transactions: TransactionData[]
    }

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: 'Ungültige Transaktionsdaten' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    let importedCount = 0
    const errors: string[] = []

    for (const transactionData of transactions) {
      try {
        // Determine type based on amount
        const type = transactionData.amount >= 0 ? 'income' : 'expense'
        const amount = Math.abs(transactionData.amount)

        await payload.create({
          collection: 'transactions',
          data: {
            date: transactionData.date,
            description: transactionData.description,
            amount: amount,
            type: type,
            reference: transactionData.reference || undefined,
            processed: false,
          },
        })

        importedCount++
      } catch (error) {
        errors.push(
          `Fehler bei "${transactionData.description}": ${
            error instanceof Error ? error.message : 'Unbekannter Fehler'
          }`
        )
      }
    }

    return NextResponse.json({
      success: true,
      count: importedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error importing transactions:', error)
    return NextResponse.json(
      {
        error:
          'Fehler beim Importieren: ' +
          (error instanceof Error ? error.message : 'Unbekannter Fehler'),
      },
      { status: 500 }
    )
  }
}
