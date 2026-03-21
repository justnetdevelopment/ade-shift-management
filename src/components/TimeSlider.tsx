import { useRef, useEffect } from 'react'
import { Moon } from 'lucide-react'

interface TimeSliderProps {
  startTime: string // HH:mm
  endTime: string   // HH:mm
  onChange: (startTime: string, endTime: string) => void
}

const TOTAL_MINUTES = 24 * 60

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  const clamped = ((minutes % TOTAL_MINUTES) + TOTAL_MINUTES) % TOTAL_MINUTES
  const h = Math.floor(clamped / 60)
  const m = clamped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function snapTo15(raw: number): number {
  return Math.round(raw / 15) * 15
}

const HOUR_TICKS = [0, 6, 12, 18, 24]

export function TimeSlider({ startTime, endTime, onChange }: TimeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef<'start' | 'end' | null>(null)

  // Always-fresh props accessible from stable callbacks
  const propsRef = useRef({ startTime, endTime, onChange })
  propsRef.current = { startTime, endTime, onChange }

  // Stable handlers — created once so removeEventListener works
  const handleMove = useRef((e: PointerEvent) => {
    if (!draggingRef.current || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const minutes = snapTo15(Math.round(pct * TOTAL_MINUTES))
    const time = minutesToTime(minutes)
    const { startTime, endTime, onChange } = propsRef.current
    if (draggingRef.current === 'start') {
      onChange(time, endTime)
    } else {
      onChange(startTime, time)
    }
  }).current

  const handleUp = useRef(() => {
    draggingRef.current = null
    window.removeEventListener('pointermove', handleMove)
    window.removeEventListener('pointerup', handleUp)
  }).current

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
  }, [handleMove, handleUp])

  function onPointerDownHandle(handle: 'start' | 'end') {
    return (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      draggingRef.current = handle
      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
    }
  }

  const startMin = timeToMinutes(startTime)
  const endMin = timeToMinutes(endTime)
  const isOvernight = endMin < startMin
  const startPct = (startMin / TOTAL_MINUTES) * 100
  const endPct = (endMin / TOTAL_MINUTES) * 100

  return (
    <div className="select-none" onDragStart={e => e.preventDefault()}>
      {/* Track container — extra vertical padding for labels */}
      <div ref={trackRef} className="relative h-10 flex items-center">
        {/* Base track */}
        <div className="absolute inset-x-0 h-2 bg-neutral-100 rounded-full" />

        {/* Filled region */}
        {!isOvernight ? (
          <div
            className="absolute h-2 bg-shift-400 rounded-full pointer-events-none"
            style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
          />
        ) : (
          <>
            <div
              className="absolute h-2 bg-shift-300 rounded-l-full pointer-events-none"
              style={{ left: `${startPct}%`, right: '0' }}
            />
            <div
              className="absolute h-2 bg-shift-300 rounded-r-full pointer-events-none"
              style={{ left: '0', right: `${100 - endPct}%` }}
            />
          </>
        )}

        {/* Start handle */}
        <div
          className="absolute z-10 w-5 h-5 -translate-x-1/2 rounded-full bg-white border-2 border-shift-500 shadow-raised cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `${startPct}%` }}
          onPointerDown={onPointerDownHandle('start')}
        >
          {/* Label above */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 text-2xs font-mono font-bold text-shift-700 whitespace-nowrap pointer-events-none bg-white/80 px-0.5 rounded">
            {startTime}
          </div>
        </div>

        {/* End handle */}
        <div
          className="absolute z-10 w-5 h-5 -translate-x-1/2 rounded-full bg-white border-2 border-shift-700 shadow-raised cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
          style={{ left: `${endPct}%` }}
          onPointerDown={onPointerDownHandle('end')}
        >
          {/* Label below */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 text-2xs font-mono font-bold text-shift-700 whitespace-nowrap pointer-events-none bg-white/80 px-0.5 rounded">
            {endTime}
          </div>
        </div>
      </div>

      {/* Hour tick labels */}
      <div className="relative h-4 mt-1">
        {HOUR_TICKS.map(h => (
          <span
            key={h}
            className="absolute text-2xs text-neutral-300 -translate-x-1/2 select-none"
            style={{ left: `${(h / 24) * 100}%` }}
          >
            {String(h % 24).padStart(2, '0')}h
          </span>
        ))}
      </div>

      {/* Overnight indicator */}
      {isOvernight && (
        <p className="text-2xs text-shift-500 mt-0.5 flex items-center gap-1">
          <Moon className="w-3 h-3" /> Turno nocturno (cruza medianoche)
        </p>
      )}
    </div>
  )
}
