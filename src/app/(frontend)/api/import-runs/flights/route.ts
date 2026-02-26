import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

export const runtime = 'nodejs'

/**
 * GET: Liste der letzten Flugbewegungs-Imports (type=flights).
 */
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'import-runs' as CollectionSlug,
      where: { type: { equals: 'flights' } },
      sort: '-importedAt',
      limit: 50,
      depth: 1,
      overrideAccess: true,
    })

    const docs = (result.docs || []).map((doc: any) => ({
      id: doc.id,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileHash: doc.fileHash,
      importedAt: doc.importedAt,
      importedBy: doc.importedBy,
      year: doc.year,
      stats: doc.stats ?? {},
      isDeleted: doc.isDeleted ?? false,
      deletedAt: doc.deletedAt,
      deletedFlightsCount: doc.deletedFlightsCount,
    }))

    return NextResponse.json({ docs, totalDocs: result.totalDocs })
  } catch (error) {
    console.error('Error fetching import runs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Import-Historie' },
      { status: 500 }
    )
  }
}
