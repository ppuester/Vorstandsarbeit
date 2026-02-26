import { describe, it, expect } from 'vitest'
import {
  normalizeName,
  parsePilotName,
  matchMemberByName,
  type MemberForMatch,
} from '@/utilities/memberMatching'

describe('memberMatching', () => {
  describe('normalizeName', () => {
    it('trims and lowercases', () => {
      expect(normalizeName('  Müller  ')).toBe('mueller')
    })
    it('replaces umlauts', () => {
      expect(normalizeName('Müller')).toBe('mueller')
      expect(normalizeName('Größe')).toBe('groesse')
      expect(normalizeName('Tür')).toBe('tuer')
      expect(normalizeName('Straße')).toBe('strasse')
    })
    it('collapses multiple spaces', () => {
      expect(normalizeName('Hans   Peter')).toBe('hans peter')
    })
    it('removes dots', () => {
      expect(normalizeName('Dr. Müller')).toBe('dr mueller')
    })
    it('returns empty for empty input', () => {
      expect(normalizeName('')).toBe('')
      expect(normalizeName('   ')).toBe('')
    })
  })

  describe('parsePilotName', () => {
    it('parses "Nachname, Vorname"', () => {
      expect(parsePilotName('Müller, Hans')).toEqual({ first: 'Hans', last: 'Müller' })
    })
    it('parses "Vorname Nachname"', () => {
      expect(parsePilotName('Hans Müller')).toEqual({ first: 'Hans', last: 'Müller' })
    })
    it('parses single word', () => {
      expect(parsePilotName('Müller')).toEqual({ first: 'Müller', last: '' })
    })
    it('returns empty for empty', () => {
      expect(parsePilotName('')).toEqual({ first: '', last: '' })
    })
  })

  describe('matchMemberByName', () => {
    const members: MemberForMatch[] = [
      { id: '1', name: 'Müller, Hans' },
      { id: '2', name: 'Schmidt Anna' },
      { id: '3', name: 'Peter Weber' },
    ]

    it('exact normalized match', () => {
      const r = matchMemberByName('Müller, Hans', members)
      expect(r.status).toBe('matched')
      expect(r.memberId).toBe('1')
    })
    it('match with different case', () => {
      const r = matchMemberByName('müller, hans', members)
      expect(r.status).toBe('matched')
      expect(r.memberId).toBe('1')
    })
    it('unmatched returns unmatched', () => {
      const r = matchMemberByName('Unknown, Person', members)
      expect(r.status).toBe('unmatched')
      expect(r.memberId).toBeNull()
    })
    it('empty pilot returns unmatched', () => {
      const r = matchMemberByName('', members)
      expect(r.status).toBe('unmatched')
      expect(r.memberId).toBeNull()
    })
  })
})
