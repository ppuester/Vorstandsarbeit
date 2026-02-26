import crypto from 'crypto'

/** Header normalisieren: trim, lowercase, Punkte entfernen, mehrfache Leerzeichen */
export function normalizeHeader(h: string): string {
  return String(h)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .trim()
}

/** Mitgliedsnummer: trim, als String (keine .0, keine scientific notation) */
export function normalizeMemberNumber(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = String(val).trim()
  if (s === '' || s.toLowerCase() === 'nan') return ''
  const num = Number(s)
  if (Number.isFinite(num) && !Number.isNaN(num)) {
    if (Number.isInteger(num)) return String(num)
    const fixed = num.toFixed(0)
    if (fixed.indexOf('e') === -1) return fixed
  }
  return s
}

/** String: trim; leere/NaN -> null */
export function normalizeString(val: unknown): string | null {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  if (s === '' || s.toLowerCase() === 'nan') return null
  return s
}

/** E-Mail: lowercase, trim */
export function normalizeEmail(val: unknown): string | null {
  const s = normalizeString(val)
  return s ? s.toLowerCase() : null
}

/** Plz: als String (keine .0), trim */
export function normalizePlz(val: unknown): string | null {
  if (val === null || val === undefined) return null
  const s = String(val).trim()
  if (s === '' || s.toLowerCase() === 'nan') return null
  const num = Number(s)
  if (Number.isFinite(num) && !Number.isNaN(num)) {
    if (Number.isInteger(num)) return String(num)
    const fixed = num.toFixed(0)
    if (fixed.indexOf('e') === -1) return fixed
  }
  return s
}

/** Import-relevante Felder für Members (address ist textarea) */
export interface MemberImportData {
  memberNumber: string
  name: string
  email: string | null
  active: boolean
  address: string | null
  importBlock: string
}

/** getCol(normalizedHeader) liefert Zellwert für die Zeile. */
export function mapRowToMemberData(
  getCol: (normalizedHeader: string) => unknown,
  headerAliases: Record<string, string[]>
): MemberImportData {
  const get = (keys: string[]): unknown => {
    for (const k of keys) {
      const v = getCol(k)
      if (v !== undefined && v !== null) return v
    }
    return undefined
  }

  const MitgliedsNr = normalizeMemberNumber(get(headerAliases.memberNumber ?? []))
  const Name = normalizeString(get(headerAliases.name ?? []))
  const Nachname = normalizeString(get(['nachname']))
  const Name2 = normalizeString(get(['name2']))
  const Mailadresse = normalizeEmail(get(headerAliases.email ?? []))
  const Mitgliedsstatus = normalizeString(get(headerAliases.mitgliedsstatus ?? []))
  const Kostenstufe = normalizeString(get(['kostenstufe']))
  const Lastschrift = normalizeString(get(['lastschrift', 'mandatsaktiv']))
  const Eintritt = normalizeString(get(['eintritt']))
  const Austritt = normalizeString(get(['austritt']))
  const Gebührenarten = normalizeString(get(['gebührenarten']))
  const Straße = normalizeString(get(headerAliases.straße ?? []))
  const Plz = normalizePlz(get(headerAliases.plz ?? []))
  const Ort = normalizeString(get(headerAliases.ort ?? []))

  const name =
    Name ||
    [Nachname, Name2].filter(Boolean).join(', ').replace(/\s+,/g, ',').trim() ||
    ''

  const active = (Mitgliedsstatus || '').toLowerCase() === 'aktiv'

  const addressParts = [Straße, Plz, Ort].filter(Boolean)
  const address = addressParts.length > 0 ? addressParts.join(', ') : null

  const importBlock = [
    `Status=${Mitgliedsstatus ?? ''}`,
    `Kostenstufe=${Kostenstufe ?? ''}`,
    `Lastschrift=${Lastschrift ?? ''}`,
    `Eintritt=${Eintritt ?? ''}`,
    `Austritt=${Austritt ?? ''}`,
    `Gebührenarten=${Gebührenarten ?? ''}`,
  ].join('; ')

  return {
    memberNumber: MitgliedsNr,
    name,
    email: Mailadresse,
    active,
    address,
    importBlock,
  }
}

const IMPORT_MARKER_START = '[IMPORT]'
const IMPORT_MARKER_END = '[/IMPORT]'

/**
 * Ersetzt nur den [IMPORT]...[/IMPORT]-Block in notes; rest bleibt.
 * Idempotent: gleicher Inhalt -> gleiche notes.
 */
export function updateNotesImportBlock(
  existingNotes: string | null | undefined,
  newImportBlock: string
): string {
  const base = (existingNotes || '').trim()
  const blockContent = `${IMPORT_MARKER_START} ${newImportBlock} ${IMPORT_MARKER_END}`

  const startIdx = base.indexOf(IMPORT_MARKER_START)
  const endIdx = base.indexOf(IMPORT_MARKER_END, startIdx >= 0 ? startIdx : 0)

  if (startIdx >= 0 && endIdx >= 0 && endIdx > startIdx) {
    const before = base.slice(0, startIdx).trimEnd()
    const after = base.slice(endIdx + IMPORT_MARKER_END.length).trimStart()
    const out = [before, blockContent, after].filter(Boolean).join('\n\n')
    return out.trim()
  }

  if (base === '') return blockContent
  return `${base}\n\n${blockContent}`.trim()
}

/** Fingerprint-Felder für Delta-Vergleich (nur diese zählen als "geändert") */
function fingerprintPayload(mapped: MemberImportData, notesWithImportBlock: string): string {
  return JSON.stringify({
    name: mapped.name,
    email: mapped.email ?? '',
    active: mapped.active,
    address: mapped.address ?? '',
    importBlock: notesWithImportBlock,
  })
}

/**
 * SHA1 der normalisierten Import-Felder (name, email, active, address, Import-Block in notes).
 * notesWithImportBlock = die kompletten notes, in denen der [IMPORT]-Block bereits eingetragen ist.
 */
export function computeMemberImportFingerprint(
  mapped: MemberImportData,
  notesWithImportBlock: string
): string {
  const payload = fingerprintPayload(mapped, notesWithImportBlock)
  return crypto.createHash('sha1').update(payload, 'utf8').digest('hex')
}

/** Standard-Spaltenaliase für Mitglieder.xlsx (normalisierte Header) */
export const MEMBER_IMPORT_HEADER_ALIASES: Record<string, string[]> = {
  memberNumber: ['mitgliedsnr', 'mitgliedsnummer', 'mitglieds nr'],
  name: ['name'],
  email: ['mailadresse', 'mail', 'e-mail', 'email'],
  mitgliedsstatus: ['mitgliedsstatus', 'status'],
  straße: ['straße', 'strasse', 'str', 'street'],
  plz: ['plz', 'postleitzahl', 'zip'],
  ort: ['ort', 'stadt', 'city'],
}
