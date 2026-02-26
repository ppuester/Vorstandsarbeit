import { describe, it, expect } from 'vitest'
import {
  computeWorkingMinutesFromRow,
  type RowForWorkingMinutes,
  type AircraftGroup,
} from '@/utilities/workingMinutesFromFlights'

describe('workingMinutesFromFlights', () => {
  function row(
    timeMinutes: number,
    towTimeMinutes: number,
    towLfzFilled: boolean,
    aircraftGroup: AircraftGroup | null
  ): RowForWorkingMinutes {
    return {
      timeMinutes,
      towTimeMinutes,
      towLfzFilled,
      aircraftGroup,
    }
  }

  it('glider row: segelflug and tow minutes', () => {
    const r = computeWorkingMinutesFromRow(
      row(60, 15, true, 'glider'),
      true,
      true
    )
    expect(r.workingMinutesGlider).toBe(60)
    expect(r.workingMinutesMotor).toBe(0)
    expect(r.workingMinutesTow).toBe(15)
  })

  it('motor row: motor minutes only', () => {
    const r = computeWorkingMinutesFromRow(
      row(90, 0, false, 'motor'),
      true,
      false
    )
    expect(r.workingMinutesGlider).toBe(0)
    expect(r.workingMinutesMotor).toBe(90)
    expect(r.workingMinutesTow).toBe(0)
  })

  it('tow plane row (motor + Schlepp-LFZ filled): 0 hours for pilot', () => {
    const r = computeWorkingMinutesFromRow(
      row(30, 10, true, 'motor'),
      true,
      true
    )
    expect(r.workingMinutesGlider).toBe(0)
    expect(r.workingMinutesMotor).toBe(0)
    expect(r.workingMinutesTow).toBe(0)
  })

  it('aircraft not found, tow aircraft exists and tow time: only tow minutes', () => {
    const r = computeWorkingMinutesFromRow(
      row(45, 12, true, null),
      false,
      true
    )
    expect(r.workingMinutesGlider).toBe(0)
    expect(r.workingMinutesMotor).toBe(0)
    expect(r.workingMinutesTow).toBe(12)
  })

  it('aircraft not found, no tow: all zero', () => {
    const r = computeWorkingMinutesFromRow(
      row(45, 0, false, null),
      false,
      false
    )
    expect(r.workingMinutesGlider).toBe(0)
    expect(r.workingMinutesMotor).toBe(0)
    expect(r.workingMinutesTow).toBe(0)
  })

  it('ul aircraft: motor minutes', () => {
    const r = computeWorkingMinutesFromRow(
      row(60, 0, false, 'ul'),
      true,
      false
    )
    expect(r.workingMinutesMotor).toBe(60)
    expect(r.workingMinutesGlider).toBe(0)
    expect(r.workingMinutesTow).toBe(0)
  })
})
