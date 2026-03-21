import type { Employment, Shift, ValidationViolation } from '../types'
import { ShiftCell } from './ShiftCell'
import { CalendarClock } from 'lucide-react'
import { format } from 'date-fns'
import { PUBLIC_HOLIDAYS } from '../mock-data'

interface EmployeeRowProps {
  employment: Employment
  weekDays: Date[]
  shifts: Shift[]
  violations: ValidationViolation[]
  planningStatus: string
  totalHours: number
  contractedHours: number
  hasStandardWeek: boolean
  onApplyStandardWeek: () => void
  onCellClick: (employment: Employment, date: string, shift: Shift | null, cellRect?: DOMRect) => void
}

function getWeekHours(shifts: Shift[]): number {
  return shifts.reduce((sum, s) => sum + s.duration_hours, 0)
}

function getHoursColor(total: number, contracted: number): string {
  if (total > contracted) return 'text-error-600 font-semibold'
  if (total === contracted) return 'text-success-600 font-semibold'
  if (total >= contracted * 0.8) return 'text-neutral-700'
  return 'text-neutral-400'
}

export function EmployeeRow({
  employment,
  weekDays,
  shifts,
  violations,
  planningStatus,
  totalHours,
  contractedHours,
  hasStandardWeek,
  onApplyStandardWeek,
  onCellClick,
}: EmployeeRowProps) {
  const weekHours = getWeekHours(shifts)
  const isLocked = planningStatus === 'locked'
  const hasViolation = violations.some(v => v.severity === 'error')

  const shiftsByDate = new Map<string, Shift[]>()
  for (const s of shifts) {
    const existing = shiftsByDate.get(s.date) ?? []
    shiftsByDate.set(s.date, [...existing, s])
  }
  const violationsByDate = new Map<string, ValidationViolation[]>()
  for (const v of violations) {
    const shift = shifts.find(s => s.id === v.shift_id)
    if (shift) {
      const existing = violationsByDate.get(shift.date) ?? []
      violationsByDate.set(shift.date, [...existing, v])
    }
  }

  return (
    <div className={`flex border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors ${hasViolation ? 'bg-error-50/30' : ''}`}>
      {/* Employee info column */}
      <div className="w-48 flex-shrink-0 flex items-center gap-2.5 px-3 py-2 border-r border-neutral-100">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
          style={{ backgroundColor: employment.person.avatar_color }}
        >
          {employment.person.avatar_initials}
        </div>

        {/* Name + role + hours */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-900 truncate leading-tight">
            {employment.person.legal_name.split(' ')[0]} {employment.person.legal_name.split(' ')[1]}
          </p>
          <p className="text-2xs text-neutral-500 truncate leading-tight">{employment.role}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`text-2xs tabular-nums ${getHoursColor(weekHours, employment.contracted_hours_week)}`}>
              {weekHours}h
            </span>
            <span className="text-2xs text-neutral-300">/</span>
            <span className="text-2xs text-neutral-400 tabular-nums">
              {employment.contracted_hours_week}h
            </span>
            {hasStandardWeek && !isLocked && (
              <button
                onClick={e => { e.stopPropagation(); onApplyStandardWeek() }}
                title="Aplicar semana tipo"
                className="ml-1 p-0.5 rounded text-shift-400 hover:text-shift-700 hover:bg-shift-50 transition-colors"
              >
                <CalendarClock className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shift cells — one per day */}
      <div className="flex-1 grid grid-cols-7 gap-1 px-1 py-1.5">
        {weekDays.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayShifts = shiftsByDate.get(dateStr) ?? []
          const dayViolations = violationsByDate.get(dateStr) ?? []
          const isHoliday = PUBLIC_HOLIDAYS.includes(dateStr)

          return (
            <ShiftCell
              key={dateStr}
              employmentId={employment.id}
              date={dateStr}
              shifts={dayShifts}
              violations={dayViolations}
              isHoliday={isHoliday}
              isLocked={isLocked}
              onClick={(shift, cellRect) => onCellClick(employment, dateStr, shift, cellRect)}
            />
          )
        })}
      </div>

      {/* Right totals column */}
      <div className="w-24 flex-shrink-0 flex items-center justify-center border-l border-neutral-200 px-2">
        <div className="text-center w-full">
          <div className={`text-sm font-bold tabular-nums leading-tight ${
            totalHours > contractedHours ? 'text-error-600' :
            totalHours === contractedHours ? 'text-success-600' :
            'text-neutral-800'
          }`}>
            {totalHours}h
          </div>
          <div className="text-2xs text-neutral-400 tabular-nums leading-tight">
            / {contractedHours}h
          </div>
          <div className="w-full h-1 bg-neutral-200 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-1 rounded-full transition-all ${
                totalHours > contractedHours ? 'bg-error-500' :
                totalHours === contractedHours ? 'bg-success-500' :
                'bg-shift-400'
              }`}
              style={{ width: `${Math.min(100, contractedHours > 0 ? (totalHours / contractedHours) * 100 : 0)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
