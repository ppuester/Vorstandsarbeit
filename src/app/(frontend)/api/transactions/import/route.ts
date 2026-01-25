import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

interface TransactionData {
  date: string
  description: string
  amount: number
  reference?: string
}

/**
 * Prüft, ob eine Transaktion bereits existiert (Duplikat)
 * Eine Transaktion gilt als Duplikat, wenn Datum, Betrag und Beschreibung identisch sind
 */
async function isDuplicate(
  payload: Awaited<ReturnType<typeof getPayload>>,
  transactionData: TransactionData
): Promise<boolean> {
  try {
    const amount = Math.abs(transactionData.amount)
    const type = transactionData.amount >= 0 ? 'income' : 'expense'

    // Prüfe auf identische Transaktionen: Datum, Betrag, Beschreibung
    const existing = await payload.find({
      collection: 'transactions' as CollectionSlug,
      where: {
        and: [
          {
            date: {
              equals: transactionData.date,
            },
          },
          {
            amount: {
              equals: amount,
            },
          },
          {
            type: {
              equals: type,
            },
          },
          {
            description: {
              equals: transactionData.description,
            },
          },
        ],
      },
      limit: 1,
      depth: 0,
    })

    return existing.totalDocs > 0
  } catch (error) {
    // Bei Fehler bei der Prüfung, lieber importieren als überspringen
    console.error('Fehler bei Duplikatsprüfung:', error)
    return false
  }
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
    let skippedCount = 0
    const errors: string[] = []
    const skipped: Array<{ date: string; description: string; amount: number }> = []

    for (const transactionData of transactions) {
      try {
        // Prüfe auf Duplikat
        const duplicate = await isDuplicate(payload, transactionData)
        
        if (duplicate) {
          skippedCount++
          skipped.push({
            date: transactionData.date,
            description: transactionData.description,
            amount: transactionData.amount,
          })
          continue
        }

        // Determine type based on amount
        const type = transactionData.amount >= 0 ? 'income' : 'expense'
        const amount = Math.abs(transactionData.amount)

        await payload.create({
          collection: 'transactions' as CollectionSlug,
          data: {
            date: transactionData.date,
            description: transactionData.description as string,
            amount: amount,
            type: type as 'income' | 'expense',
            reference: transactionData.reference || undefined,
            processed: false,
          } as any, // Type assertion needed until types are generated
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
      skipped: skippedCount,
      skippedTransactions: skipped.length > 0 ? skipped : undefined,
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
