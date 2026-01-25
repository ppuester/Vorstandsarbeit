import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

interface CSVRow {
  name?: string
  memberNumber?: string
  email?: string
  phone?: string
  address?: string
  active?: string
  notes?: string
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten' },
        { status: 400 }
      )
    }

    // Parse CSV
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const dataRows = lines.slice(1)

    const payload = await getPayload({ config: configPromise })

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      if (!row.trim()) continue

      const values = row.split(',').map((v) => v.trim())
      const rowData: CSVRow = {}

      headers.forEach((header, index) => {
        const value = values[index] || ''
        rowData[header as keyof CSVRow] = value
      })

      // Validierung
      if (!rowData.name || !rowData.name.trim()) {
        skipped++
        errors.push(`Zeile ${i + 2}: Name fehlt`)
        continue
      }

      try {
        // Prüfe ob Mitglied bereits existiert (anhand Name oder Mitgliedsnummer)
        const existing = await payload.find({
          collection: 'members' as CollectionSlug,
          where: {
            or: [
              { name: { equals: rowData.name.trim() } },
              ...(rowData.memberNumber
                ? [{ memberNumber: { equals: rowData.memberNumber.trim() } }]
                : []),
            ],
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          // Update existing member
          await payload.update({
            collection: 'members' as CollectionSlug,
            id: existing.docs[0].id,
            data: {
              name: rowData.name.trim(),
              memberNumber: rowData.memberNumber?.trim() || undefined,
              email: rowData.email?.trim() || undefined,
              phone: rowData.phone?.trim() || undefined,
              address: rowData.address?.trim() || undefined,
              active: rowData.active?.toLowerCase() === 'true' || rowData.active?.toLowerCase() === 'ja' || rowData.active === '1',
              notes: rowData.notes?.trim() || undefined,
            } as any,
          })
          imported++
        } else {
          // Create new member
          await payload.create({
            collection: 'members' as CollectionSlug,
            data: {
              name: rowData.name.trim(),
              memberNumber: rowData.memberNumber?.trim() || undefined,
              email: rowData.email?.trim() || undefined,
              phone: rowData.phone?.trim() || undefined,
              address: rowData.address?.trim() || undefined,
              active: rowData.active?.toLowerCase() === 'true' || rowData.active?.toLowerCase() === 'ja' || rowData.active === '1',
              notes: rowData.notes?.trim() || undefined,
            } as any,
          })
          imported++
        }
      } catch (error) {
        skipped++
        errors.push(`Zeile ${i + 2}: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 10), // Maximal 10 Fehler zurückgeben
    })
  } catch (error) {
    console.error('Error importing members:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Importieren der Mitglieder',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    )
  }
}
