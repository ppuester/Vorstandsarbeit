/**
 * Berechnung der Arbeitsstunden (Segelflug/Motorflug/Schlepp) pro Import-Zeile.
 * Pure function für Testbarkeit.
 *
 * Regeln:
 * - Vereinsflugzeug = aircraftForRow gefunden (registration match).
 * - Segelflug: aircraftGroup === 'glider' -> Segelflug-Minuten = Zeit; Schlepp = Schleppzeit nur wenn Schlepp-LFZ Vereinsflugzeug (sonst 0).
 * - Motorflug: aircraftGroup in ['motor','ul','motor-glider'] (helicopter zählt als motor, TODO).
 * - Schleppflugzeug-Zeile: aircraftGroup !== glider UND Schlepp-LFZ gefüllt -> 0 Stunden für Pilot.
 * - Segler nicht Vereinsflugzeug, aber Schlepp-LFZ Vereinsflugzeug: nur Schlepp-Minuten.
 */

export type AircraftGroup = 'glider' | 'motor' | 'ul' | 'motor-glider' | 'helicopter' | 'other'

export interface RowForWorkingMinutes {
  /** Minuten aus Spalte "Zeit" */
  timeMinutes: number
  /** Minuten aus Spalte "Schleppzeit" */
  towTimeMinutes: number
  /** Spalte "Schlepp-LFZ" gefüllt (Kennzeichen des Schleppflugzeugs) */
  towLfzFilled: boolean
  /** Flugzeugtyp der Zeile (von gefundenem Aircraft), oder null wenn nicht gefunden */
  aircraftGroup: AircraftGroup | null
}

export interface WorkingMinutesResult {
  workingMinutesGlider: number
  workingMinutesMotor: number
  workingMinutesTow: number
}

/**
 * Prüft, ob die Zeile ein Motorflugzeug ist (inkl. helicopter als motor).
 * TODO: helicopter explizit dokumentieren ob motor oder ignorieren.
 */
function isMotorGroup(group: AircraftGroup | null): boolean {
  if (!group) return false
  return (
    group === 'motor' ||
    group === 'ul' ||
    group === 'motor-glider' ||
    group === 'helicopter'
  )
}

/**
 * Berechnet Arbeitsminuten für eine Zeile.
 * @param row - Zeilendaten (Zeit, Schleppzeit, Schlepp-LFZ gefüllt, aircraftGroup)
 * @param aircraftForRow - ob das Flugzeug der Zeile (Lfz.) als Vereinsflugzeug gefunden wurde
 * @param towAircraftExists - ob das Schleppflugzeug (Schlepp-LFZ) als Vereinsflugzeug existiert
 */
export function computeWorkingMinutesFromRow(
  row: RowForWorkingMinutes,
  aircraftForRow: boolean,
  towAircraftExists: boolean
): WorkingMinutesResult {
  const { timeMinutes, towTimeMinutes, towLfzFilled, aircraftGroup } = row
  const time = Math.max(0, Number(timeMinutes) || 0)
  const towTime = Math.max(0, Number(towTimeMinutes) || 0)

  // A) Kein Vereinsflugzeug für diese Zeile
  if (!aircraftForRow) {
    // E) Segler nicht Vereinsflugzeug, aber Schlepper Vereinsflugzeug -> nur Schlepp-Minuten
    if (towLfzFilled && towAircraftExists && towTime > 0) {
      return {
        workingMinutesGlider: 0,
        workingMinutesMotor: 0,
        workingMinutesTow: towTime,
      }
    }
    return {
      workingMinutesGlider: 0,
      workingMinutesMotor: 0,
      workingMinutesTow: 0,
    }
  }

  // B) Vereinsflugzeug gefunden (Segler)
  if (aircraftGroup === 'glider') {
    // Schlepp-Minuten nur, wenn das Schleppflugzeug ein Vereinsflugzeug ist (fremdes Schleppflugzeug → 0).
    const towMin = towAircraftExists && towTime > 0 ? towTime : 0
    return {
      workingMinutesGlider: time,
      workingMinutesMotor: 0,
      workingMinutesTow: towMin,
    }
  }

  // C) Motorflugzeug-Zeile
  if (isMotorGroup(aircraftGroup)) {
    // D) Zeile des Schleppflugzeugs: Schlepp-LFZ gefüllt -> 0 Stunden für Schlepppiloten
    if (towLfzFilled) {
      return {
        workingMinutesGlider: 0,
        workingMinutesMotor: 0,
        workingMinutesTow: 0,
      }
    }
    return {
      workingMinutesGlider: 0,
      workingMinutesMotor: time,
      workingMinutesTow: 0,
    }
  }

  // Sonstige Typen (other etc.): keine Arbeitsstunden oder nur Zeit als Motor? Spezifikation: nur glider/motor/tow. Also 0.
  return {
    workingMinutesGlider: 0,
    workingMinutesMotor: 0,
    workingMinutesTow: 0,
  }
}
