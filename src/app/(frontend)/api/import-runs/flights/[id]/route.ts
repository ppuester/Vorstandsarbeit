import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export const runtime = 'nodejs'

const CHUNK_SIZE = 500

/**
 * DELETE: Import rückgängig machen – löscht alle Flüge dieses Imports und markiert den ImportRun als gelöscht.
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

    const run = importRun as { id: string; isDeleted?: boolean; type?: string }
    if (run.isDeleted) {
      return NextResponse.json(
        { error: 'Dieser Import wurde bereits rückgängig gemacht.' },
        { status: 400 }
      )
    }

    let deletedFlights = 0
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

    await payload.update({
      collection: 'import-runs' as CollectionSlug,
      id,
      data: {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        deletedFlightsCount: deletedFlights,
      } as any,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      deletedFlights,
      importRunId: id,
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
