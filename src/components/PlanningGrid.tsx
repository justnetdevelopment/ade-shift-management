import { useState } from 'react'
import { format, isToday, isWeekend, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Users, Clock } from 'lucide-react'
import type { Employment, Shift, ValidationViolation, PlanningStatus, WeekRange, StandardWeekShift, Absence } from '../types'
import { EmployeeRow } from './EmployeeRow'
import { PUBLIC_HOLIDAYS } from '../mock-data'

type TotalMode = 'week' | 'month'

interface PlanningGridProps {
  weekDays: Date[]
  weekRange: WeekRange
  employments: Employment[]
  shifts: Shift[]          // current week only (for the grid cells)
  allShifts: Shift[]       // all shifts — used for monthly totals
  violations: ValidationViolation[]
  absences: Absence[]
  planningStatus: PlanningStatus
  standardWeeks: Record<string, StandardWeekShift[]>
  onApplyStandardWeek: (employmentId: string) => void
  onCellClick: (employment: Employment, date: string, shift: Shift | null, cellRect?: DOMRect) => void
  onAbsenceClick: (absence: Absence, employment: Employment) => void
}

const DAY_ABBR: Record<string, string> = {
  lunes: 'Lun',
  martes: 'Mar',
  miércoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sábado: 'Sáb',
  domingo: 'Dom',
}

export function PlanningGrid({
  weekDays,
  weekRange,
  employments,
  shifts,
  allShifts,
  violations,
  absences,
  planningStatus,
  standardWeeks,
  onApplyStandardWeek,
  onCellClick,
  onAbsenceClick,
}: PlanningGridProps) {
  const [totalMode, setTotalMode] = useState<TotalMode>('week')

  // Month range based on the week's Monday
  const monthStart = format(startOfMonth(weekRange.start), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(weekRange.start), 'yyyy-MM-dd')
  const daysInMonth = getDaysInMonth(weekRange.start)

  // Shifts in the current month (for monthly totals)
  const monthShifts = allShifts.filter(s => s.date >= monthStart && s.date <= monthEnd)

  function getTotalHours(employment: Employment): number {
    const source = totalMode === 'week' ? shifts : monthShifts
    const hours = source
      .filter(s => s.employment_id === employment.id)
      .reduce((sum, s) => sum + s.duration_hours, 0)
    return Math.round(hours * 10) / 10
  }

  function getContractedHours(employment: Employment): number {
    if (totalMode === 'week') return employment.contracted_hours_week
    return Math.round(employment.contracted_hours_week * (daysInMonth / 7) * 10) / 10
  }

  // Grand totals for the footer right cell
  const grandTotal = Math.round(
    employments.reduce((sum, emp) => sum + getTotalHours(emp), 0) * 10
  ) / 10
  const grandContracted = Math.round(
    employments.reduce((sum, emp) => sum + getContractedHours(emp), 0) * 10
  ) / 10

  // Empty state
  if (employments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
            <CalendarDays className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-700">Sin empleados</p>
          <p className="text-xs text-neutral-400 mt-1">Ajusta los filtros para ver empleados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Grid header — day columns */}
      <div className="flex flex-shrink-0 border-b border-neutral-200 bg-white">
        {/* Employee column header */}
        <div className="w-48 flex-shrink-0 px-3 py-2 border-r border-neutral-200">
          <span className="text-2xs font-semibold uppercase tracking-wide text-neutral-400">
            Empleado
          </span>
        </div>

        {/* Day headers */}
        <div className="flex-1 grid grid-cols-7 gap-1 px-1 py-2">
          {weekDays.map(day => {
            const dayName = format(day, 'EEEE', { locale: es }).toLowerCase()
            const abbr = DAY_ABBR[dayName] ?? dayName.slice(0, 3)
            const dayNum = format(day, 'd')
            const dateStr = format(day, 'yyyy-MM-dd')
            const today = isToday(day)
            const weekend = isWeekend(day)
            const holiday = PUBLIC_HOLIDAYS.includes(dateStr)

            return (
              <div
                key={dateStr}
                className={`flex flex-col items-center py-0.5 rounded-md ${today ? 'bg-shift-50' : ''}`}
              >
                <span className={`text-2xs font-semibold uppercase tracking-wide ${
                  today ? 'text-shift-600' :
                  weekend || holiday ? 'text-neutral-400' :
                  'text-neutral-500'
                }`}>
                  {abbr}
                </span>
                <span className={`text-sm font-bold tabular-nums ${
                  today ? 'text-shift-700' :
                  weekend || holiday ? 'text-neutral-400' :
                  'text-neutral-800'
                }`}>
                  {dayNum}
                </span>
                {holiday && (
                  <span className="text-2xs text-info-500 font-medium leading-tight">Festivo</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Right column header — mode toggle */}
        <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center border-l border-neutral-200 px-1 py-1.5 gap-1">
          <span className="text-2xs font-semibold uppercase tracking-wide text-neutral-400">
            Total
          </span>
          <div className="flex rounded-md overflow-hidden border border-neutral-200 text-2xs font-semibold">
            <button
              onClick={() => setTotalMode('week')}
              className={`px-1.5 py-0.5 transition-colors ${
                totalMode === 'week'
                  ? 'bg-shift-600 text-white'
                  : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              Sem
            </button>
            <button
              onClick={() => setTotalMode('month')}
              className={`px-1.5 py-0.5 transition-colors border-l border-neutral-200 ${
                totalMode === 'month'
                  ? 'bg-shift-600 text-white'
                  : 'text-neutral-500 hover:bg-neutral-50'
              }`}
            >
              Mes
            </button>
          </div>
        </div>
      </div>

      {/* Employee rows */}
      <div className="flex-1 overflow-y-auto">
        {employments.map(employment => {
          const employmentShifts = shifts.filter(s => s.employment_id === employment.id)
          const employmentViolations = violations.filter(v => v.employment_id === employment.id)

          // Build absencesByDate map for this employee (only approved, within this week)
          const weekStart = format(weekRange.start, 'yyyy-MM-dd')
          const weekEnd   = format(weekRange.end,   'yyyy-MM-dd')
          const absencesByDate = new Map<string, Absence>()
          for (const abs of absences) {
            if (abs.employment_id !== employment.id) continue
            if (abs.status !== 'approved') continue
            for (const day of weekDays) {
              const d = format(day, 'yyyy-MM-dd')
              if (abs.start_date <= d && abs.end_date >= d && d >= weekStart && d <= weekEnd) {
                absencesByDate.set(d, abs)
              }
            }
          }

          return (
            <EmployeeRow
              key={employment.id}
              employment={employment}
              weekDays={weekDays}
              shifts={employmentShifts}
              violations={employmentViolations}
              absencesByDate={absencesByDate}
              planningStatus={planningStatus}
              totalHours={getTotalHours(employment)}
              contractedHours={getContractedHours(employment)}
              hasStandardWeek={(standardWeeks[employment.id]?.length ?? 0) > 0}
              onApplyStandardWeek={() => onApplyStandardWeek(employment.id)}
              onCellClick={onCellClick}
              onAbsenceClick={onAbsenceClick}
            />
          )
        })}
      </div>

      {/* Daily totals footer — always visible */}
      <div className="flex flex-shrink-0 border-t-2 border-neutral-200 bg-neutral-50">
        {/* Label column */}
        <div className="w-48 flex-shrink-0 flex items-center px-3 py-2 border-r border-neutral-200">
          <span className="text-2xs font-semibold uppercase tracking-wide text-neutral-500">
            Totales
          </span>
        </div>

        {/* Per-day totals */}
        <div className="flex-1 grid grid-cols-7 gap-1 px-1 py-2">
          {weekDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayShifts = shifts.filter(s => s.date === dateStr)
            const peopleCount = new Set(dayShifts.map(s => s.employment_id)).size
            const totalHours = Math.round(dayShifts.reduce((sum, s) => sum + s.duration_hours, 0) * 10) / 10
            const today = isToday(day)

            return (
              <div
                key={dateStr}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 rounded-md ${today ? 'bg-shift-50' : ''}`}
              >
                {peopleCount > 0 ? (
                  <>
                    <div className={`flex items-center gap-1 ${today ? 'text-shift-700' : 'text-neutral-700'}`}>
                      <Users className="w-3 h-3 opacity-60" />
                      <span className="text-xs font-bold tabular-nums">{peopleCount}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${today ? 'text-shift-500' : 'text-neutral-400'}`}>
                      <Clock className="w-3 h-3" />
                      <span className="text-2xs tabular-nums font-semibold">{totalHours}h</span>
                    </div>
                  </>
                ) : (
                  <span className="text-2xs text-neutral-300">—</span>
                )}
              </div>
            )
          })}
        </div>

        {/* Right column footer — grand total */}
        <div className="w-24 flex-shrink-0 flex flex-col items-center justify-center border-l border-neutral-200 px-2 py-2">
          <div className={`text-sm font-bold tabular-nums leading-tight ${
            grandTotal > grandContracted ? 'text-error-600' : 'text-neutral-800'
          }`}>
            {grandTotal}h
          </div>
          <div className="text-2xs text-neutral-400 tabular-nums leading-tight">
            / {grandContracted}h
          </div>
        </div>
      </div>
    </div>
  )
}
