import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { Shift, ScheduleViewMode } from '../../types'
import { clsx, getWeekRange, getWeekDays, toISODate } from '../../utils'

const DAY_SHORT: Record<number, string> = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' }
const STATUS_DOT: Record<Shift['status'], string> = {
  draft:     'bg-neutral-300',
  review:    'bg-warning-400',
  published: 'bg-success-400',
  locked:    'bg-shift-400',
}

interface ScheduleScreenProps {
  shifts: Shift[]
  centerName: (centerId: string) => string
}

export function ScheduleScreen({ shifts, centerName }: ScheduleScreenProps) {
  const [viewMode, setViewMode] = useState<ScheduleViewMode>('week')
  const [referenceDate, setReferenceDate] = useState(new Date())

  function getShiftsForDate(date: Date): Shift[] {
    const iso = toISODate(date)
    return shifts
      .filter(s => s.date === iso)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* View toggle */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex bg-neutral-100 rounded-xl p-0.5">
          {(['week', 'month'] as ScheduleViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all',
                viewMode === mode
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-neutral-500'
              )}
            >
              {mode === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'week' ? (
        <WeekView
          referenceDate={referenceDate}
          onPrev={() => setReferenceDate(d => subWeeks(d, 1))}
          onNext={() => setReferenceDate(d => addWeeks(d, 1))}
          getShiftsForDate={getShiftsForDate}
          centerName={centerName}
        />
      ) : (
        <MonthView
          referenceDate={referenceDate}
          onPrev={() => setReferenceDate(d => subMonths(d, 1))}
          onNext={() => setReferenceDate(d => addMonths(d, 1))}
          getShiftsForDate={getShiftsForDate}
          centerName={centerName}
        />
      )}
    </div>
  )
}

// ── Shared: shift row (single) ─────────────────────────────────────────────────

function ShiftRow({ shift, centerName }: { shift: Shift; centerName: (id: string) => string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[shift.status])} />
      <span className="text-sm font-semibold text-navy-900">{shift.start_time}</span>
      <span className="text-xs text-neutral-300">·</span>
      <span className="text-xs text-neutral-500 truncate">{shift.role}</span>
      <span className="ml-auto text-[10px] text-neutral-400 whitespace-nowrap pl-2">
        {centerName(shift.center_id)}
      </span>
    </div>
  )
}

// ── Shared: multi-shift group (turno partido) ──────────────────────────────────

function DayShifts({
  shifts,
  centerName,
  freeLabel = 'Libre',
}: {
  shifts: Shift[]
  centerName: (id: string) => string
  freeLabel?: string
}) {
  if (shifts.length === 0) {
    return (
      <div className="flex items-center py-1">
        <span className="text-sm text-neutral-300 font-medium">{freeLabel}</span>
      </div>
    )
  }

  if (shifts.length === 1) {
    return <ShiftRow shift={shifts[0]} centerName={centerName} />
  }

  // Turno partido — 2+ shifts
  return (
    <div className="flex flex-col gap-0 w-full">
      {/* Badge row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-warning-600 uppercase tracking-wide">
          Turno partido
        </span>
        <span className="text-[10px] font-bold text-warning-600 bg-warning-50 border border-warning-100 px-1.5 py-0.5 rounded-full">
          {shifts.length} turnos
        </span>
      </div>

      {/* Shifts with left bracket connector */}
      <div className="relative pl-3">
        {/* Vertical connector line */}
        <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-warning-200 rounded-full" />

        <div className="flex flex-col gap-2.5">
          {shifts.map(shift => (
            <div key={shift.id} className="flex items-center gap-2">
              {/* Horizontal tick from connector */}
              <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[shift.status])} />
              <span className="text-sm font-semibold text-navy-900">{shift.start_time}</span>
              <span className="text-xs text-neutral-300">·</span>
              <span className="text-xs text-neutral-500 truncate">{shift.role}</span>
              <span className="ml-auto text-[10px] text-neutral-400 whitespace-nowrap pl-2">
                {centerName(shift.center_id)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Week View ──────────────────────────────────────────────────────────────────

function WeekView({
  referenceDate,
  onPrev,
  onNext,
  getShiftsForDate,
  centerName,
}: {
  referenceDate: Date
  onPrev: () => void
  onNext: () => void
  getShiftsForDate: (d: Date) => Shift[]
  centerName: (id: string) => string
}) {
  const week = getWeekRange(referenceDate)
  const days = getWeekDays(week)

  const weekLabel = (() => {
    const s = format(week.start, 'd MMM', { locale: es })
    const e = format(week.end, 'd MMM', { locale: es })
    return `${s} – ${e}`
  })()

  return (
    <div className="flex flex-col flex-1 px-4 gap-1">
      <WeekNav label={weekLabel} onPrev={onPrev} onNext={onNext} />

      <div className="flex flex-col gap-2 pb-4">
        {days.map(day => {
          const dayShifts = getShiftsForDate(day)
          const past = isPast(day) && !isToday(day)
          const today = isToday(day)
          const dayName = DAY_SHORT[day.getDay()]
          const dateNum = format(day, 'd')
          const monthAbbr = format(day, 'MMM', { locale: es })
          const isSplit = dayShifts.length > 1

          return (
            <div
              key={day.toISOString()}
              className={clsx(
                'rounded-2xl border px-4 py-3',
                today
                  ? 'bg-shift-50 border-shift-200'
                  : isSplit
                  ? 'bg-warning-50/30 border-warning-100'
                  : 'bg-white border-neutral-100',
                past && 'opacity-60'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Date column */}
                <div className="flex flex-col items-center min-w-[40px] pt-0.5">
                  <span className={clsx('text-xs font-medium', today ? 'text-shift-500' : 'text-neutral-400')}>
                    {dayName}
                  </span>
                  <span className={clsx('text-xl font-bold leading-tight', today ? 'text-shift-700' : 'text-navy-900')}>
                    {dateNum}
                  </span>
                  <span className={clsx('text-[10px]', today ? 'text-shift-400' : 'text-neutral-300')}>
                    {monthAbbr}
                  </span>
                </div>

                {/* Shifts */}
                <div className="flex-1 flex flex-col pt-0.5 min-w-0">
                  <DayShifts shifts={dayShifts} centerName={centerName} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Month View ─────────────────────────────────────────────────────────────────

function MonthView({
  referenceDate,
  onPrev,
  onNext,
  getShiftsForDate,
  centerName,
}: {
  referenceDate: Date
  onPrev: () => void
  onNext: () => void
  getShiftsForDate: (d: Date) => Shift[]
  centerName: (id: string) => string
}) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(referenceDate)
  const monthEnd = endOfMonth(referenceDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const allDays = eachDayOfInterval({ start: calStart, end: calEnd })

  const monthLabel = format(referenceDate, 'MMMM yyyy', { locale: es })
  const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  const selectedShifts = selectedDay ? getShiftsForDate(selectedDay) : []

  return (
    <div className="flex flex-col flex-1 px-4 gap-3">
      <WeekNav label={capitalizedLabel} onPrev={onPrev} onNext={onNext} />

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 text-center mb-0.5">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
          <span key={d} className="text-[10px] font-semibold text-neutral-400 py-1">{d}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {allDays.map(day => {
          const inMonth = isSameMonth(day, referenceDate)
          const today = isToday(day)
          const selected = selectedDay ? isSameDay(day, selectedDay) : false
          const past = isPast(day) && !isToday(day)
          const dayShifts = getShiftsForDate(day)
          const isSplit = dayShifts.length > 1

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
              className={clsx(
                'flex flex-col items-center py-1.5 rounded-xl transition-colors relative',
                selected
                  ? 'bg-shift-600'
                  : today
                  ? 'bg-shift-50'
                  : isSplit && inMonth
                  ? 'bg-warning-50'
                  : 'hover:bg-neutral-50',
                !inMonth && 'opacity-20',
                past && inMonth && 'opacity-50'
              )}
            >
              <span
                className={clsx(
                  'text-sm font-medium leading-tight',
                  selected ? 'text-white' : today ? 'text-shift-700' : 'text-navy-900'
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Dots: one per shift (max 2 shown) */}
              {dayShifts.length > 0 && inMonth && (
                <div className="flex gap-0.5 mt-0.5 items-center">
                  {dayShifts.slice(0, 2).map((shift, i) => (
                    <span
                      key={i}
                      className={clsx(
                        'rounded-full',
                        // Split shift dots are slightly smaller to fit side by side
                        isSplit ? 'w-1 h-1' : 'w-1.5 h-1.5',
                        selected ? 'bg-white' : STATUS_DOT[shift.status]
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="bg-white border border-neutral-100 rounded-2xl px-4 py-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
            {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
          </p>
          <DayShifts
            shifts={selectedShifts}
            centerName={centerName}
            freeLabel="Sin turno programado"
          />
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 pb-4 mt-auto flex-wrap">
        {([
          { status: 'published' as Shift['status'], label: 'Publicado' },
          { status: 'draft'     as Shift['status'], label: 'Borrador'  },
          { status: 'locked'    as Shift['status'], label: 'Cerrado'   },
        ]).map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={clsx('w-2 h-2 rounded-full', STATUS_DOT[status])} />
            <span className="text-xs text-neutral-400">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-warning-500 font-medium">T</span>
          <span className="text-xs text-neutral-400">Turno partido</span>
        </div>
      </div>
    </div>
  )
}

// ── Nav ────────────────────────────────────────────────────────────────────────

function WeekNav({
  label,
  onPrev,
  onNext,
}: {
  label: string
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <button
        onClick={onPrev}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-neutral-600" />
      </button>
      <span className="text-sm font-semibold text-navy-900 capitalize">{label}</span>
      <button
        onClick={onNext}
        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-neutral-600" />
      </button>
    </div>
  )
}
