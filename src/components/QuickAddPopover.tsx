import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, SlidersHorizontal, Sunrise, Sun, Sunset, Moon } from 'lucide-react'
import type { Employment } from '../types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

const PRESETS = [
  { label: 'Mañana',  Icon: Sunrise, start: '07:00', end: '15:00' },
  { label: 'Jornada', Icon: Sun,     start: '09:00', end: '17:00' },
  { label: 'Tarde',   Icon: Sunset,  start: '15:00', end: '23:00' },
  { label: 'Noche',   Icon: Moon,    start: '22:00', end: '06:00' },
]

interface QuickAddPopoverProps {
  employment: Employment
  date: string
  cellRect: DOMRect
  onPreset: (startTime: string, endTime: string) => void
  onCustomize: () => void
  onClose: () => void
}

const POPOVER_WIDTH = 228
const POPOVER_HEIGHT = 230

export function QuickAddPopover({
  employment,
  date,
  cellRect,
  onPreset,
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
    </div>,
    document.body,
  )
}
