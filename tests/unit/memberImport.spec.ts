import { describe, it, expect } from 'vitest'
import {
  normalizeCostTier,
  isWorkingHoursExemptFromCostTier,
} from '@/utilities/memberImport'

describe('memberImport', () => {
  describe('normalizeCostTier', () => {
    it('trims and lowercases', () => {
      expect(normalizeCostTier('  Barzahler  ')).toBe('barzahler')
      expect(normalizeCostTier('BARZAHLER')).toBe('barzahler')
    })
    it('returns empty for null/undefined', () => {
      expect(normalizeCostTier(null)).toBe('')
      expect(normalizeCostTier(undefined)).toBe('')
    })
    it('returns empty for empty string', () => {
      expect(normalizeCostTier('')).toBe('')
      expect(normalizeCostTier('   ')).toBe('')
    })
  })

  describe('isWorkingHoursExemptFromCostTier', () => {
    it('returns true for "Barzahler" (case-insensitive)', () => {
      expect(isWorkingHoursExemptFromCostTier('Barzahler')).toBe(true)
      expect(isWorkingHoursExemptFromCostTier('barzahler')).toBe(true)
      expect(isWorkingHoursExemptFromCostTier('  barzahler  ')).toBe(true)
    })
    it('returns false for other values', () => {
      expect(isWorkingHoursExemptFromCostTier('Lastschrift')).toBe(false)
      expect(isWorkingHoursExemptFromCostTier('')).toBe(false)
      expect(isWorkingHoursExemptFromCostTier(null)).toBe(false)
      expect(isWorkingHoursExemptFromCostTier(undefined)).toBe(false)
    })
  })
})
