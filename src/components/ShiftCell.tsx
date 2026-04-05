import { useDraggable, useDroppable } from '@dnd-kit/core'
import { AlertCircle, AlertTriangle, Info, Plus, Moon } from 'lucide-react'
import type { Shift, ValidationViolation, Absence } from '../types'

const ABSENCE_STRIPE_COLORS: Record<string, string> = {
  vacation:    '#dbeafe',
  sick_leave:  '#fce7f3',
  personal:    '#d1fae5',
  justified:   '#fef3c7',
  unjustified: '#fee2e2',
}

interface ShiftCellProps {
  employmentId: string
  date: string
  shifts: Shift[]
  violations: ValidationViolation[]
  absence: Absence | null
  isHoliday: boolean
  isLocked: boolean
  onClick: (shift: Shift | null, cellRect?: DOMRect) => void
  onAbsenceClick: (absence: Absence) => void
}

type CellState = 'empty' | 'filled' | 'error' | 'warning' | 'info' | 'locked'

function getCellState(
  shifts: Shift[],
  violations: ValidationViolation[],
  isHoliday: boolean,
  isLocked: boolean,
): CellState {
  if (isLocked) return 'locked'
  if (shifts.length === 0) return 'empty'
  const hasError = violations.some(v => v.severity === 'error')
  const hasWarning = violations.some(v => v.severity === 'warning')
  const hasInfo = violations.some(v => v.severity === 'info')
  if (hasError) return 'error'
  if (hasWarning) return 'warning'
  if (hasInfo || isHoliday) return 'info'
  return 'filled'
}

const CELL_STATE_CLASSES: Record<CellState, string> = {
  empty:   'bg-neutral-50 border-neutral-150 hover:bg-neutral-100 hover:border-neutral-200 cursor-pointer',
  filled:  'bg-shift-50/60 border-shift-200',
  error:   'bg-error-50/60 border-error-300 ring-1 ring-error-300',
  warning: 'bg-warning-50/60 border-warning-300 ring-1 ring-warning-300',
  info:    'bg-info-50/60 border-info-300 ring-1 ring-info-200',
  locked:  'bg-neutral-100 border-neutral-200 cursor-not-allowed opacity-60',
}

const SEVERITY_ICONS = {
  error:   <AlertCircle className="w-3 h-3 text-error-600 flex-shrink-0" />,
  warning: <AlertTriangle className="w-3 h-3 text-warning-600 flex-shrink-0" />,
  info:    <Info className="w-3 h-3 text-info-600 flex-shrink-0" />,
}

function isOvernightShift(shift: Shift): boolean {
  return shift.end_time < shift.start_time
}

function getPillClasses(violations: ValidationViolation[]): string {
  if (violations.some(v => v.severity === 'error'))   return 'bg-error-100 border-error-300 text-error-800 hover:bg-error-200'
  if (violations.some(v => v.severity === 'warning')) return 'bg-warning-100 border-warning-300 text-warning-800 hover:bg-warning-200'
  return 'bg-shift-100 border-shift-300 text-shift-800 hover:bg-shift-200'
}

// ─── Draggable pill for a single shift ───────────────────────────────────────

interface ShiftPillProps {
  shift: Shift
  violations: ValidationViolation[]
  employmentId: string
  date: string
  isLocked: boolean
  onClick: (shift: Shift) => void
}

function ShiftPill({ shift, violations, employmentId, date, isLocked, onClick }: ShiftPillProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: shift.id,
    disabled: isLocked,
    data: { shift, employmentId, date },
  })

  const topViolation = violations[0]

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={e => { e.stopPropagation(); if (!isLocked) onClick(shift) }}
      className={`
        flex items-center justify-between gap-1 px-1.5 py-1 rounded border
        cursor-pointer select-none transition-all duration-100
        ${getPillClasses(violations)}
        ${isDragging ? 'opacity-40 scale-95' : ''}
      `}
    >
      <div className="flex flex-col gap-0 min-w-0">
        <span className="font-semibold tabular-nums text-xs leading-tight">
          {shift.start_time}–{shift.end_time}
        </span>
        <span className="text-2xs opacity-70 tabular-nums leading-tight">
          {shift.duration_hours}h
        </span>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {isOvernightShift(shift) && <Moon className="w-3 h-3 opacity-60" />}
        {topViolation && SEVERITY_ICONS[topViolation.severity]}
      </div>
    </div>
  )
}

// ─── Cell ─────────────────────────────────────────────────────────────────────

export function ShiftCell({
  employmentId,
  date,
  shifts,
  violations,
  absence,
  isHoliday,
  isLocked,
  onClick,
  onAbsenceClick,
}: ShiftCellProps) {
  const cellId = `${employmentId}-${date}`
  const state = getCellState(shifts, violations, isHoliday, isLocked)
  const isEmpty = shifts.length === 0

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: cellId, disabled: isLocked })

  function handleCellClick(e: React.MouseEvent<HTMLDivElement>) {
    if (absence) { onAbsenceClick(absence); return }
    if (!isLocked && isEmpty) onClick(null, e.currentTarget.getBoundingClientRect())
  }

  const stripeColor = absence ? (ABSENCE_STRIPE_COLORS[absence.type] ?? '#f3f4f6') : null

  return (
    <div
      ref={setDropRef}
      onClick={handleCellClick}
      className={`
        relative min-h-[72px] rounded-md border transition-all duration-100
        ${CELL_STATE_CLASSES[state]}
        ${isOver && !isLocked ? 'ring-2 ring-shift-500 ring-offset-1' : ''}
      `}
      role={isEmpty || absence ? 'button' : undefined}
      tabIndex={isEmpty && !isLocked ? 0 : undefined}
      onKeyDown={isEmpty && !isLocked ? e => { if (e.key === 'Enter' || e.key === ' ') onClick(null, (e.currentTarget as HTMLElement).getBoundingClientRect()) } : undefined}
      aria-label={absence ? absence.label : isEmpty ? 'Sin turno asignado' : `${shifts.length} turno(s)`}
    >
      {/* Absence stripe overlay */}
      {stripeColor && (
        <div
          className="absolute inset-0 rounded-md pointer-events-none z-0"
          style={{
            opacity: 0.55,
            background: `repeating-linear-gradient(45deg, ${stripeColor}, ${stripeColor} 6px, white 6px, white 12px)`,
          }}
        />
      )}
      {isEmpty ? (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[72px] gap-0.5">
          {absence
            ? <span className="text-2xs font-medium text-neutral-500 text-center px-1 leading-tight">{absence.label}</span>
            : <Plus className="w-4 h-4 text-neutral-300" />
          }
        </div>
      ) : (
        <div className="p-1.5 flex flex-col gap-1">
          {shifts.map(shift => (
            <ShiftPill
              key={shift.id}
              shift={shift}
              violations={violations.filter(v => v.shift_id === shift.id)}
              employmentId={employmentId}
              date={date}
              isLocked={isLocked}
              onClick={onClick}
            />
          ))}
          {!isLocked && (
            <button
              onClick={e => { e.stopPropagation(); onClick(null, e.currentTarget.getBoundingClientRect()) }}
              className="flex items-center justify-center w-full py-0.5 rounded border border-dashed border-neutral-300 text-neutral-400 hover:border-shift-400 hover:text-shift-600 hover:bg-shift-50 transition-colors"
              aria-label="Añadir turno"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
