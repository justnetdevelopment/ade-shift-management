import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { addWeeks, subWeeks, startOfWeek, addDays, format } from 'date-fns'

import { PlanningToolbar }    from '../components/PlanningToolbar'
import { ValidationPanel }    from '../components/ValidationPanel'
import { PlanningGrid }       from '../components/PlanningGrid'
import { ShiftDrawer }        from '../components/ShiftDrawer'
import { AbsenceDrawer }      from '../components/AbsenceDrawer'
import { QuickAddPopover }    from '../components/QuickAddPopover'
import { GanttPlanningView }  from '../components/gantt/GanttPlanningView'

import type {
  Employment, Shift, ValidationViolation, WeekRange,
  PlanningStatus, PlanningFilters, StandardWeekShift, ViewMode,
  Absence, AbsenceType,
} from '../types'

import { MOCK_EMPLOYMENTS, MOCK_SHIFTS, MOCK_VIOLATIONS } from '../mock-data'
import {
  MOCK_EXTRA_SHIFTS, MOCK_ABSENCES, MOCK_EMPLOYEE_COSTS, MOCK_REVENUE_DAILY,
} from '../mock-data-gantt'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeekRange(date: Date): WeekRange {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return { start, end: addDays(start, 6) }
}

function getWeekDays(weekRange: WeekRange): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekRange.start, i))
}

const INITIAL_WEEK = getWeekRange(new Date('2026-03-17'))
const ALL_SHIFTS   = [...MOCK_SHIFTS, ...MOCK_EXTRA_SHIFTS]

const REVENUE_MAP = new Map(MOCK_REVENUE_DAILY.map(r => [r.date, r]))

interface PlanningPageProps {
  standardWeeks: Record<string, StandardWeekShift[]>
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PlanningPage({ standardWeeks }: PlanningPageProps) {
  const [weekRange,      setWeekRange]      = useState<WeekRange>(INITIAL_WEEK)
  const [planningStatus, setPlanningStatus] = useState<PlanningStatus>('draft')
  const [shifts,         setShifts]         = useState<Shift[]>(ALL_SHIFTS)
  const [absences,       setAbsences]       = useState<Absence[]>(MOCK_ABSENCES)
  const [violations,     setViolations]     = useState<ValidationViolation[]>(MOCK_VIOLATIONS)
  const [viewMode,       setViewMode]       = useState<ViewMode>('weekly')
  const [filters,        setFilters]        = useState<PlanningFilters>({
    center_id: null,
    role:      null,
    show_violations_only: false,
  })

  // Drawer state
  const [drawerOpen,          setDrawerOpen]          = useState(false)
  const [selectedEmployment,  setSelectedEmployment]  = useState<Employment | null>(null)
  const [selectedDate,        setSelectedDate]        = useState<string | null>(null)
  const [selectedShift,       setSelectedShift]       = useState<Shift | null>(null)

  // Absence drawer state
  const [absenceDrawerOpen,     setAbsenceDrawerOpen]     = useState(false)
  const [selectedAbsence,       setSelectedAbsence]       = useState<Absence | null>(null)
  const [absenceEmployment,     setAbsenceEmployment]     = useState<Employment | null>(null)

  // Quick-add popover
  const [popover, setPopover] = useState<{
    employment: Employment
    date: string
    cellRect: DOMRect
    timeHint?: string
  } | null>(null)

  // DnD (weekly view only)
  const [activeShift, setActiveShift] = useState<Shift | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const weekDays = getWeekDays(weekRange)

  const filteredEmployments = useMemo(
    () => MOCK_EMPLOYMENTS.filter(emp => {
      if (filters.center_id && emp.center_id !== filters.center_id) return false
      if (filters.role      && emp.role      !== filters.role)       return false
      return true
    }),
    [filters],
  )

  const weekShifts = useMemo(() => {
    const ws = format(weekRange.start, 'yyyy-MM-dd')
    const we = format(weekRange.end,   'yyyy-MM-dd')
    return shifts.filter(s => s.date >= ws && s.date <= we)
  }, [shifts, weekRange])

  // ── Shift CRUD ───────────────────────────────────────────────────────────────

  function handleCellClick(employment: Employment, date: string, shift: Shift | null, cellRect?: DOMRect) {
    if (shift) {
      setSelectedEmployment(employment)
      setSelectedDate(date)
      setSelectedShift(shift)
      setDrawerOpen(true)
    } else if (cellRect) {
      setPopover({ employment, date, cellRect })
    } else {
      setSelectedEmployment(employment)
      setSelectedDate(date)
      setSelectedShift(null)
      setDrawerOpen(true)
    }
  }

  function handleGanttEmptyClick(employment: Employment, date: string, timeHint: string, rect: DOMRect) {
    setPopover({ employment, date, cellRect: rect, timeHint })
  }

  function handleGanttApplyStandardDay(employmentId: string, date: string) {
    const template = standardWeeks[employmentId]
    if (!template?.length) return

    const d = new Date(date + 'T12:00')
    // day_of_week: 0 = Monday … 6 = Sunday
    const dayOfWeek = ((d.getDay() + 6) % 7) as 0|1|2|3|4|5|6
    const dayTemplates = template.filter(t => t.day_of_week === dayOfWeek)
    if (!dayTemplates.length) return

    const newShifts: Shift[] = []
    for (const t of dayTemplates) {
      const alreadyHas = shifts.some(
        s => s.employment_id === employmentId && s.date === date
      )
      if (alreadyHas) continue

      const [sh, sm] = t.start_time.split(':').map(Number)
      const [eh, em] = t.end_time.split(':').map(Number)
      let minutes = (eh * 60 + em) - (sh * 60 + sm)
      if (minutes < 0) minutes += 1440

      newShifts.push({
        id:             `s${Date.now()}-${Math.random()}`,
        employment_id:  employmentId,
        date,
        start_time:     t.start_time,
        end_time:       t.end_time,
        center_id:      t.center_id,
        role:           t.role,
        status:         'draft',
        duration_hours: Math.round(minutes / 60 * 10) / 10,
      })
    }

    if (newShifts.length > 0) {
      setShifts(prev => [...prev, ...newShifts])
      recomputeViolations()
    }
  }

  function handleQuickAdd(startTime: string, endTime: string) {
    if (!popover) return
    handleSaveShift({
      employment_id: popover.employment.id,
      date:          popover.date,
      start_time:    startTime,
      end_time:      endTime,
      center_id:     popover.employment.center_id,
      role:          popover.employment.role,
    })
    setPopover(null)
  }

  function handleQuickAbsence(type: AbsenceType) {
    if (!popover) return
    const LABELS: Record<AbsenceType, string> = {
      vacation:    'Vacaciones',
      sick_leave:  'Baja médica',
      personal:    'Asunto propio',
      justified:   'Justificada',
      unjustified: 'Injustificada',
    }
    const newAbsence: Absence = {
      id:            `abs-${Date.now()}`,
      employment_id: popover.employment.id,
      type,
      label:         LABELS[type],
      start_date:    popover.date,
      end_date:      popover.date,
      status:        'approved',
      blocks_planning: type === 'vacation' || type === 'sick_leave',
    }
    setAbsences(prev => [...prev, newAbsence])
    setPopover(null)
  }

  function handleCustomize() {
    if (!popover) return
    setSelectedEmployment(popover.employment)
    setSelectedDate(popover.date)
    setSelectedShift(null)
    setPopover(null)
    setDrawerOpen(true)
  }

  function handleAbsenceClick(absence: Absence, employment: Employment) {
    setSelectedAbsence(absence)
    setAbsenceEmployment(employment)
    setAbsenceDrawerOpen(true)
  }

  function handleAbsenceSave(updated: Absence) {
    setAbsences(prev => prev.map(a => a.id === updated.id ? updated : a))
  }

  function handleAbsenceDelete(absenceId: string) {
    setAbsences(prev => prev.filter(a => a.id !== absenceId))
  }

  function handleSaveShift(
    shiftData: Omit<Shift, 'id' | 'status' | 'duration_hours'> & { id?: string }
  ) {
    const [sh, sm] = shiftData.start_time.split(':').map(Number)
    const [eh, em] = shiftData.end_time.split(':').map(Number)
    let minutes = (eh * 60 + em) - (sh * 60 + sm)
    if (minutes < 0) minutes += 1440
    const duration_hours = Math.round(minutes / 60 * 10) / 10

    if (shiftData.id) {
      setShifts(prev => prev.map(s =>
        s.id === shiftData.id ? { ...s, ...shiftData, duration_hours } : s
      ))
    } else {
      const newShift: Shift = {
        id: `s${Date.now()}`,
        ...shiftData,
        status: 'draft',
        duration_hours,
      }
      setShifts(prev => [...prev, newShift])
    }
    recomputeViolations()
  }

  function handleGanttShiftDraw(employment: Employment, date: string, startTime: string, endTime: string) {
    handleSaveShift({
      employment_id: employment.id,
      date,
      start_time:    startTime,
      end_time:      endTime,
      center_id:     employment.center_id,
      role:          employment.role,
    })
  }

  function handleGanttShiftUpdate(shiftId: string, newStart: string, newEnd: string) {
    handleSaveShift({
      ...shifts.find(s => s.id === shiftId)!,
      id:         shiftId,
      start_time: newStart,
      end_time:   newEnd,
    })
  }

  function handleDeleteShift(shiftId: string) {
    setShifts(prev => prev.filter(s => s.id !== shiftId))
    setViolations(prev => prev.filter(v => v.shift_id !== shiftId))
  }

  function recomputeViolations() {
    setViolations([...MOCK_VIOLATIONS])
  }

  // ── DnD (weekly grid) ────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    const shift = weekShifts.find(s => s.id === event.active.id)
    setActiveShift(shift ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveShift(null)
    const { active, over } = event
    if (!over || !active.data.current) return
    const shift = active.data.current.shift as Shift
    if (!shift) return

    const overId = over.id as string
    const dashIdx = overId.indexOf('-')
    const employmentId = overId.slice(0, dashIdx)
    const newDate      = overId.slice(dashIdx + 1)

    if (shift.date === newDate && shift.employment_id === employmentId) return

    setShifts(prev => prev.map(s =>
      s.id === shift.id
        ? { ...s, date: newDate, employment_id: employmentId, status: 'draft' }
        : s
    ))
    recomputeViolations()
  }

  // ── Planning status ──────────────────────────────────────────────────────────

  function handlePublish() {
    const nextStatus: Record<PlanningStatus, PlanningStatus> = {
      draft: 'review', review: 'published', published: 'published', locked: 'locked',
    }
    setPlanningStatus(prev => nextStatus[prev])
  }

  function handleCopyPreviousWeek() {
    const prevStart = format(subWeeks(weekRange.start, 1), 'yyyy-MM-dd')
    const prevEnd   = format(subWeeks(weekRange.end,   1), 'yyyy-MM-dd')
    const copied = shifts
      .filter(s => s.date >= prevStart && s.date <= prevEnd)
      .map(s => ({
        ...s,
        id:     `s${Date.now()}-${Math.random()}`,
        date:   format(addWeeks(new Date(s.date), 1), 'yyyy-MM-dd'),
        status: 'draft' as PlanningStatus,
      }))
    setShifts(prev => [...prev, ...copied])
  }

  function handleApplyStandardWeek(employmentId: string) {
    const template = standardWeeks[employmentId]
    if (!template?.length) return

    const newShifts: Shift[] = []
    for (const t of template) {
      const targetDate = format(addDays(weekRange.start, t.day_of_week), 'yyyy-MM-dd')
      const alreadyHas = weekShifts.some(
        s => s.employment_id === employmentId && s.date === targetDate
      )
      if (alreadyHas) continue

      const [sh, sm] = t.start_time.split(':').map(Number)
      const [eh, em] = t.end_time.split(':').map(Number)
      let minutes = (eh * 60 + em) - (sh * 60 + sm)
      if (minutes < 0) minutes += 1440

      newShifts.push({
        id:             `s${Date.now()}-${Math.random()}`,
        employment_id:  employmentId,
        date:           targetDate,
        start_time:     t.start_time,
        end_time:       t.end_time,
        center_id:      t.center_id,
        role:           t.role,
        status:         'draft',
        duration_hours: Math.round(minutes / 60 * 10) / 10,
      })
    }

    if (newShifts.length > 0) {
      setShifts(prev => [...prev, ...newShifts])
      recomputeViolations()
    }
  }

  // ── Drawer violations ────────────────────────────────────────────────────────

  const drawerViolations = selectedShift
    ? violations.filter(v => v.shift_id === selectedShift.id || v.employment_id === selectedEmployment?.id)
    : violations.filter(v => v.employment_id === selectedEmployment?.id)

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">

        {/* Toolbar */}
        <PlanningToolbar
          weekRange={weekRange}
          planningStatus={planningStatus}
          activeCenter={filters.center_id}
          activeRole={filters.role}
          viewMode={viewMode}
          onWeekChange={setWeekRange}
          onCenterChange={c => setFilters(f => ({ ...f, center_id: c }))}
          onRoleChange={r   => setFilters(f => ({ ...f, role: r }))}
          onViewModeChange={setViewMode}
          onPublish={handlePublish}
          onCopyPreviousWeek={handleCopyPreviousWeek}
        />

        {/* ── Weekly view ─────────────────────────────────────────────────── */}
        {viewMode === 'weekly' && (
          <>
            <ValidationPanel
              violations={violations}
              onSelectEmployee={empId => {
                const emp = MOCK_EMPLOYMENTS.find(e => e.id === empId)
                if (emp) {
                  const v = violations.find(v => v.employment_id === empId)
                  const s = v?.shift_id ? shifts.find(sh => sh.id === v.shift_id) : null
                  setSelectedEmployment(emp)
                  setSelectedDate(s?.date ?? null)
                  setSelectedShift(s ?? null)
                  setDrawerOpen(true)
                }
              }}
            />
            <PlanningGrid
              weekDays={weekDays}
              weekRange={weekRange}
              employments={filteredEmployments}
              shifts={weekShifts}
              allShifts={shifts}
              violations={violations}
              absences={absences}
              planningStatus={planningStatus}
              standardWeeks={standardWeeks}
              onApplyStandardWeek={handleApplyStandardWeek}
              onCellClick={handleCellClick}
              onAbsenceClick={handleAbsenceClick}
            />
          </>
        )}

        {/* ── Gantt view ──────────────────────────────────────────────────── */}
        {viewMode === 'gantt' && (
          <>
            <ValidationPanel
              violations={violations}
              onSelectEmployee={empId => {
                const emp = MOCK_EMPLOYMENTS.find(e => e.id === empId)
                if (emp) {
                  const v = violations.find(v => v.employment_id === empId)
                  const s = v?.shift_id ? shifts.find(sh => sh.id === v.shift_id) : null
                  setSelectedEmployment(emp)
                  setSelectedDate(s?.date ?? null)
                  setSelectedShift(s ?? null)
                  setDrawerOpen(true)
                }
              }}
            />
            <GanttPlanningView
            weekRange={weekRange}
            weekDays={weekDays}
            planningStatus={planningStatus}
            employments={MOCK_EMPLOYMENTS}
            shifts={weekShifts}
            allShifts={shifts}
            violations={violations}
            absences={absences}
            employeeCosts={MOCK_EMPLOYEE_COSTS}
            revenueDailyMap={REVENUE_MAP}
            filters={filters}
            onShiftClick={(shift, emp) => {
              setSelectedEmployment(emp)
              setSelectedDate(shift.date)
              setSelectedShift(shift)
              setDrawerOpen(true)
            }}
            onShiftUpdate={handleGanttShiftUpdate}
            onEmptyCellClick={handleGanttEmptyClick}
            standardWeeks={standardWeeks}
            onApplyStandardDay={handleGanttApplyStandardDay}
            onAbsenceClick={handleAbsenceClick}
            onShiftDraw={handleGanttShiftDraw}
          />
          </>
        )}
      </div>

      {/* DnD overlay (weekly view) */}
      <DragOverlay>
        {activeShift && (
          <div className="bg-shift-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md shadow-floating opacity-90 cursor-grabbing">
            {activeShift.start_time}–{activeShift.end_time}
          </div>
        )}
      </DragOverlay>

      {/* Quick-add popover */}
      {popover && (
        <QuickAddPopover
          employment={popover.employment}
          date={popover.date}
          cellRect={popover.cellRect}
          onPreset={handleQuickAdd}
          onAbsence={handleQuickAbsence}
          onCustomize={handleCustomize}
          onClose={() => setPopover(null)}
        />
      )}

      {/* Shift drawer */}
      <ShiftDrawer
        employment={selectedEmployment}
        date={selectedDate}
        shift={selectedShift}
        violations={drawerViolations}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveShift}
        onDelete={handleDeleteShift}
      />

      {/* Absence drawer */}
      <AbsenceDrawer
        absence={selectedAbsence}
        employment={absenceEmployment}
        isOpen={absenceDrawerOpen}
        onClose={() => setAbsenceDrawerOpen(false)}
        onSave={handleAbsenceSave}
        onDelete={handleAbsenceDelete}
      />
    </DndContext>
  )
}
