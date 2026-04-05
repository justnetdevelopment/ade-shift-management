import type { Employment, Shift, ValidationViolation, Absence, StandardWeekShift } from '../../types'
import { GanttShiftBlock, type DragMode } from './GanttShiftBlock'
import { buildTimeSlots, EMP_COL_PX, TOTAL_COL_PX, ROW_HEIGHT_PX, GRID_START_MIN, GRID_END_MIN, TOTAL_MIN, minToTime } from './useGanttLayout'
import { BriefcaseMedical, CalendarClock, GripVertical, Palmtree, UserX } from 'lucide-react'

interface GanttEmployeeRowProps {
  employment: Employment
  date: string           // 'YYYY-MM-DD' — the selected day
  shifts: Shift[]        // this employee's shifts on that day
  violations: ValidationViolation[]
  absence: Absence | null
  isEven: boolean
  isLocked: boolean
  isDraggedRow: boolean
  isDropTarget: boolean
  dragShiftId: string | null
  dragMode: DragMode
  dragOffsetMin: number
  standardDayTemplate: StandardWeekShift[]
  drawPreview: { startMin: number; currentMin: number } | null
  onShiftClick: (shift: Shift) => void
  onShiftMouseDown: (e: React.MouseEvent, shift: Shift, mode: DragMode) => void
  onEmptyClick: (employment: Employment, date: string, timeHint: string, rect: DOMRect) => void
  onDrawStart: (e: React.MouseEvent, employment: Employment, date: string, rawMin: number) => void
  onApplyStandardDay: () => void
  onRowDragStart: (e: React.MouseEvent, empId: string) => void
  onAbsenceClick: (absence: Absence, employment: Employment) => void
}

const slots = buildTimeSlots()

const ABSENCE_ICONS = {
  vacation:    Palmtree,
  sick_leave:  BriefcaseMedical,
  personal:    UserX,
  justified:   UserX,
  unjustified: UserX,
}

const ABSENCE_COLORS = {
  vacation:    { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  sick_leave:  { bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
  personal:    { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  justified:   { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  unjustified: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
}


export function GanttEmployeeRow({
  employment,
  date,
  shifts,
  violations,
  absence,
  isEven,
  isLocked,
  isDraggedRow,
  isDropTarget,
  dragShiftId,
  dragMode,
  dragOffsetMin,
  standardDayTemplate,
  drawPreview,
  onShiftClick,
  onShiftMouseDown,
  onEmptyClick,
  onDrawStart,
  onApplyStandardDay,
  onRowDragStart,
  onAbsenceClick,
}: GanttEmployeeRowProps) {
  const hasViolation = violations.some(v => v.severity === 'error')

  const absenceStyle = absence ? ABSENCE_COLORS[absence.type] ?? ABSENCE_COLORS.personal : null
  const AbsenceIcon  = absence ? (ABSENCE_ICONS[absence.type] ?? UserX) : null

  const rowBg = hasViolation
    ? 'bg-red-50/40'
    : isEven ? 'bg-white' : 'bg-neutral-50/70'

  return (
    <div
      className={`flex border-b border-neutral-100 group relative ${rowBg} ${
        isDraggedRow ? 'opacity-30' : ''
      } ${isDropTarget ? 'border-t-2 border-t-shift-400' : ''}`}
      style={{ height: ROW_HEIGHT_PX }}
    >
      {/* ── Employee info column — sticky left ─────────────────────────────── */}
      <div
        className={`flex-shrink-0 sticky left-0 z-10 flex items-center gap-2 px-2 border-r border-neutral-100 bg-inherit transition-colors ${
          !isLocked && shifts.length === 0 ? 'cursor-pointer hover:bg-shift-50/60' : ''
        }`}
        style={{ width: EMP_COL_PX }}
        title={!isLocked && shifts.length === 0 ? 'Click para añadir turno' : undefined}
        onClick={!isLocked && shifts.length === 0 ? (e) => {
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          const popoverRect = new DOMRect(rect.right + 4, rect.top, 240, rect.height)
          onEmptyClick(employment, date, '09:00', popoverRect)
        } : undefined}
      >
        {/* Row drag handle */}
        {!isLocked && (
          <GripVertical
            className="w-3 h-3 flex-shrink-0 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
              e.stopPropagation()
              onRowDragStart(e as unknown as React.MouseEvent, employment.id)
            }}
          />
        )}

        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
          style={{ backgroundColor: employment.person.avatar_color }}
        >
          {employment.person.avatar_initials}
        </div>

        {/* Name + role */}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-900 truncate leading-tight">
            {employment.person.legal_name.split(' ').slice(0, 2).join(' ')}
          </p>
          <p className="text-2xs text-neutral-400 truncate leading-tight">
            {employment.role}
          </p>
        </div>

        {/* Standard day button — visible on row hover */}
        {!isLocked && standardDayTemplate.length > 0 && (
          <button
            type="button"
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-5 h-5 rounded hover:bg-shift-100 text-neutral-400 hover:text-shift-600"
            title="Aplicar horario tipo del día"
            onClick={(e) => {
              e.stopPropagation()
              onApplyStandardDay()
            }}
          >
            <CalendarClock className="w-3 h-3" />
          </button>
        )}

        {/* Absence badge — clickable to edit */}
        {absence && absenceStyle && AbsenceIcon && (
          <button
            type="button"
            className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded transition-opacity hover:opacity-80"
            style={{ backgroundColor: absenceStyle.bg, color: absenceStyle.text }}
            title={`${absence.label} — clic para editar`}
            onClick={(e) => {
              e.stopPropagation()
              onAbsenceClick(absence, employment)
            }}
          >
            <AbsenceIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* ── Shifts area ─────────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 cursor-crosshair"
        onMouseDown={(e) => {
          if (e.button !== 0) return
          if (isLocked) return
          if ((e.target as HTMLElement).closest('[data-shift-block]')) return
          if (absence) {
            onAbsenceClick(absence, employment)
            return
          }
          const slotRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
          const offsetX  = e.clientX - slotRect.left
          const rawMin   = GRID_START_MIN + (offsetX / slotRect.width) * TOTAL_MIN
          onDrawStart(e, employment, date, rawMin)
        }}
      >
        {/* Background slot lines — flex overlay so they scale with the container.
            Each slot's border-r falls at the slot's RIGHT edge:
            • isHour slot  (starts :00) → right edge = :30 → dashed half-hour line
            • !isHour slot (starts :30) → right edge = :00 → solid hour line        */}
        <div className="absolute inset-0 flex pointer-events-none">
          {slots.map((slot) => (
            <div
              key={slot.index}
              className="flex-1 h-full border-r"
              style={{
                borderColor: slot.isHour ? '#e5e7eb' : '#d1d5db',
                borderStyle:  slot.isHour ? 'dashed'  : 'solid',
              }}
            />
          ))}
        </div>

        {/* Absence overlay */}
        {absence && absenceStyle && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.45,
              background: `repeating-linear-gradient(
                45deg,
                ${absenceStyle.bg},
                ${absenceStyle.bg} 8px,
                white 8px,
                white 16px
              )`,
            }}
          />
        )}

        {/* Draw-to-create ghost block */}
        {drawPreview && (() => {
          const pStart = Math.max(GRID_START_MIN, Math.min(drawPreview.startMin, drawPreview.currentMin))
          const pEnd   = Math.min(GRID_END_MIN,   Math.max(drawPreview.startMin, drawPreview.currentMin))
          if (pEnd <= pStart) return null
          const leftPct  = ((pStart - GRID_START_MIN) / TOTAL_MIN) * 100
          const widthPct = ((pEnd - pStart) / TOTAL_MIN) * 100
          const duration = Math.round((pEnd - pStart) / 60 * 10) / 10
          return (
            <div
              className="absolute top-0.5 bottom-0.5 rounded-md border-2 border-shift-500 border-dashed bg-shift-200/40 z-30 pointer-events-none flex items-center justify-center overflow-hidden gap-1 px-1.5"
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            >
              <span className="text-2xs font-bold text-shift-700 whitespace-nowrap tabular-nums">
                {minToTime(pStart)}–{minToTime(pEnd)}
              </span>
              <span className="text-2xs text-shift-500 whitespace-nowrap tabular-nums">
                {duration}h
              </span>
            </div>
          )
        })()}

        {/* Shift blocks */}
        {shifts.map((shift) => (
          <div key={shift.id} data-shift-block="">
            <GanttShiftBlock
              shift={shift}
              violations={violations.filter(v => v.shift_id === shift.id)}
              isDragging={dragShiftId === shift.id}
              dragMode={dragShiftId === shift.id ? dragMode : 'move'}
              dragOffsetMin={dragShiftId === shift.id ? dragOffsetMin : 0}
              isLocked={isLocked}
              onClick={onShiftClick}
              onMouseDown={onShiftMouseDown}
            />
          </div>
        ))}
      </div>

      {/* ── Row total column — sticky right ─────────────────────────────────── */}
      <div
        className="flex-shrink-0 sticky right-0 z-10 flex flex-col items-center justify-center bg-inherit border-l border-neutral-200 px-1.5"
        style={{ width: TOTAL_COL_PX }}
      >
        {shifts.length > 0 ? (
          <span className="text-xs font-bold tabular-nums leading-none text-neutral-700">
            {shifts.reduce((s, sh) => s + sh.duration_hours, 0)}h
          </span>
        ) : (
          <span className="text-2xs text-neutral-300">—</span>
        )}
      </div>
    </div>
  )
}
