import { Moon, AlertCircle, AlertTriangle, GripVertical } from 'lucide-react'
import type { Shift, ValidationViolation } from '../../types'
import { shiftToStyle, shiftToGridMinutes, ROW_HEIGHT_PX } from './useGanttLayout'

export type DragMode = 'move' | 'resize-start' | 'resize-end'

// ─── Role colour palette ───────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string; handle: string }> = {
  Sala:          { bg: '#e0e7ff', border: '#818cf8', text: '#3730a3', handle: '#a5b4fc' },
  Cocina:        { bg: '#fef3c7', border: '#fbbf24', text: '#78350f', handle: '#fcd34d' },
  Mantenimiento: { bg: '#f1f5f9', border: '#94a3b8', text: '#334155', handle: '#cbd5e1' },
  Limpieza:      { bg: '#ccfbf1', border: '#34d399', text: '#065f46', handle: '#6ee7b7' },
}

function getRoleStyle(role: string) {
  return ROLE_COLORS[role] ?? ROLE_COLORS['Sala']
}

const BLOCK_VERTICAL_PADDING = 5

interface GanttShiftBlockProps {
  shift: Shift
  violations: ValidationViolation[]
  isDragging: boolean
  dragMode: DragMode
  dragOffsetMin: number
  isLocked: boolean
  onClick: (shift: Shift) => void
  onMouseDown: (e: React.MouseEvent, shift: Shift, mode: DragMode) => void
}

function minToTimeDisplay(totalMin: number): string {
  const h = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60)
  const m = ((totalMin % 1440) + 1440) % 1440 % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function isOvernightShift(shift: Shift): boolean {
  const [sh] = shift.start_time.split(':').map(Number)
  const [eh] = shift.end_time.split(':').map(Number)
  return eh < sh
}

export function GanttShiftBlock({
  shift,
  violations,
  isDragging,
  dragMode,
  dragOffsetMin,
  isLocked,
  onClick,
  onMouseDown,
}: GanttShiftBlockProps) {
  // When dragging, apply the offset to the correct edge(s)
  const displayShift: Shift = isDragging
    ? (() => {
        const { startMin, endMin } = shiftToGridMinutes(shift)
        const newStart = dragMode === 'resize-end'   ? startMin : startMin + dragOffsetMin
        const newEnd   = dragMode === 'resize-start' ? endMin   : endMin   + dragOffsetMin
        return {
          ...shift,
          start_time: minToTimeDisplay(newStart),
          end_time:   minToTimeDisplay(newEnd),
        }
      })()
    : shift

  const style = shiftToStyle(displayShift)
  if (!style) return null

  const roleStyle  = getRoleStyle(shift.role)
  const hasError   = violations.some(v => v.severity === 'error')
  const hasWarning = violations.some(v => v.severity === 'warning')
  const overnight  = isOvernightShift(shift)

  const blockHeight = ROW_HEIGHT_PX - BLOCK_VERTICAL_PADDING * 2

  const bg     = hasError ? '#fee2e2' : hasWarning ? '#fef3c7' : roleStyle.bg
  const border = hasError ? '#fca5a5' : hasWarning ? '#fcd34d' : roleStyle.border
  const color  = hasError ? '#991b1b' : hasWarning ? '#92400e' : roleStyle.text
  const handle = hasError ? '#fca5a5' : hasWarning ? '#fcd34d' : roleStyle.handle

  const blockCursor = isDragging
    ? 'cursor-grabbing'
    : isLocked
      ? 'cursor-not-allowed'
      : 'cursor-grab'

  return (
    <div
      data-shift-block=""
      className={`absolute select-none rounded-md border group/block transition-shadow ${
        isDragging
          ? `${blockCursor} shadow-floating z-30 opacity-90 scale-[1.02]`
          : isLocked
            ? `${blockCursor} opacity-60 z-10`
            : `${blockCursor} hover:shadow-raised z-10 hover:z-20`
      }`}
      style={{
        left:            style.left,
        width:           style.width,
        top:             BLOCK_VERTICAL_PADDING,
        height:          blockHeight,
        backgroundColor: bg,
        borderColor:     border,
        color,
        minWidth: 24,
        overflow: 'hidden',
        transition: isDragging ? 'none' : 'box-shadow 0.1s ease, transform 0.1s ease',
      }}
      title={isLocked ? `${shift.start_time}–${shift.end_time}` : 'Arrastra para mover · Click para editar'}
      onClick={(e) => {
        e.stopPropagation()
        if (!isDragging) onClick(shift)
      }}
      onMouseDown={(e) => {
        if (!isLocked) onMouseDown(e, shift, 'move')
      }}
    >
      {/* ── Left resize handle — changes start time ─────────────────────────── */}
      {!isLocked && (
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-3.5 opacity-0 group-hover/block:opacity-100 transition-opacity z-10"
          style={{
            backgroundColor: `${handle}90`,
            borderRight: `1px solid ${handle}`,
            cursor: 'ew-resize',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => {
            e.stopPropagation()
            onMouseDown(e, shift, 'resize-start')
          }}
        >
          <GripVertical className="w-2 h-2 flex-shrink-0" style={{ color }} />
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 h-full overflow-hidden"
        style={{ paddingLeft: isLocked ? 6 : 20, paddingRight: isLocked ? 6 : 20 }}
      >
        <span className="text-2xs font-semibold tabular-nums leading-none whitespace-nowrap" style={{ color }}>
          {displayShift.start_time}
          <span className="opacity-50 mx-0.5">–</span>
          {displayShift.end_time}
        </span>

        <span className="text-2xs opacity-50 tabular-nums whitespace-nowrap leading-none hidden group-hover/block:block">
          {shift.duration_hours}h
        </span>

        <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
          {overnight   && <Moon          className="w-2.5 h-2.5 opacity-60" />}
          {hasError    && <AlertCircle   className="w-2.5 h-2.5" style={{ color: '#dc2626' }} />}
          {hasWarning  && !hasError && <AlertTriangle className="w-2.5 h-2.5" style={{ color: '#d97706' }} />}
        </div>
      </div>

      {/* ── Right resize handle — changes end time ──────────────────────────── */}
      {!isLocked && (
        <div
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-3.5 opacity-0 group-hover/block:opacity-100 transition-opacity z-10"
          style={{
            backgroundColor: `${handle}90`,
            borderLeft: `1px solid ${handle}`,
            cursor: 'ew-resize',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => {
            e.stopPropagation()
            onMouseDown(e, shift, 'resize-end')
          }}
        >
          <GripVertical className="w-2 h-2 flex-shrink-0" style={{ color }} />
        </div>
      )}
    </div>
  )
}
