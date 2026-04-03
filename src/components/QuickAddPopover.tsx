import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, SlidersHorizontal, Sunrise, Sun, Sunset, Moon, Palmtree, UserX, Briefcase, FileX } from 'lucide-react'
import type { Employment, AbsenceType } from '../types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const PRESETS = [
  { label: 'Mañana',  Icon: Sunrise, start: '07:00', end: '15:00' },
  { label: 'Jornada', Icon: Sun,     start: '09:00', end: '17:00' },
  { label: 'Tarde',   Icon: Sunset,  start: '15:00', end: '23:00' },
  { label: 'Noche',   Icon: Moon,    start: '22:00', end: '03:00' },
]

const ABSENCE_PRESETS: { label: string; type: AbsenceType; Icon: React.ElementType; color: string }[] = [
  { label: 'Vacaciones',     type: 'vacation',     Icon: Palmtree,  color: 'text-info-600 group-hover:text-info-700'    },
  { label: 'Asunto propio',  type: 'personal',     Icon: Briefcase, color: 'text-shift-600 group-hover:text-shift-700'  },
  { label: 'Baja médica',    type: 'sick_leave',   Icon: UserX,     color: 'text-error-600 group-hover:text-error-700'  },
  { label: 'Justificada',    type: 'justified',    Icon: FileX,     color: 'text-warning-600 group-hover:text-warning-700' },
]

interface QuickAddPopoverProps {
  employment: Employment
  date: string
  cellRect: DOMRect
  onPreset: (startTime: string, endTime: string) => void
  onAbsence: (type: AbsenceType) => void
  onCustomize: () => void
  onClose: () => void
}

const POPOVER_WIDTH = 228
const POPOVER_HEIGHT = 320

export function QuickAddPopover({
  employment,
  date,
  cellRect,
  onPreset,
  onAbsence,
  onCustomize,
  onClose,
}: QuickAddPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  // Position: below the cell by default, flip up if no room
  let top = cellRect.bottom + 6
  if (top + POPOVER_HEIGHT > window.innerHeight - 8) {
    top = cellRect.top - POPOVER_HEIGHT - 6
  }
  let left = cellRect.left + cellRect.width / 2 - POPOVER_WIDTH / 2
  left = Math.max(8, Math.min(left, window.innerWidth - POPOVER_WIDTH - 8))

  const employeeName = employment.person.legal_name.split(' ').slice(0, 2).join(' ')
  const formattedDate = format(parseISO(date), "EEE d MMM", { locale: es })

  return createPortal(
    <div
      ref={ref}
      className="fixed z-[60] bg-white rounded-xl border border-neutral-150 shadow-overlay p-2 animate-fade-in"
      style={{ top, left, width: POPOVER_WIDTH }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <div>
          <p className="text-xs font-semibold text-neutral-900 leading-tight">{employeeName}</p>
          <p className="text-2xs text-neutral-400 capitalize leading-tight">{formattedDate}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => onPreset(preset.start, preset.end)}
            className="flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-lg border border-neutral-100 hover:border-shift-300 hover:bg-shift-50 active:bg-shift-100 transition-colors text-left group"
          >
            <preset.Icon className="w-4 h-4 text-neutral-500 group-hover:text-shift-600" />
            <span className="text-xs font-semibold text-neutral-800 group-hover:text-shift-700">
              {preset.label}
            </span>
            <span className="text-2xs text-neutral-400 tabular-nums font-mono">
              {preset.start}–{preset.end}
            </span>
          </button>
        ))}
      </div>

      <div className="border-t border-neutral-100 my-1.5" />

      {/* Customize */}
      <button
        onClick={onCustomize}
        className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-shift-600 hover:bg-shift-50 rounded-lg transition-colors"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Personalizar horario
      </button>

      <div className="border-t border-neutral-100 my-1.5" />

      {/* Absence options */}
      <p className="px-2 pb-1 text-2xs font-semibold text-neutral-400 uppercase tracking-wide">Ausencia</p>
      <div className="grid grid-cols-2 gap-1">
        {ABSENCE_PRESETS.map(({ label, type, Icon, color }) => (
          <button
            key={type}
            onClick={() => onAbsence(type)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-neutral-100 active:bg-neutral-150 transition-colors text-left group"
          >
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
            <span className="text-xs text-neutral-700 group-hover:text-neutral-900 leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>,
    document.body,
  )
}
