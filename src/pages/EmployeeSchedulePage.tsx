import { useState } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertTriangle,
  CalendarDays,
  Check,
} from 'lucide-react'
import { format, addDays, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Shift, ValidationViolation } from '../types'
import {
  MOCK_EMPLOYMENTS,
  MOCK_SHIFTS,
  MOCK_CENTERS,
  MOCK_VIOLATIONS,
  PUBLIC_HOLIDAYS,
} from '../mock-data'
import { toISODate } from '../utils'

// ─── Shift block ──────────────────────────────────────────────────────────────

const SHIFT_STYLES: Record<Shift['status'], {
  leftBorder: string
  bg: string
  timeColor: string
  metaColor: string
  labelText: string
  labelColor: string
}> = {
  draft: {
    leftBorder: 'border-l-neutral-400',
    bg:         'bg-white',
    timeColor:  'text-neutral-700',
    metaColor:  'text-neutral-500',
    labelText:  'Provisional',
    labelColor: 'text-neutral-400',
  },
  review: {
    leftBorder: 'border-l-warning-500',
    bg:         'bg-warning-50',
    timeColor:  'text-neutral-800',
    metaColor:  'text-warning-700',
    labelText:  'En revisión',
    labelColor: 'text-warning-700',
  },
  published: {
    leftBorder: 'border-l-shift-600',
    bg:         'bg-shift-50',
    timeColor:  'text-neutral-900',
    metaColor:  'text-shift-700',
    labelText:  'Confirmado',
    labelColor: 'text-shift-700',
  },
  locked: {
    leftBorder: 'border-l-navy-700',
    bg:         'bg-navy-50',
    timeColor:  'text-navy-900',
    metaColor:  'text-navy-600',
    labelText:  'Cerrado',
    labelColor: 'text-navy-700',
  },
}

function ShiftBlock({ shift }: { shift: Shift }) {
  const s      = SHIFT_STYLES[shift.status]
  const center = MOCK_CENTERS.find(c => c.id === shift.center_id)

  return (
    <div
      className={`rounded-lg border border-neutral-200/80 border-l-[3px] ${s.leftBorder} ${s.bg} p-3`}
    >
      <p className={`text-sm font-mono font-bold leading-tight ${s.timeColor}`}>
        {shift.start_time} – {shift.end_time}
      </p>
      <p className={`text-xs mt-1 font-medium ${s.metaColor}`}>{shift.role}</p>
      <p className="text-xs text-neutral-400 truncate mt-0.5">{center?.name}</p>
      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-neutral-200/60">
        <span className="text-2xs text-neutral-400 font-mono">{shift.duration_hours}h</span>
        <span className={`text-2xs font-semibold ${s.labelColor}`}>{s.labelText}</span>
      </div>
    </div>
  )
}

// ─── Day card ─────────────────────────────────────────────────────────────────

function DayCard({
  date,
  shifts,
  violations,
  isHoliday,
}: {
  date:       Date
  shifts:     Shift[]
  violations: ValidationViolation[]
  isHoliday:  boolean
}) {
  const isRest    = shifts.length === 0
  const isWeekend = date.getDay() === 0 || date.getDay() === 6
  const dayHours  = shifts.reduce((acc, s) => acc + s.duration_hours, 0)

  const dayViolations  = violations.filter(v => shifts.some(s => s.id === v.shift_id))
  const restWarning    = dayViolations.find(v => v.rule_code === 'MIN_REST_PERIOD')
  const holidayNotice  = dayViolations.find(v => v.rule_code === 'PUBLIC_HOLIDAY_WORKED')

  const dayName = format(date, 'EEE', { locale: es })  // "lun"
  const dayNum  = format(date, 'd')                    // "17"

  return (
    <div
      className={`flex flex-col rounded-xl overflow-hidden border transition-shadow ${
        isRest
          ? 'border-dashed border-neutral-200 bg-neutral-50/60'
          : 'border-neutral-200 bg-white shadow-card'
      }`}
    >
      {/* Day header */}
      <div
        className={`px-3 pt-3 pb-2.5 border-b ${
          isRest ? 'border-neutral-200/50' : 'border-neutral-100'
        } ${isHoliday ? 'bg-info-50' : ''}`}
      >
        <p className="text-2xs font-bold uppercase tracking-widest text-neutral-400 capitalize">
          {dayName}
        </p>
        <p
          className={`text-2xl font-extrabold leading-none mt-0.5 ${
            isHoliday   ? 'text-info-600' :
            isWeekend && isRest ? 'text-neutral-300' :
            'text-neutral-900'
          }`}
        >
          {dayNum}
        </p>
        {isHoliday && (
          <span className="flex items-center gap-1 mt-1 text-2xs font-semibold text-info-600">
            <Info className="w-2.5 h-2.5" />
            Festivo
          </span>
        )}
      </div>

      {/* Shift(s) or rest */}
      <div className="flex-1 p-2.5 space-y-2">
        {isRest ? (
          <div className="flex items-center justify-center py-6">
            <p className={`text-xs font-medium ${isWeekend ? 'text-neutral-300' : 'text-neutral-400'}`}>
              {isWeekend ? 'Fin de semana' : 'Descanso'}
            </p>
          </div>
        ) : (
          shifts.map(s => <ShiftBlock key={s.id} shift={s} />)
        )}
      </div>

      {/* Day footer — hours + notices */}
      {!isRest && (
        <div className="px-3 pb-2.5 space-y-1.5">
          {/* Day total hours */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
            <span className="text-xs font-semibold text-neutral-700">{dayHours}h</span>
            {holidayNotice && (
              <span className="flex items-center gap-1 text-2xs text-info-600 font-semibold">
                <Info className="w-2.5 h-2.5" />
                +1 comp.
              </span>
            )}
          </div>

          {/* Rest gap warning */}
          {restWarning && (
            <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-warning-50 border border-warning-200">
              <AlertTriangle className="w-3 h-3 text-warning-600 flex-shrink-0 mt-0.5" />
              <p className="text-2xs text-warning-700 leading-tight">{restWarning.detail}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Week summary bar ─────────────────────────────────────────────────────────

function WeekSummaryBar({
  plannedHours,
  contractedHours,
  shiftCount,
}: {
  plannedHours:    number
  contractedHours: number
  shiftCount:      number
}) {
  const delta      = plannedHours - contractedHours
  const progressPct = Math.min((plannedHours / contractedHours) * 100, 100)
  const isOver     = delta > 0
  const isExact    = delta === 0

  return (
    <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-3">
      <div className="flex items-center gap-6">
        {/* Text summary */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold text-neutral-900 tabular-nums">
            {plannedHours}h planificadas
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-500 tabular-nums">{contractedHours}h contratadas</span>
          {isExact && (
            <span className="inline-flex items-center gap-1 text-success-600 font-semibold text-xs">
              <Check className="w-3 h-3" /> Semana completa
            </span>
          )}
          {!isExact && (
            <span className={`text-xs font-semibold tabular-nums ${isOver ? 'text-error-600' : 'text-warning-600'}`}>
              {isOver ? `+${delta}h exceso` : `${Math.abs(delta)}h sin cubrir`}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOver  ? 'bg-error-500'   :
                isExact ? 'bg-success-500' :
                          'bg-shift-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-mono text-neutral-400 tabular-nums w-9 text-right">
            {Math.round(progressPct)}%
          </span>
        </div>

        {/* Shift count */}
        <span className="text-xs text-neutral-400 whitespace-nowrap">
          {shiftCount} turno{shiftCount !== 1 ? 's' : ''} esta semana
        </span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const INITIAL_WEEK_START = new Date('2026-03-17')

interface EmployeeSchedulePageProps {
  employmentId: string
  onBack:       () => void
}

export function EmployeeSchedulePage({ employmentId, onBack }: EmployeeSchedulePageProps) {
  const [weekStart, setWeekStart] = useState(INITIAL_WEEK_START)

  const employment = MOCK_EMPLOYMENTS.find(e => e.id === employmentId)

  // Guard — should never happen in practice
  if (!employment) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-neutral-500">Empleado no encontrado.</p>
      </div>
    )
  }

  const weekDays      = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEndDate   = weekDays[6]
  const weekStartStr  = toISODate(weekStart)
  const weekEndStr    = toISODate(weekEndDate)

  // All shifts for this employee this week
  const weekShifts = MOCK_SHIFTS.filter(s =>
    s.employment_id === employmentId &&
    s.date >= weekStartStr &&
    s.date <= weekEndStr
  )

  // All violations for this employee (used for notices on day cards)
  const weekViolations = MOCK_VIOLATIONS.filter(v =>
    v.employment_id === employmentId &&
    weekShifts.some(s => s.id === v.shift_id)
  )

  // Info-level notices shown at the top (holiday compensation etc.)
  const topNotices = weekViolations.filter(v => v.severity === 'info')

  // Summary
  const plannedHours    = weekShifts.reduce((acc, s) => acc + s.duration_hours, 0)
  const contractedHours = employment.contracted_hours_week

  const center    = MOCK_CENTERS.find(c => c.id === employment.center_id)
  const weekLabel = `${format(weekStart, "d MMM", { locale: es })} – ${format(weekEndDate, "d MMM yyyy", { locale: es })}`

  return (
    <div className="flex flex-col h-full bg-neutral-50">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center justify-between gap-6">

          {/* Back + employee identity */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Empleados
            </button>
            <div className="w-px h-8 bg-neutral-200 flex-shrink-0" />
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                style={{ backgroundColor: employment.person.avatar_color }}
              >
                {employment.person.avatar_initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {employment.person.legal_name}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {employment.role} · {center?.name} · {contractedHours}h/sem
                </p>
              </div>
            </div>
          </div>

          {/* Week navigator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setWeekStart(w => subWeeks(w, 1))}
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-neutral-900 min-w-[200px] text-center capitalize">
              {weekLabel}
            </span>
            <button
              onClick={() => setWeekStart(w => addWeeks(w, 1))}
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Top notices (holiday compensation etc.) ── */}
      {topNotices.length > 0 && (
        <div className="flex-shrink-0 bg-info-50 border-b border-info-200 px-5 py-2.5">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-info-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {topNotices.map(n => (
                <p key={n.id} className="text-xs text-info-800">
                  <span className="font-semibold">{n.message}</span>
                  {n.detail ? ` — ${n.detail}` : ''}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Week grid ── */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {weekShifts.length === 0 && (
          // Week-level empty state — all days are rest
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <CalendarDays className="w-12 h-12 text-neutral-300" />
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-500">Sin turnos esta semana</p>
              <p className="text-xs text-neutral-400 mt-1">
                No hay turnos planificados para {employment.person.legal_name.split(' ')[0]} en {weekLabel}
              </p>
            </div>
          </div>
        )}

        {/* Always render the 7 day cards so rest days are visible */}
        <div className="grid grid-cols-7 gap-3 min-w-[700px]" style={{ minHeight: '320px' }}>
          {weekDays.map(day => {
            const dateStr    = toISODate(day)
            const dayShifts  = weekShifts.filter(s => s.date === dateStr)
            const dayViol    = weekViolations.filter(v => dayShifts.some(s => s.id === v.shift_id))
            const isHoliday  = PUBLIC_HOLIDAYS.includes(dateStr)

            return (
              <DayCard
                key={dateStr}
                date={day}
                shifts={dayShifts}
                violations={dayViol}
                isHoliday={isHoliday}
              />
            )
          })}
        </div>
      </div>

      {/* ── Weekly summary ── */}
      <WeekSummaryBar
        plannedHours={plannedHours}
        contractedHours={contractedHours}
        shiftCount={weekShifts.length}
      />
    </div>
  )
}
