import { useState } from 'react'
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
import { addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns'
import { format } from 'date-fns'

import { PlanningToolbar } from '../components/PlanningToolbar'
import { ValidationPanel } from '../components/ValidationPanel'
import { PlanningGrid } from '../components/PlanningGrid'
import { ShiftDrawer } from '../components/ShiftDrawer'
import { QuickAddPopover } from '../components/QuickAddPopover'

import type { Employment, Shift, ValidationViolation, WeekRange, PlanningStatus, PlanningFilters, StandardWeekShift } from '../types'
import {
  MOCK_EMPLOYMENTS,
  MOCK_SHIFTS,
  MOCK_VIOLATIONS,
} from '../mock-data'

function getWeekRange(date: Date): WeekRange {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return { start, end: addDays(start, 6) }
}

function getWeekDays(weekRange: WeekRange): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekRange.start, i))
}

// The week of the mock data: 2026-03-17
const INITIAL_WEEK = getWeekRange(new Date('2026-03-17'))

interface PlanningPageProps {
  standardWeeks: Record<string, StandardWeekShift[]>
}

export function PlanningPage({ standardWeeks }: PlanningPageProps) {
  const [weekRange, setWeekRange] = useState<WeekRange>(INITIAL_WEEK)
  const [planningStatus, setPlanningStatus] = useState<PlanningStatus>('draft')
  const [shifts, setShifts] = useState<Shift[]>(MOCK_SHIFTS)
  const [violations, setViolations] = useState<ValidationViolation[]>(MOCK_VIOLATIONS)
  const [filters, setFilters] = useState<PlanningFilters>({
    center_id: null,
    role: null,
    show_violations_only: false,
  })

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedEmployment, setSelectedEmployment] = useState<Employment | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)

  // Quick-add popover state
  const [popover, setPopover] = useState<{
    employment: Employment
    date: string
    cellRect: DOMRect
  } | null>(null)

  // DnD state
  const [activeShift, setActiveShift] = useState<Shift | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const weekDays = getWeekDays(weekRange)

  // Filter employments
  const filteredEmployments = MOCK_EMPLOYMENTS.filter(emp => {
    if (filters.center_id && emp.center_id !== filters.center_id) return false
    if (filters.role && emp.role !== filters.role) return false
    return true
  })

  // Filter shifts to current week
  const weekShifts = shifts.filter(s => {
    const shiftDate = s.date
    const weekStart = format(weekRange.start, 'yyyy-MM-dd')
    const weekEnd = format(weekRange.end, 'yyyy-MM-dd')
    return shiftDate >= weekStart && shiftDate <= weekEnd
  })

  function handleCellClick(employment: Employment, date: string, shift: Shift | null, cellRect?: DOMRect) {
    if (shift) {
      // Edit existing shift — open drawer directly
      setSelectedEmployment(employment)
      setSelectedDate(date)
      setSelectedShift(shift)
      setDrawerOpen(true)
    } else if (cellRect) {
      // New shift — show quick-add popover
      setPopover({ employment, date, cellRect })
    } else {
      // Fallback (keyboard, etc.) — open drawer
      setSelectedEmployment(employment)
      setSelectedDate(date)
      setSelectedShift(null)
      setDrawerOpen(true)
    }
  }

  function handleQuickAdd(startTime: string, endTime: string) {
    if (!popover) return
    handleSaveShift({
      employment_id: popover.employment.id,
      date: popover.date,
      start_time: startTime,
      end_time: endTime,
      center_id: popover.employment.center_id,
      role: popover.employment.role,
    })
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

  function handleSaveShift(shiftData: Omit<Shift, 'id' | 'status' | 'duration_hours'> & { id?: string }) {
    const [sh, sm] = shiftData.start_time.split(':').map(Number)
    const [eh, em] = shiftData.end_time.split(':').map(Number)
    let minutes = (eh * 60 + em) - (sh * 60 + sm)
    if (minutes < 0) minutes += 1440
    const duration_hours = Math.round(minutes / 60 * 10) / 10

    if (shiftData.id) {
      // Update existing
      setShifts(prev => prev.map(s =>
        s.id === shiftData.id
          ? { ...s, ...shiftData, duration_hours }
          : s
      ))
    } else {
      // Create new
      const newShift: Shift = {
        id: `s${Date.now()}`,
        ...shiftData,
        status: 'draft',
        duration_hours,
      }
      setShifts(prev => [...prev, newShift])
    }

    // Recompute violations (simplified — in real app this is server-side)
    recomputeViolations()
  }

  function handleDeleteShift(shiftId: string) {
    setShifts(prev => prev.filter(s => s.id !== shiftId))
    setViolations(prev => prev.filter(v => v.shift_id !== shiftId))
  }

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

    // over.id format: `${employmentId}-${date}` e.g. "e1-2026-03-17"
    const overId = over.id as string
    const dashIdx = overId.indexOf('-')
    const employmentId = overId.slice(0, dashIdx)
    const newDate = overId.slice(dashIdx + 1)

    // Don't move if same cell
    if (shift.date === newDate && shift.employment_id === employmentId) return

    setShifts(prev => prev.map(s =>
      s.id === shift.id
        ? { ...s, date: newDate, employment_id: employmentId, status: 'draft' }
        : s
    ))
    recomputeViolations()
  }

  function recomputeViolations() {
    // Simplified validation — in production this is server-side
    const newViolations: ValidationViolation[] = [...MOCK_VIOLATIONS]
    setViolations(newViolations)
  }

  function handlePublish() {
    const nextStatus: Record<PlanningStatus, PlanningStatus> = {
      draft: 'review',
      review: 'published',
      published: 'published',
      locked: 'locked',
    }
    setPlanningStatus(prev => nextStatus[prev])
  }

  function handleCopyPreviousWeek() {
    const prevWeekStart = format(subWeeks(weekRange.start, 1), 'yyyy-MM-dd')
    const prevWeekEnd = format(subWeeks(weekRange.end, 1), 'yyyy-MM-dd')
    const prevShifts = shifts.filter(s => s.date >= prevWeekStart && s.date <= prevWeekEnd)

    const copiedShifts: Shift[] = prevShifts.map(s => {
      const originalDate = new Date(s.date)
      const newDate = addWeeks(originalDate, 1)
      return {
        ...s,
        id: `s${Date.now()}-${Math.random()}`,
        date: format(newDate, 'yyyy-MM-dd'),
        status: 'draft',
      }
    })

    setShifts(prev => [...prev, ...copiedShifts])
  }

  function handleApplyStandardWeek(employmentId: string) {
    const template = standardWeeks[employmentId]
    if (!template || template.length === 0) return

    const newShifts: Shift[] = []
    for (const t of template) {
      const targetDate = format(addDays(weekRange.start, t.day_of_week), 'yyyy-MM-dd')
      // Skip days that already have shifts for this employee
      const alreadyHasShift = weekShifts.some(
        s => s.employment_id === employmentId && s.date === targetDate
      )
      if (alreadyHasShift) continue

      const [sh, sm] = t.start_time.split(':').map(Number)
      const [eh, em] = t.end_time.split(':').map(Number)
      let minutes = (eh * 60 + em) - (sh * 60 + sm)
      if (minutes < 0) minutes += 1440
      const duration_hours = Math.round(minutes / 60 * 10) / 10

      newShifts.push({
        id: `s${Date.now()}-${Math.random()}`,
        employment_id: employmentId,
        date: targetDate,
        start_time: t.start_time,
        end_time: t.end_time,
        center_id: t.center_id,
        role: t.role,
        status: 'draft',
        duration_hours,
      })
    }

    if (newShifts.length > 0) {
      setShifts(prev => [...prev, ...newShifts])
      recomputeViolations()
    }
  }

  const drawerViolations = selectedShift
    ? violations.filter(v => v.shift_id === selectedShift.id || v.employment_id === selectedEmployment?.id)
    : violations.filter(v => v.employment_id === selectedEmployment?.id)

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
          onWeekChange={setWeekRange}
          onCenterChange={c => setFilters(f => ({ ...f, center_id: c }))}
          onRoleChange={r => setFilters(f => ({ ...f, role: r }))}
          onPublish={handlePublish}
          onCopyPreviousWeek={handleCopyPreviousWeek}
        />

        {/* Validation panel */}
        <ValidationPanel
          violations={violations}
          onSelectEmployee={empId => {
            const emp = MOCK_EMPLOYMENTS.find(e => e.id === empId)
            if (emp) {
              const violation = violations.find(v => v.employment_id === empId)
              const shift = violation?.shift_id ? shifts.find(s => s.id === violation.shift_id) : null
              setSelectedEmployment(emp)
              setSelectedDate(shift?.date ?? null)
              setSelectedShift(shift ?? null)
              setDrawerOpen(true)
            }
          }}
        />

        {/* Grid */}
        <PlanningGrid
          weekDays={weekDays}
          weekRange={weekRange}
          employments={filteredEmployments}
          shifts={weekShifts}
          allShifts={shifts}
          violations={violations}
          planningStatus={planningStatus}
          standardWeeks={standardWeeks}
          onApplyStandardWeek={handleApplyStandardWeek}
          onCellClick={handleCellClick}
        />
      </div>

      {/* Drag overlay — shows dragged shift */}
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
    </DndContext>
  )
}
