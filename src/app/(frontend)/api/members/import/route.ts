export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import {
  computeMemberImportFingerprint,
  mapRowToMemberData,
  MEMBER_IMPORT_HEADER_ALIASES,
  normalizeHeader,
  updateNotesImportBlock,
  type MemberImportData,
} from '@/utilities/memberImport'

const MAX_ERRORS = 50
const MAX_EXAMPLES_CHANGED = 10

interface ExistingMember {
  id: string
  memberNumber: string
  name?: string | null
  email?: string | null
  active?: boolean | null
  address?: string | null
  notes?: string | null
  importFingerprint?: string | null
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    const fileName = (file.name || '').toLowerCase()
    const isExcel =
      fileName.endsWith('.xlsx') ||
      fileName.endsWith('.xls') ||
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'

    let rows: string[][] = []
    let headerToIndex: Record<string, number> = {}
    let normalizedHeaders: string[] = []

    if (isExcel) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      if (!firstSheet) {
        return NextResponse.json(
          { error: 'Keine Tabelle in der Excel-Datei gefunden' },
          { status: 400 }
        )
      }
      const data = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
        header: 1,
        defval: '',
      }) as string[][]
      if (!data.length) {
        return NextResponse.json(
          { error: 'Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten' },
          { status: 400 }
        )
      }
      const rawHeaders = (data[0] ?? []).map((c) => String(c ?? ''))
      normalizedHeaders = rawHeaders.map(normalizeHeader)
      headerToIndex = Object.fromEntries(
        normalizedHeaders.map((h, i) => [h, i])
      ) as Record<string, number>
      rows = data.slice(1)
    } else {
      const text = await file.text()
      const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      const lineStrings = normalizedText.split('\n').filter((l) => l.trim())
      if (lineStrings.length < 2) {
        return NextResponse.json(
          { error: 'Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten' },
          { status: 400 }
        )
      }
      const firstLineStr = lineStrings[0] ?? ''
      const delimiter = firstLineStr.includes('\t')
        ? '\t'
        : firstLineStr.includes(';')
          ? ';'
          : ','
      const reparse = Papa.parse<string[]>(normalizedText, {
        delimiter,
        skipEmptyLines: true,
      })
      const data = reparse.data as string[][]
      const rawHeaders = (data[0] ?? []).map((c) => String(c ?? '').trim())
      normalizedHeaders = rawHeaders.map(normalizeHeader)
      headerToIndex = Object.fromEntries(
        normalizedHeaders.map((h, i) => [h, i])
      ) as Record<string, number>
      rows = data.slice(1)
    }

    for (const [key, aliases] of Object.entries(MEMBER_IMPORT_HEADER_ALIASES)) {
      const idx = normalizedHeaders.findIndex((h) =>
        aliases.some((a) => h === a || h.includes(a))
      )
      if (idx >= 0) {
        for (const a of aliases) {
          headerToIndex[a] = idx
        }
      }
    }

    const hasMemberNrColumn = Object.keys(headerToIndex).some(
      (k) => k.includes('mitgliedsnr') || k.includes('mitgliedsnummer')
    )
    if (!hasMemberNrColumn) {
      return NextResponse.json(
        { error: 'Erforderliche Spalte "MitgliedsNr" (oder "Mitgliedsnummer") nicht gefunden' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config: configPromise })

    const existingRes = await payload.find({
      collection: 'members' as CollectionSlug,
      limit: 10000,
      depth: 0,
    })
    const existingByNumber = new Map<string, ExistingMember>()
    for (const doc of existingRes.docs || []) {
      const d = doc as ExistingMember
      const num = (d.memberNumber ?? '').trim()
      if (num) existingByNumber.set(num, d)
    }

    let created = 0
    let updated = 0
    let skipped = 0
    const errors: Array<{ row: number; reason: string }> = []
    const examplesChanged: Array<{
      memberNumber: string
      before: Record<string, unknown>
      after: Record<string, unknown>
    }> = []

    const now = new Date().toISOString()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0) continue

      const getCol = (key: string): unknown => {
        const idx = headerToIndex[key]
        return idx === undefined ? undefined : row[idx]
      }

      let mapped: MemberImportData
      try {
        mapped = mapRowToMemberData(getCol, MEMBER_IMPORT_HEADER_ALIASES)
      } catch (err) {
        if (errors.length < MAX_ERRORS) {
          errors.push({
            row: i + 2,
            reason: err instanceof Error ? err.message : 'Ungültige Zeile',
          })
        }
        skipped++
        continue
      }

      if (!mapped.memberNumber) {
        if (errors.length < MAX_ERRORS) {
          errors.push({ row: i + 2, reason: 'MitgliedsNr fehlt' })
        }
        skipped++
        continue
      }

      if (!mapped.name) {
        if (errors.length < MAX_ERRORS) {
          errors.push({ row: i + 2, reason: 'Name fehlt (und Nachname/Name2 leer)' })
        }
        skipped++
        continue
      }

      const existing = existingByNumber.get(mapped.memberNumber)
      const notesWithBlock = updateNotesImportBlock(
        existing?.notes ?? null,
        mapped.importBlock
      )
      const fingerprint = computeMemberImportFingerprint(mapped, notesWithBlock)

      if (!existing) {
        try {
          const createdDoc = await payload.create({
            collection: 'members' as CollectionSlug,
            data: {
              memberNumber: mapped.memberNumber,
              name: mapped.name,
              email: mapped.email ?? undefined,
              active: mapped.active,
              address: mapped.address ?? undefined,
              notes: notesWithBlock,
              importFingerprint: fingerprint,
              lastImportedAt: now,
              sourceSystem: 'members-xlsx',
            } as Record<string, unknown>,
            depth: 0,
          })
          created++
          const doc = createdDoc as { id: string }
          existingByNumber.set(mapped.memberNumber, {
            id: doc.id,
            memberNumber: mapped.memberNumber,
            name: mapped.name,
            email: mapped.email,
            active: mapped.active,
            address: mapped.address,
            notes: notesWithBlock,
            importFingerprint: fingerprint,
          })
        } catch (err) {
          if (errors.length < MAX_ERRORS) {
            errors.push({
              row: i + 2,
              reason: err instanceof Error ? err.message : 'Fehler beim Anlegen',
            })
          }
          skipped++
        }
        continue
      }

      if (existing.importFingerprint === fingerprint) {
        skipped++
        continue
      }

      const before: Record<string, unknown> = {
        name: existing.name ?? undefined,
        email: existing.email ?? undefined,
        active: existing.active ?? undefined,
        address: existing.address ?? undefined,
      }
      const after: Record<string, unknown> = {
        name: mapped.name,
        email: mapped.email ?? undefined,
        active: mapped.active,
        address: mapped.address ?? undefined,
      }

      try {
        await payload.update({
          collection: 'members' as CollectionSlug,
          id: existing.id,
          data: {
            name: mapped.name,
            email: mapped.email ?? undefined,
            active: mapped.active,
            address: mapped.address ?? undefined,
            notes: notesWithBlock,
            importFingerprint: fingerprint,
            lastImportedAt: now,
            sourceSystem: 'members-xlsx',
          } as Record<string, unknown>,
          depth: 0,
        })
        updated++
        if (examplesChanged.length < MAX_EXAMPLES_CHANGED) {
          examplesChanged.push({
            memberNumber: mapped.memberNumber,
            before,
            after,
          })
        }
      } catch (err) {
        if (errors.length < MAX_ERRORS) {
          errors.push({
            row: i + 2,
            reason: err instanceof Error ? err.message : 'Fehler beim Aktualisieren',
          })
        }
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped,
      errors,
      examplesChanged,
    })
  } catch (error) {
    console.error('Member import error:', error)
    return NextResponse.json(
      {
        error: 'Fehler beim Importieren der Mitglieder',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    )
  }
}
