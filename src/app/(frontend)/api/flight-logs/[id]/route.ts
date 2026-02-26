import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export const runtime = 'nodejs'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const payload = await getPayload({ config: configPromise })

    const updated = await payload.update({
      collection: 'flight-logs' as CollectionSlug,
      id,
      data: body as any,
      depth: 2,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating flight log:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Flugbucheintrags' },
      { status: 500 }
    )
  }
}

const CHUNK_SIZE = 500

/**
 * DELETE: Flugbucheintrag löschen – löscht zuerst alle Flights für dieses Flugzeug+Jahr,
 * dann den Flugbucheintrag. Damit ist der Eintrag überall weg (Tabelle + Flugstunden nach Mitglied).
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const payload = await getPayload({ config: configPromise })

    const logDoc = await payload.findByID({
      collection: 'flight-logs' as CollectionSlug,
      id,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null)

    if (!logDoc) {
      return NextResponse.json({ error: 'Flugbucheintrag nicht gefunden.' }, { status: 404 })
    }

    const log = logDoc as { aircraft?: string | { id: string }; year?: number }
    const aircraftId =
      typeof log.aircraft === 'object' && log.aircraft != null
        ? (log.aircraft as { id: string }).id
        : (log.aircraft as string | undefined)
    const year = log.year

    let deletedFlights = 0
    if (aircraftId != null && year != null) {
      let page = 1
      let hasMore = true
      while (hasMore) {
        const chunk = await payload.find({
          collection: 'flights' as CollectionSlug,
          where: {
            and: [
              { aircraft: { equals: aircraftId } },
              {
                or: [
                  { sourceYear: { equals: year } },
                  {
                    date: {
                      greater_than_equal: `${year}-01-01`,
                      less_than_equal: `${year}-12-31`,
                    },
                  },
                ],
              },
            ],
          },
          limit: CHUNK_SIZE,
          page,
          depth: 0,
          overrideAccess: true,
        })

        for (const flight of chunk.docs) {
          await payload.delete({
            collection: 'flights' as CollectionSlug,
            id: flight.id,
            overrideAccess: true,
          })
          deletedFlights++
        }

        hasMore = chunk.docs.length === CHUNK_SIZE
        page++
      }
    }

    await payload.delete({
      collection: 'flight-logs' as CollectionSlug,
      id,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      deletedFlights,
    })
  } catch (error) {
    console.error('Error deleting flight log:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Löschen des Flugbucheintrags',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    )
  }
}
