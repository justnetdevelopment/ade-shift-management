import { useState } from 'react'
import type { RefObject } from 'react'
import { ArrowUpDown, Check } from 'lucide-react'
import { buildTimeSlots, EMP_COL_PX, TOTAL_COL_PX } from './useGanttLayout'

export type SortMode = 'role' | 'start-time' | 'manual'

const SORT_OPTIONS: { mode: SortMode; label: string; sub: string }[] = [
  { mode: 'role',       label: 'Departamento',  sub: 'Sala, Cocina, Mantenimiento…' },
  { mode: 'start-time', label: 'Primer turno',  sub: 'Por hora de inicio del día'  },
  { mode: 'manual',     label: 'Manual',         sub: 'Arrastra para reordenar'     },
]

interface GanttTimeHeaderProps {
  slotsRef:     RefObject<HTMLDivElement | null>
  sortMode:     SortMode
  onSortChange: (mode: SortMode) => void
}

const slots = buildTimeSlots()

export function GanttTimeHeader({ slotsRef, sortMode, onSortChange }: GanttTimeHeaderProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="flex flex-shrink-0 border-b border-neutral-200 bg-white"
      style={{ minWidth: EMP_COL_PX + TOTAL_COL_PX }}
    >
      {/* Corner — Empleado label + sort trigger */}
      <div
        className="flex-shrink-0 border-r border-neutral-200 flex items-end pb-1.5 px-3 relative"
        style={{ width: EMP_COL_PX }}
      >
        <span className="text-2xs font-semibold uppercase tracking-wide text-neutral-400 flex-1">
          Empleado
        </span>

        {/* Sort icon button */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`flex items-center justify-center w-5 h-5 rounded transition-colors ${
            open
              ? 'bg-shift-100 text-shift-600'
              : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600'
          }`}
          title="Ordenar empleados"
        >
          <ArrowUpDown className="w-3 h-3" />
        </button>

        {/* Popover */}
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <div className="absolute top-full left-0 z-30 mt-1 w-52 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 overflow-hidden">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => { onSortChange(opt.mode); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
                    sortMode === opt.mode
                      ? 'bg-shift-50 text-shift-700'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-tight ${sortMode === opt.mode ? 'font-semibold' : 'font-medium'}`}>
                      {opt.label}
                    </p>
                    <p className="text-2xs text-neutral-400 leading-tight mt-0.5">{opt.sub}</p>
                  </div>
                  {sortMode === opt.mode && (
                    <Check className="w-3.5 h-3.5 text-shift-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Slots — fills all remaining space */}
      <div
        ref={slotsRef as React.RefObject<HTMLDivElement>}
        className="flex-1 overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <div className="flex h-9 w-full">
          {slots.map((slot) => (
            <div
              key={slot.index}
              className="flex-1 relative flex items-end border-r border-neutral-100"
            >
              {slot.isHour && (
                <span className="absolute bottom-1 left-1 text-2xs font-semibold text-neutral-500 whitespace-nowrap">
                  {slot.label}
                </span>
              )}
              {slot.isHour && (
                <div className="absolute bottom-0 left-0 w-px h-2.5 bg-neutral-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Total col */}
      <div
        className="flex-shrink-0 border-l border-neutral-200 flex items-end pb-1.5 px-2"
        style={{ width: TOTAL_COL_PX }}
      >
        <span className="text-2xs font-semibold uppercase tracking-wide text-neutral-400">
          Total
        </span>
      </div>
    </div>
  )
}
