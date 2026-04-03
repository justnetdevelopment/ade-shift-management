import type { Shift, CoverageSlot } from '../../types'

// ─── Grid constants ────────────────────────────────────────────────────────────

export const GRID_START_HOUR  = 8          // 08:00
export const GRID_END_HOUR    = 27         // 03:00 next day (27:00 = 1620 min)
export const GRID_START_MIN   = GRID_START_HOUR * 60   // 480
export const GRID_END_MIN     = GRID_END_HOUR   * 60   // 1620
export const TOTAL_MIN        = GRID_END_MIN - GRID_START_MIN   // 1140
export const INTERVAL_MIN     = 30
export const N_SLOTS          = TOTAL_MIN / INTERVAL_MIN  // 38
export const SLOT_PX          = 30
export const TOTAL_SLOTS_PX   = N_SLOTS * SLOT_PX        // 1140
export const EMP_COL_PX       = 192   // w-48
export const TOTAL_COL_PX     = 80    // w-20
export const TOTAL_INNER_PX   = EMP_COL_PX + TOTAL_SLOTS_PX + TOTAL_COL_PX  // 2552
export const ROW_HEIGHT_PX    = 36    // height of each employee row

// ─── Time conversion helpers ──────────────────────────────────────────────────

/** Parse 'HH:mm' → total minutes from midnight. */
export function timeToMin(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Convert total minutes (can exceed 1440 for overnight) → 'HH:mm' (24h).
 * e.g. 1500 → '01:00' (next day)
 */
export function minToTime(totalMin: number): string {
  const normalised = ((totalMin % 1440) + 1440) % 1440
  const h = Math.floor(normalised / 60)
  const m = normalised % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Returns a shift's start and end in grid-relative minutes.
 * Overnight end times (hour < GRID_START_HOUR) are shifted +1440.
 */
export function shiftToGridMinutes(shift: Shift): { startMin: number; endMin: number } {
  let startMin = timeToMin(shift.start_time)
  let endMin   = timeToMin(shift.end_time)

  // Overnight: end is next day
  if (endMin <= startMin) endMin += 1440

  return { startMin, endMin }
}

/**
 * Calculates the CSS left% and width% for a shift block inside the grid.
 * Returns null if the shift is entirely outside the visible grid range.
 */
export function shiftToStyle(shift: Shift): { left: string; width: string } | null {
  const { startMin, endMin } = shiftToGridMinutes(shift)

  // Clamp to grid bounds
  const visStart = Math.max(startMin, GRID_START_MIN)
  const visEnd   = Math.min(endMin,   GRID_END_MIN)

  if (visStart >= visEnd) return null  // entirely outside grid

  const leftPct  = ((visStart - GRID_START_MIN) / TOTAL_MIN) * 100
  const widthPct = ((visEnd - visStart) / TOTAL_MIN) * 100

  return {
    left:  `${leftPct.toFixed(4)}%`,
    width: `${widthPct.toFixed(4)}%`,
  }
}

/**
 * Converts a pixel offset from the slots area left edge to a grid time (snapped).
 */
export function pixelToTime(
  px: number,
  containerPx: number = TOTAL_SLOTS_PX,
  snapMin: number = INTERVAL_MIN,
): string {
  const rawMin   = GRID_START_MIN + (px / containerPx) * TOTAL_MIN
  const snapped  = Math.round(rawMin / snapMin) * snapMin
  const clamped  = Math.max(GRID_START_MIN, Math.min(GRID_END_MIN, snapped))
  return minToTime(clamped)
}

/**
 * Applies a minute delta to a shift and returns new { start_time, end_time }
 * snapped to INTERVAL_MIN intervals and clamped to grid bounds.
 */
export function applyDragDelta(
  shift: Shift,
  deltaMin: number,
): { start_time: string; end_time: string } {
  const { startMin, endMin } = shiftToGridMinutes(shift)
  const duration = endMin - startMin

  let newStart = Math.round((startMin + deltaMin) / INTERVAL_MIN) * INTERVAL_MIN
  newStart = Math.max(GRID_START_MIN, Math.min(GRID_END_MIN - duration, newStart))
  const newEnd = newStart + duration

  return {
    start_time: minToTime(newStart),
    end_time:   minToTime(newEnd),
  }
}

/**
 * Applies a minute delta to only one edge (start or end) of a shift,
 * keeping the opposite edge fixed. Enforces a minimum duration of INTERVAL_MIN.
 */
export function applyResizeDelta(
  shift: Shift,
  deltaMin: number,
  edge: 'start' | 'end',
): { start_time: string; end_time: string } {
  const { startMin, endMin } = shiftToGridMinutes(shift)

  if (edge === 'start') {
    let newStart = Math.round((startMin + deltaMin) / INTERVAL_MIN) * INTERVAL_MIN
    newStart = Math.max(GRID_START_MIN, Math.min(endMin - INTERVAL_MIN, newStart))
    return { start_time: minToTime(newStart), end_time: minToTime(endMin) }
  } else {
    let newEnd = Math.round((endMin + deltaMin) / INTERVAL_MIN) * INTERVAL_MIN
    newEnd = Math.max(startMin + INTERVAL_MIN, Math.min(GRID_END_MIN, newEnd))
    return { start_time: minToTime(startMin), end_time: minToTime(newEnd) }
  }
}

// ─── Coverage calculation ─────────────────────────────────────────────────────

/** Compute how many employees are active in each 30-min slot. */
export function computeCoverage(shifts: Shift[]): CoverageSlot[] {
  return Array.from({ length: N_SLOTS }, (_, i) => {
    const slotStartMin = GRID_START_MIN + i * INTERVAL_MIN
    const slotEndMin   = slotStartMin + INTERVAL_MIN

    let count = 0
    const by_role: Record<string, number> = {}

    for (const shift of shifts) {
      const { startMin, endMin } = shiftToGridMinutes(shift)
      // Overlap: shift starts before slot end AND ends after slot start
      if (startMin < slotEndMin && endMin > slotStartMin) {
        count++
        by_role[shift.role] = (by_role[shift.role] ?? 0) + 1
      }
    }

    const h    = Math.floor(slotStartMin / 60) % 24
    const m    = slotStartMin % 60
    const hEnd = Math.floor(slotEndMin   / 60) % 24
    const mEnd = slotEndMin % 60

    return {
      slot_start: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,
      slot_end:   `${String(hEnd).padStart(2,'0')}:${String(mEnd).padStart(2,'0')}`,
      count,
      by_role,
    }
  })
}

// ─── Slot label generation ────────────────────────────────────────────────────

export interface TimeSlot {
  index: number
  startMin: number         // absolute minutes (can exceed 1440)
  label: string | null     // 'HH:00' on the hour, null on the half-hour
  isHour: boolean
}

export function buildTimeSlots(): TimeSlot[] {
  return Array.from({ length: N_SLOTS }, (_, i) => {
    const absoluteMin = GRID_START_MIN + i * INTERVAL_MIN
    const h = Math.floor(absoluteMin / 60) % 24
    const m = absoluteMin % 60
    const isHour = m === 0
    return {
      index: i,
      startMin: absoluteMin,
      label: isHour ? `${String(h).padStart(2, '0')}:00` : null,
      isHour,
    }
  })
}
