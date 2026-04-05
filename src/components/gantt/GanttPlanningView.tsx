import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type {
  Employment, Shift, ValidationViolation, WeekRange,
  Absence, EmployeeCost, RevenueDaily, CostSummary, PlanningStatus,
  PlanningFilters, StandardWeekShift,
} from '../../types'

import { GanttGrid } from './GanttGrid'
import { DaySelector } from './DaySelector'
import { CostSummaryHeader } from '../CostSummaryHeader'
import type { SortMode } from './GanttTimeHeader'

const ROLE_ORDER = ['Sala', 'Cocina', 'Mantenimiento', 'Limpieza']

interface GanttPlanningViewProps {
  weekRange:         WeekRange
  weekDays:          Date[]
  planningStatus:    PlanningStatus
  employments:       Employment[]
  shifts:            Shift[]
  allShifts?:        Shift[]
  violations:        ValidationViolation[]
  absences:          Absence[]
  employeeCosts:     EmployeeCost[]
  revenueDailyMap:   Map<string, RevenueDaily>
  filters:           PlanningFilters
  standardWeeks:     Record<string, StandardWeekShift[]>
  onShiftClick:      (shift: Shift, employment: Employment) => void
  onShiftUpdate:     (shiftId: string, newStart: string, newEnd: string) => void
  onEmptyCellClick:  (employment: Employment, date: string, timeHint: string, rect: DOMRect) => void
  onApplyStandardDay:(employmentId: string, date: string) => void
  onAbsenceClick:    (absence: Absence, employment: Employment) => void
  onShiftDraw:       (employment: Employment, date: string, startTime: string, endTime: string) => void
}

// ─── Cost calculation ──────────────────────────────────────────────────────────

function computeCostSummary(
  dayShifts: Shift[],
  employments: Employment[],
  costs: EmployeeCost[],
  revenue: RevenueDaily | undefined,
): CostSummary {
  const perEmp = employments
    .map(emp => {
      const cost = costs.find(c => c.employment_id === emp.id)
      if (!cost) return null

      const empShifts = dayShifts.filter(s => s.employment_id === emp.id)
      const planned_hours = empShifts.reduce((s, sh) => s + sh.duration_hours, 0)

      const contracted_day  = emp.contracted_hours_week / 5
      const normal_hours    = Math.min(planned_hours, contracted_day)
      const extra_hours     = Math.max(0, planned_hours - contracted_day)

      const rate   = cost.hourly_rate
      const ss     = cost.ss_rate
      const mult   = cost.overtime_mult

      const cost_fixed = normal_hours * rate * (1 + ss)
      const cost_extra = extra_hours  * rate * mult * (1 + ss)

      return {
        employment_id: emp.id,
        planned_hours,
        extra_hours,
        cost_fixed,
        cost_extra,
        cost_total: cost_fixed + cost_extra,
      }
    })
    .filter(Boolean) as CostSummary['per_employment']

  const fixed_cost = perEmp.reduce((s, e) => s + e.cost_fixed, 0)
  const extra_cost = perEmp.reduce((s, e) => s + e.cost_extra, 0)
  const total_cost = fixed_cost + extra_cost

  const revenue_actual    = revenue?.revenue_actual    ?? null
  const revenue_estimated = revenue?.revenue_estimated ?? 0
  const target_ratio      = revenue?.target_labor_ratio ?? 0.15
  const base_rev          = revenue_actual ?? revenue_estimated
  const labor_ratio       = base_rev > 0 ? total_cost / base_rev : 0

  return {
    fixed_cost,
    extra_cost,
    total_cost,
    revenue_actual,
    revenue_estimated,
    labor_ratio,
    target_ratio,
    deviation:      labor_ratio - target_ratio,
    revenue_source: revenue?.source ?? 'estimate',
    per_employment: perEmp,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GanttPlanningView({
  weekRange,
  weekDays,
  planningStatus,
  employments,
  shifts,
  violations,
  absences,
  employeeCosts,
  revenueDailyMap,
  filters,
  standardWeeks,
  onShiftClick,
  onShiftUpdate,
  onEmptyCellClick,
  onApplyStandardDay,
  onAbsenceClick,
  onShiftDraw,
}: GanttPlanningViewProps) {
  const [selectedDate, setSelectedDate] = useState(
    format(weekRange.start, 'yyyy-MM-dd')
  )
  const [sortMode,      setSortMode]      = useState<SortMode>('role')
  const [employeeOrder, setEmployeeOrder] = useState<string[]>([])

  const isLocked = planningStatus === 'locked' || planningStatus === 'published'

  const dayShifts = useMemo(
    () => shifts.filter(s => s.date === selectedDate),
    [shifts, selectedDate],
  )

  const filteredEmployments = useMemo(
    () => employments.filter(emp => {
      if (filters.center_id && emp.center_id !== filters.center_id) return false
      if (filters.role      && emp.role      !== filters.role)       return false
      return true
    }),
    [employments, filters],
  )

  const sortedEmployments = useMemo(() => {
    if (sortMode === 'role') {
      return [...filteredEmployments].sort((a, b) => {
        const ai = ROLE_ORDER.indexOf(a.role)
        const bi = ROLE_ORDER.indexOf(b.role)
        const rd = (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
        return rd !== 0 ? rd : a.person.legal_name.localeCompare(b.person.legal_name)
      })
    }
    if (sortMode === 'start-time') {
      const firstStart = (empId: string) =>
        dayShifts
          .filter(s => s.employment_id === empId)
          .reduce<string | null>((min, s) => (!min || s.start_time < min ? s.start_time : min), null)
      return [...filteredEmployments].sort((a, b) => {
        const as_ = firstStart(a.id)
        const bs_ = firstStart(b.id)
        if (!as_ && !bs_) return 0
        if (!as_) return 1
        if (!bs_) return -1
        return as_.localeCompare(bs_)
      })
    }
    // manual
    if (!employeeOrder.length) return filteredEmployments
    const idx = new Map(employeeOrder.map((id, i) => [id, i]))
    return [...filteredEmployments].sort((a, b) =>
      (idx.get(a.id) ?? 999) - (idx.get(b.id) ?? 999)
    )
  }, [filteredEmployments, sortMode, employeeOrder, dayShifts])

  function handleReorder(newIds: string[]) {
    setEmployeeOrder(newIds)
    setSortMode('manual')
  }

  const costSummary = useMemo(
    () => computeCostSummary(
      dayShifts,
      filteredEmployments,
      employeeCosts,
      revenueDailyMap.get(selectedDate),
    ),
    [dayShifts, filteredEmployments, employeeCosts, revenueDailyMap, selectedDate],
  )

  const dateLabel = format(new Date(selectedDate + 'T12:00'), "EEEE d 'de' MMMM", { locale: es })
  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Day selector tabs */}
      <DaySelector
        weekDays={weekDays}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Economic KPI header */}
      <CostSummaryHeader
        summary={costSummary}
        dateLabel={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
      />

      {/* Grid */}
      {filteredEmployments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-700">Sin empleados</p>
            <p className="text-xs text-neutral-400 mt-1">Ajusta los filtros para ver empleados</p>
          </div>
        </div>
      ) : (
        <GanttGrid
          date={selectedDate}
          employments={sortedEmployments}
          shifts={dayShifts}
          violations={violations}
          absences={absences}
          isLocked={isLocked}
          standardWeeks={standardWeeks}
          sortMode={sortMode}
          onSortChange={setSortMode}
          onShiftClick={onShiftClick}
          onShiftUpdate={onShiftUpdate}
          onEmptyCellClick={onEmptyCellClick}
          onApplyStandardDay={onApplyStandardDay}
          onReorder={handleReorder}
          onAbsenceClick={onAbsenceClick}
          onShiftDraw={onShiftDraw}
        />
      )}
    </div>
  )
}
