/**
 * Robustes Mitglieder-Matching für Import (Pilot als Text "Nachname, Vorname").
 * Normalisierung: Umlaute, Leerzeichen, Case, Punkte.
 */

export type MemberMatchResult = {
  memberId: string | null
  status: 'matched' | 'unmatched' | 'ambiguous'
  candidates: string[]
}

export interface MemberForMatch {
  id: string
  name: string
}

/**
 * Normalisiert einen Namen für Vergleich: trim, lowercase, Umlaute ersetzen,
 * mehrfache Leerzeichen zu einem, Punkte entfernen.
 */
export function normalizeName(str: string): string {
  if (!str || typeof str !== 'string') return ''
  return str
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .trim()
}

/**
 * Parst Pilotentext in Vorname/Nachname.
 * - "Nachname, Vorname" -> { last, first }
 * - "Vorname Nachname" -> { first, last } (erstes Wort = first, Rest = last)
 */
export function parsePilotName(pilotText: string): { first: string; last: string } {
  const cleaned = (pilotText || '').trim()
  if (!cleaned) return { first: '', last: '' }

  if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map((s) => s.trim())
    const last = parts[0] ?? ''
    const first = parts.slice(1).join(' ').trim()
    return { first, last }
  }

  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 0) return { first: '', last: '' }
  if (words.length === 1) return { first: words[0]!, last: '' }
  const first = words[0]!
  const last = words.slice(1).join(' ')
  return { first, last }
}

/**
 * Findet ein Mitglied anhand Pilotentext aus einer vorab geladenen Liste.
 * 1) Exakter normalisierter Match auf member.name
 * 2) Match "last first" vs "first last"
 * 3) Contains-Match als Fallback; bei >1 Treffer -> ambiguous
 * Gibt bis zu 5 Kandidaten für Anzeige zurück.
 */
export function matchMemberByName(
  pilotText: string,
  members: MemberForMatch[]
): MemberMatchResult {
  if (!pilotText || !pilotText.trim()) {
    return { memberId: null, status: 'unmatched', candidates: [] }
  }

  const normalizedInput = normalizeName(pilotText)
  if (!normalizedInput) {
    return { memberId: null, status: 'unmatched', candidates: [] }
  }

  const { first, last } = parsePilotName(pilotText)
  const normalizedFirst = normalizeName(first)
  const normalizedLast = normalizeName(last)

  // 1) Exakter normalisierter Match
  for (const m of members) {
    const name = (m.name || '').trim()
    if (normalizeName(name) === normalizedInput) {
      return { memberId: m.id, status: 'matched', candidates: [name] }
    }
  }

  // 2) "last first" / "first last" Match (beide Teile müssen vorkommen)
  if (normalizedFirst && normalizedLast) {
    const matched: MemberForMatch[] = []
    for (const m of members) {
      const n = normalizeName(m.name || '')
      if (
        (n.includes(normalizedFirst) && n.includes(normalizedLast)) ||
        (n === `${normalizedLast} ${normalizedFirst}`) ||
        (n === `${normalizedFirst} ${normalizedLast}`)
      ) {
        matched.push(m)
      }
    }
    if (matched.length === 1) {
      return {
        memberId: matched[0]!.id,
        status: 'matched',
        candidates: [matched[0]!.name],
      }
    }
    if (matched.length > 1) {
      return {
        memberId: null,
        status: 'ambiguous',
        candidates: matched.slice(0, 5).map((x) => x.name),
      }
    }
  }

  // 3) Contains-Fallback
  const containsMatches = members.filter((m) =>
    normalizeName(m.name || '').includes(normalizedInput)
  )
  if (containsMatches.length === 1) {
    return {
      memberId: containsMatches[0]!.id,
      status: 'matched',
      candidates: [containsMatches[0]!.name],
    }
  }
  if (containsMatches.length > 1) {
    return {
      memberId: null,
      status: 'ambiguous',
      candidates: containsMatches.slice(0, 5).map((x) => x.name),
    }
  }

  // Auch umgekehrte Contains: Input enthält Mitgliedsnamen
  const revMatches = members.filter((m) => {
    const n = normalizeName(m.name || '')
    return n && normalizedInput.includes(n)
  })
  if (revMatches.length === 1) {
    return {
      memberId: revMatches[0]!.id,
      status: 'matched',
      candidates: [revMatches[0]!.name],
    }
  }
  if (revMatches.length > 1) {
    return {
      memberId: null,
      status: 'ambiguous',
      candidates: revMatches.slice(0, 5).map((x) => x.name),
    }
  }

  return { memberId: null, status: 'unmatched', candidates: [] }
}
