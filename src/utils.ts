import { addDays, startOfWeek, format, parseISO, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import type { WeekRange, TimeEntry } from './types'

export function getWeekRange(date: Date): WeekRange {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = addDays(start, 6)
  return { start, end }
}

export function getWeekDays(weekRange: WeekRange): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekRange.start, i))
}

export function formatWeekLabel(weekRange: WeekRange): string {
  const startFmt = format(weekRange.start, 'd MMM', { locale: es })
  const endFmt = format(weekRange.end, 'd MMM yyyy', { locale: es })
  return `${startFmt} – ${endFmt}`
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function shiftDurationHours(start_time: string, end_time: string): number {
  const base = parseISO(`2000-01-01T${start_time}`)
  let end = parseISO(`2000-01-01T${end_time}`)
  // Handle overnight shifts
  if (end <= base) {
    end = parseISO(`2000-01-02T${end_time}`)
  }
  return differenceInMinutes(end, base) / 60
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

// ─── Time Tracking Helpers ─────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

/**
 * Compute total actual worked minutes from a set of time entries for one day.
 * Pairs each 'in' with the next 'out' in chronological order.
 * Returns null if any 'in' entry is unmatched (employee still clocked in).
 */
export function computeActualMinutes(entries: TimeEntry[]): number | null {
  const inTimes = entries
    .filter(e => e.type === 'in')
    .map(e => timeToMinutes(e.timestamp))
    .sort((a, b) => a - b)
  const outTimes = entries
    .filter(e => e.type === 'out')
    .map(e => timeToMinutes(e.timestamp))
    .sort((a, b) => a - b)

  if (inTimes.length === 0) return null
  if (outTimes.length < inTimes.length) return null // still clocked in

  let total = 0
  for (let i = 0; i < inTimes.length; i++) {
    let diff = outTimes[i] - inTimes[i]
    if (diff < 0) diff += 24 * 60 // overnight shift
    total += diff
  }
  return total
}

/** Format a minute count as "Xh Ym" (no sign). */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(Math.abs(minutes) / 60)
  const m = Math.abs(minutes) % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Format a signed deviation in minutes as "+Xh Ym" or "−Xh Ym". */
export function formatDeviation(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '−'
  const abs  = Math.abs(minutes)
  const h    = Math.floor(abs / 60)
  const m    = abs % 60
  if (h === 0) return `${sign}${m}m`
  if (m === 0) return `${sign}${h}h`
  return `${sign}${h}h ${m}m`
}

export function clsx(...args: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const classes: string[] = []
  for (const arg of args) {
    if (!arg) continue
    if (typeof arg === 'string') {
      classes.push(arg)
    } else if (typeof arg === 'object') {
      for (const [key, val] of Object.entries(arg)) {
        if (val) classes.push(key)
      }
    }
  }
  return classes.join(' ')
}
