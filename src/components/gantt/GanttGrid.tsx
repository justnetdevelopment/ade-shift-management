import { useRef, useState, useCallback, useEffect } from 'react'
import type { Employment, Shift, ValidationViolation, Absence, StandardWeekShift } from '../../types'
import { GanttEmployeeRow } from './GanttEmployeeRow'
import type { DragMode } from './GanttShiftBlock'
import { GanttTimeHeader, type SortMode } from './GanttTimeHeader'
import { GanttCoverageFooter } from './GanttCoverageFooter'
import {
  computeCoverage,
  applyDragDelta,
  applyResizeDelta,
  shiftToGridMinutes,
  TOTAL_SLOTS_PX,
  TOTAL_MIN,
  INTERVAL_MIN,
  EMP_COL_PX,
  TOTAL_COL_PX,
  ROW_HEIGHT_PX,
} from './useGanttLayout'

interface GanttGridProps {
  date: string                        // selected day 'YYYY-MM-DD'
  employments: Employment[]
  shifts: Shift[]                     // all shifts for this day (all employees)
  violations: ValidationViolation[]
  absences: Absence[]
  isLocked: boolean
  standardWeeks: Record<string, StandardWeekShift[]>
  onShiftClick: (shift: Shift, employment: Employment) => void
  sortMode:     SortMode
  onSortChange: (mode: SortMode) => void
  onShiftUpdate: (shiftId: string, newStartTime: string, newEndTime: string) => void
  onEmptyCellClick: (employment: Employment, date: string, timeHint: string, rect: DOMRect) => void
  onApplyStandardDay: (employmentId: string, date: string) => void
  onReorder: (newIds: string[]) => void
}

interface DragState {
  shiftId:          string
  employmentId:     string
  startClientX:     number
  originalStartMin: number
  originalEndMin:   number
  mode:             DragMode
}

export function GanttGrid({
  date,
  employments,
  shifts,
  violations,
  absences,
  isLocked,
  standardWeeks,
  onShiftClick,
  onShiftUpdate,
  sortMode,
  onSortChange,
  onEmptyCellClick,
  onApplyStandardDay,
  onReorder,
}: GanttGridProps) {
  const scrollRef     = useRef<HTMLDivElement>(null)
  const headerSlotsRef = useRef<HTMLDivElement>(null)
  const footerSlotsRef = useRef<HTMLDivElement>(null)

  const [dragState,    setDragState]    = useState<DragState | null>(null)
  const [dragOffsetMin, setDragOffsetMin] = useState(0)
  const didDragRef = useRef(false)

  // ── Row reorder drag ─────────────────────────────────────────────────────────
  const [rowDragEmpId,  setRowDragEmpId]  = useState<string | null>(null)
  const [rowDropIndex,  setRowDropIndex]  = useState<number | null>(null)

  // ── Sync horizontal scroll across header, rows, and footer ─────────────────
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const sl = scrollRef.current.scrollLeft
    if (headerSlotsRef.current) headerSlotsRef.current.scrollLeft = sl
    if (footerSlotsRef.current) footerSlotsRef.current.scrollLeft = sl
  }, [])

  // ── Drag: global mouse move / up ────────────────────────────────────────────
  useEffect(() => {
    if (!dragState) return

    function onMouseMove(e: MouseEvent) {
      const deltaX    = e.clientX - dragState!.startClientX
      const slotsWidth = scrollRef.current
        ? scrollRef.current.clientWidth - EMP_COL_PX - TOTAL_COL_PX
        : TOTAL_SLOTS_PX
      const rawDelta  = (deltaX / slotsWidth) * TOTAL_MIN
      const snapped   = Math.round(rawDelta / INTERVAL_MIN) * INTERVAL_MIN
      setDragOffsetMin(snapped)
    }

    function onMouseUp() {
      if (!dragState) return
      if (dragOffsetMin !== 0) {
        didDragRef.current = true
        const shift = [...shifts].find(s => s.id === dragState.shiftId)
        if (shift) {
          const { start_time, end_time } =
            dragState.mode === 'resize-start' ? applyResizeDelta(shift, dragOffsetMin, 'start') :
            dragState.mode === 'resize-end'   ? applyResizeDelta(shift, dragOffsetMin, 'end')   :
            applyDragDelta(shift, dragOffsetMin)
          onShiftUpdate(dragState.shiftId, start_time, end_time)
        }
      }
      setDragState(null)
      setDragOffsetMin(0)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }
  }, [dragState, dragOffsetMin, shifts, onShiftUpdate])

  useEffect(() => {
    if (!rowDragEmpId) return

    function onMouseMove(e: MouseEvent) {
      if (!scrollRef.current) return
      const rect = scrollRef.current.getBoundingClientRect()
      const relY  = e.clientY - rect.top + scrollRef.current.scrollTop
      const idx   = Math.floor(relY / ROW_HEIGHT_PX)
      setRowDropIndex(Math.max(0, Math.min(employments.length - 1, idx)))
    }

    function onMouseUp() {
      const fromIdx = employments.findIndex(e => e.id === rowDragEmpId)
      if (rowDropIndex !== null && fromIdx !== -1 && fromIdx !== rowDropIndex) {
        const newIds = employments.map(e => e.id)
        newIds.splice(fromIdx, 1)
        newIds.splice(rowDropIndex, 0, rowDragEmpId!)
        onReorder(newIds)
      }
      setRowDragEmpId(null)
      setRowDropIndex(null)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }
  }, [rowDragEmpId, rowDropIndex, employments, onReorder])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function handleRowDragStart(e: React.MouseEvent, empId: string) {
    e.preventDefault()
    setRowDragEmpId(empId)
    setRowDropIndex(employments.findIndex(emp => emp.id === empId))
  }

  function handleShiftMouseDown(e: React.MouseEvent, shift: Shift, mode: DragMode) {
    if (isLocked) return
    e.preventDefault()
    e.stopPropagation()
    const { startMin, endMin } = shiftToGridMinutes(shift)
    setDragState({
      shiftId:          shift.id,
      employmentId:     shift.employment_id,
      startClientX:     e.clientX,
      originalStartMin: startMin,
      originalEndMin:   endMin,
      mode,
    })
    setDragOffsetMin(0)
  }

  function handleShiftClick(shift: Shift) {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    const emp = employments.find(e => e.id === shift.employment_id)
    if (emp) onShiftClick(shift, emp)
  }

  function handleEmptyClick(
    employment: Employment,
    clickDate: string,
    timeHint: string,
    rect: DOMRect,
  ) {
    onEmptyCellClick(employment, clickDate, timeHint, rect)
  }

  // ── Derived data ─────────────────────────────────────────────────────────────

  // day_of_week: 0 = Monday … 6 = Sunday (matches StandardWeekShift convention)
  const dayOfWeek = ((new Date(date + 'T12:00').getDay() + 6) % 7) as 0|1|2|3|4|5|6

  function absenceFor(empId: string): Absence | null {
    return absences.find(a =>
      a.employment_id === empId &&
      a.status === 'approved' &&
      a.start_date <= date &&
      a.end_date   >= date
    ) ?? null
  }

  // Coverage uses only shifts for the selected day
  const coverage = computeCoverage(shifts)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Time header — synced with scroll ───────────────────────────────── */}
      <GanttTimeHeader slotsRef={headerSlotsRef} sortMode={sortMode} onSortChange={onSortChange} />

      {/* ── Employee rows — primary scroll container ────────────────────────── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto"
        style={{ cursor: dragState || rowDragEmpId ? 'grabbing' : undefined }}
      >
        <div className="w-full">
          {employments.map((emp, index) => {
            const empShifts          = shifts.filter(s => s.employment_id === emp.id)
            const empViolations      = violations.filter(v => v.employment_id === emp.id)
            const absence            = absenceFor(emp.id)
            const standardDayTemplate = (standardWeeks[emp.id] ?? []).filter(t => t.day_of_week === dayOfWeek)

            return (
              <GanttEmployeeRow
                key={emp.id}
                employment={emp}
                isEven={index % 2 === 0}
                isDraggedRow={rowDragEmpId === emp.id}
                isDropTarget={rowDropIndex === index && rowDragEmpId !== emp.id}
                date={date}
                shifts={empShifts}
                violations={empViolations}
                absence={absence}
                isLocked={isLocked}
                dragShiftId={dragState?.shiftId ?? null}
                dragMode={dragState?.mode ?? 'move'}
                dragOffsetMin={dragOffsetMin}
                standardDayTemplate={standardDayTemplate}
                onShiftClick={handleShiftClick}
                onShiftMouseDown={handleShiftMouseDown}
                onEmptyClick={handleEmptyClick}
                onApplyStandardDay={() => onApplyStandardDay(emp.id, date)}
                onRowDragStart={handleRowDragStart}
              />
            )
          })}
        </div>
      </div>

      {/* ── Coverage footer — synced with scroll ────────────────────────────── */}
      <GanttCoverageFooter
        slots={coverage}
        maxExpected={Math.max(6, Math.round(employments.length * 0.4))}
        slotsRef={footerSlotsRef}
      />
    </div>
  )
}
