import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import { syncFlightLogsFromFlights } from '@/utilities/syncFlightLogsFromFlights'

export const runtime = 'nodejs'

const CHUNK_SIZE = 500

/**
 * DELETE: Import rückgängig machen – löscht für das Jahr des Imports alle Flüge und alle
 * Arbeitsstunden (Stammdaten), markiert den ImportRun als gelöscht und aktualisiert die Flugbücher.
 * Query-Parameter: confirm=true erforderlich.
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(_request.url)
    const confirm = searchParams.get('confirm') === 'true'

    if (!confirm) {
      return NextResponse.json(
        { error: 'Bitte confirm=true als Query-Parameter setzen, um den Import zu löschen.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    const importRun = await payload.findByID({
      collection: 'import-runs' as CollectionSlug,
      id,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null)

    if (!importRun) {
      return NextResponse.json({ error: 'Import-Lauf nicht gefunden.' }, { status: 404 })
    }

    const run = importRun as { id: string; isDeleted?: boolean; year?: number | null }
    if (run.isDeleted) {
      return NextResponse.json(
        { error: 'Dieser Import wurde bereits rückgängig gemacht.' },
        { status: 400 }
      )
    }

    const year = run.year != null && Number.isFinite(run.year) ? run.year : null
    let deletedFlights = 0
    let deletedWorkingHours = 0

    if (year != null) {
      // Alles aus dem Jahr löschen: Flüge (sourceYear) und Arbeitsstunden (date im Jahr)
      const yearStart = `${year}-01-01`
      const yearEndExclusive = `${year + 1}-01-01`

      let page = 1
      let hasMore = true
      while (hasMore) {
        const chunk = await payload.find({
          collection: 'flights' as CollectionSlug,
          where: { sourceYear: { equals: year } },
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

      let whPage = 1
      let whHasMore = true
      while (whHasMore) {
        const whChunk = await payload.find({
          collection: 'working-hours' as CollectionSlug,
          where: {
            and: [
              { date: { greater_than_equal: yearStart } },
              { date: { less_than: yearEndExclusive } },
            ],
          },
          limit: CHUNK_SIZE,
          page: whPage,
          depth: 0,
          overrideAccess: true,
        })
        for (const wh of whChunk.docs) {
          await payload.delete({
            collection: 'working-hours' as CollectionSlug,
            id: wh.id,
            overrideAccess: true,
          })
          deletedWorkingHours++
        }
        whHasMore = whChunk.docs.length === CHUNK_SIZE
        whPage++
      }
    } else {
      // Fallback: nur Flüge dieses Imports löschen (wenn Jahr nicht gesetzt)
      let page = 1
      let hasMore = true
      while (hasMore) {
        const chunk = await payload.find({
          collection: 'flights' as CollectionSlug,
          where: { importRun: { equals: id } },
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

    await payload.update({
      collection: 'import-runs' as CollectionSlug,
      id,
      data: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedFlightsCount: deletedFlights,
      } as Record<string, unknown>,
      overrideAccess: true,
    })

    const syncResult = await syncFlightLogsFromFlights(payload)

    return NextResponse.json({
      success: true,
      deletedFlights,
      deletedWorkingHours,
      year,
      importRunId: id,
      flightLogsUpdated: syncResult.updated,
      flightLogsZeroed: syncResult.zeroed,
    })
  } catch (error) {
    console.error('Error deleting import run:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Rückgängig-machen des Imports',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    )
  }
}
