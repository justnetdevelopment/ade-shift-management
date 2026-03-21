import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Sunrise, Sun, Sunset, Moon, Plus, Trash2 } from 'lucide-react'
import type { Employment, StandardWeekShift } from '../types'
import { MOCK_CENTERS, MOCK_ROLES } from '../mock-data'

interface StandardWeekDrawerProps {
  employment: Employment | null
  standardWeek: StandardWeekShift[]
  isOpen: boolean
  onClose: () => void
  onSave: (empId: string, shifts: StandardWeekShift[]) => void
}

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const PRESETS = [
  { label: 'Mañana',  short: 'Mañ', Icon: Sunrise, start: '07:00', end: '15:00' },
  { label: 'Jornada', short: 'Jor', Icon: Sun,     start: '09:00', end: '17:00' },
  { label: 'Tarde',   short: 'Tar', Icon: Sunset,  start: '15:00', end: '23:00' },
  { label: 'Noche',   short: 'Noc', Icon: Moon,    start: '22:00', end: '06:00' },
]

type ShiftSlot = { start_time: string; end_time: string }
type DayEntry  = { enabled: boolean; slots: ShiftSlot[] }

function buildDayEntries(standardWeek: StandardWeekShift[]): DayEntry[] {
  return Array.from({ length: 7 }, (_, i) => {
    const existing = standardWeek.filter(s => s.day_of_week === i)
    if (existing.length === 0) {
      return { enabled: false, slots: [{ start_time: '09:00', end_time: '17:00' }] }
    }
    return {
      enabled: true,
      slots: existing.map(s => ({ start_time: s.start_time, end_time: s.end_time })),
    }
  })
}

function computeDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let minutes = (eh * 60 + em) - (sh * 60 + sm)
  if (minutes < 0) minutes += 1440
  return Math.round(minutes / 60 * 10) / 10
}

function stepTime(value: string, direction: 1 | -1): string {
  const [h, m] = value.split(':').map(Number)
  let total = h * 60 + m + direction * 15
  total = ((total % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function TimeRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center rounded border border-neutral-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(stepTime(value, -1))}
        className="flex items-center justify-center w-6 h-7 bg-neutral-50 hover:bg-neutral-100 text-neutral-400 transition-colors border-r border-neutral-200 flex-shrink-0"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>
      <span className="flex-1 text-center text-xs font-mono font-semibold text-neutral-800 leading-7 select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(stepTime(value, 1))}
        className="flex items-center justify-center w-6 h-7 bg-neutral-50 hover:bg-neutral-100 text-neutral-400 transition-colors border-l border-neutral-200 flex-shrink-0"
      >
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}

function SlotTimePicker({ startTime, endTime, onStartChange, onEndChange }: {
  startTime: string; endTime: string
  onStartChange: (v: string) => void; onEndChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col items-stretch gap-0">
      <TimeRow value={startTime} onChange={onStartChange} />
      <div className="flex flex-col items-center py-0.5">
        <svg width="18" height="10" viewBox="0 0 18 10" className="text-neutral-300">
          <line x1="9" y1="0" x2="9" y2="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 1.5" strokeLinecap="round" />
          <polyline points="6,5 9,9 12,5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <TimeRow value={endTime} onChange={onEndChange} />
    </div>
  )
}

export function StandardWeekDrawer({
  employment,
  standardWeek,
  isOpen,
  onClose,
  onSave,
}: StandardWeekDrawerProps) {
  const [days,     setDays]     = useState<DayEntry[]>(() => buildDayEntries(standardWeek))
  const [centerId, setCenterId] = useState(() => standardWeek[0]?.center_id ?? employment?.center_id ?? '')
  const [role,     setRole]     = useState(() => standardWeek[0]?.role ?? employment?.role ?? '')

  useEffect(() => {
    if (isOpen) {
      setDays(buildDayEntries(standardWeek))
      setCenterId(standardWeek[0]?.center_id ?? employment?.center_id ?? '')
      setRole(standardWeek[0]?.role ?? employment?.role ?? '')
    }
  }, [isOpen, standardWeek, employment])

  if (!isOpen || !employment) return null

  function toggleDay(i: number) {
    setDays(prev => prev.map((d, idx) => idx === i ? { ...d, enabled: !d.enabled } : d))
  }

  function updateSlot(dayIdx: number, slotIdx: number, patch: Partial<ShiftSlot>) {
    setDays(prev => prev.map((d, di) => {
      if (di !== dayIdx) return d
      return { ...d, slots: d.slots.map((s, si) => si === slotIdx ? { ...s, ...patch } : s) }
    }))
  }

  function addSlot(dayIdx: number) {
    setDays(prev => prev.map((d, di) => {
      if (di !== dayIdx || d.slots.length >= 2) return d
      return { ...d, slots: [...d.slots, { start_time: '15:00', end_time: '19:00' }] }
    }))
  }

  function removeSlot(dayIdx: number, slotIdx: number) {
    setDays(prev => prev.map((d, di) => {
      if (di !== dayIdx) return d
      return { ...d, slots: d.slots.filter((_, si) => si !== slotIdx) }
    }))
  }

  function handleSave() {
    const result: StandardWeekShift[] = []
    days.forEach((d, i) => {
      if (!d.enabled) return
      d.slots.forEach(slot => {
        result.push({
          day_of_week: i as StandardWeekShift['day_of_week'],
          start_time: slot.start_time,
          end_time: slot.end_time,
          center_id: centerId,
          role,
        })
      })
    })
    if (employment) onSave(employment.id, result)
    onClose()
  }

  const enabledCount = days.filter(d => d.enabled).length
  const totalHours   = days
    .filter(d => d.enabled)
    .reduce((sum, d) => sum + d.slots.reduce((s, sl) => s + computeDuration(sl.start_time, sl.end_time), 0), 0)

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 animate-fade-in" onClick={onClose} aria-hidden="true" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col"
          style={{ maxHeight: '92vh' }}
          role="dialog"
          aria-modal="true"
          aria-label="Semana tipo"
        >
          {/* ── Header ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                style={{ backgroundColor: employment.person.avatar_color }}
              >
                {employment.person.avatar_initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 leading-tight">
                  {employment.person.legal_name.split(' ').slice(0, 2).join(' ')}
                </p>
                <p className="text-xs text-neutral-400 leading-tight mt-0.5">{employment.role}</p>
              </div>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-neutral-100 text-2xs font-semibold text-neutral-500 uppercase tracking-wide">
                Semana tipo
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Centro + Rol ─────────────────────────────────────── */}
          <div className="flex items-center gap-3 px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex-shrink-0">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Centro</label>
              <select
                value={centerId}
                onChange={e => setCenterId(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-shift-500 bg-white"
              >
                {MOCK_CENTERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Rol</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-shift-500 bg-white"
              >
                {MOCK_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <p className="text-xs text-neutral-400 ml-auto whitespace-nowrap">Aplica a todos los turnos</p>
          </div>

          {/* ── Summary ──────────────────────────────────────────── */}
          <div className="flex items-center gap-4 px-6 py-2 border-b border-neutral-100 flex-shrink-0">
            <span className="text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">{enabledCount}</span> días activos
            </span>
            <span className="text-neutral-300">·</span>
            <span className="text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">{Math.round(totalHours * 10) / 10}h</span> / semana
            </span>
            <span className="text-neutral-300">·</span>
            <span className={`text-xs font-semibold ${
              totalHours > employment.contracted_hours_week ? 'text-error-600' :
              totalHours === employment.contracted_hours_week ? 'text-success-600' :
              'text-neutral-400'
            }`}>
              contrato {employment.contracted_hours_week}h
            </span>
          </div>

          {/* ── 7-column day grid ────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                const isWeekend = i >= 5
                return (
                  <div
                    key={i}
                    className={`flex flex-col rounded-lg border transition-colors ${
                      day.enabled ? 'border-neutral-200 bg-white' : 'border-neutral-100 bg-neutral-50/50'
                    }`}
                  >
                    {/* Day header */}
                    <div className={`flex items-center justify-between px-2 py-2 rounded-t-lg ${
                      day.enabled ? 'bg-neutral-50 border-b border-neutral-100' : ''
                    }`}>
                      <span className={`text-xs font-bold tracking-wide ${
                        !day.enabled ? 'text-neutral-300' :
                        isWeekend    ? 'text-neutral-400' :
                        'text-neutral-700'
                      }`}>
                        {DAY_SHORT[i]}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleDay(i)}
                        title={day.enabled ? `Desactivar ${DAY_NAMES[i]}` : `Activar ${DAY_NAMES[i]}`}
                        className={`w-8 h-4 rounded-full transition-colors relative flex-shrink-0 ${
                          day.enabled ? 'bg-shift-500' : 'bg-neutral-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${
                          day.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Enabled: slot cards */}
                    {day.enabled ? (
                      <div className="flex flex-col gap-1.5 p-1.5">
                        {day.slots.map((slot, si) => {
                          const duration = computeDuration(slot.start_time, slot.end_time)
                          const isSecond = si === 1
                          return (
                            <div
                              key={si}
                              className={`rounded-md p-1.5 space-y-1.5 ${
                                isSecond
                                  ? 'bg-shift-50 border border-shift-100'
                                  : 'bg-neutral-50 border border-neutral-100'
                              }`}
                            >
                              {/* Slot meta row */}
                              <div className="flex items-center min-h-[14px]">
                                {day.slots.length > 1 && (
                                  <span className={`text-[10px] font-bold ${isSecond ? 'text-shift-500' : 'text-neutral-400'}`}>
                                    {isSecond ? '2º' : '1º'}
                                  </span>
                                )}
                                <span className="text-[10px] text-neutral-400 tabular-nums ml-auto">{duration}h</span>
                                {day.slots.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSlot(i, si)}
                                    className="ml-1 p-0.5 rounded text-neutral-300 hover:text-error-500 transition-colors"
                                    title="Eliminar turno"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              {/* Presets 2×2 */}
                              <div className="grid grid-cols-2 gap-0.5">
                                {PRESETS.map(preset => {
                                  const isActive = slot.start_time === preset.start && slot.end_time === preset.end
                                  return (
                                    <button
                                      key={preset.label}
                                      type="button"
                                      title={`${preset.label}: ${preset.start}–${preset.end}`}
                                      onClick={() => updateSlot(i, si, { start_time: preset.start, end_time: preset.end })}
                                      className={`flex items-center justify-center gap-0.5 py-1 rounded border text-[10px] font-semibold transition-all ${
                                        isActive
                                          ? 'border-shift-400 bg-shift-100 text-shift-700'
                                          : 'border-neutral-200 bg-white text-neutral-500 hover:border-shift-200 hover:bg-shift-50'
                                      }`}
                                    >
                                      <preset.Icon className="w-2.5 h-2.5 flex-shrink-0" />
                                      <span>{preset.short}</span>
                                    </button>
                                  )
                                })}
                              </div>

                              {/* Time pickers */}
                              <SlotTimePicker
                                startTime={slot.start_time}
                                endTime={slot.end_time}
                                onStartChange={v => updateSlot(i, si, { start_time: v })}
                                onEndChange={v => updateSlot(i, si, { end_time: v })}
                              />
                            </div>
                          )
                        })}

                        {/* Add 2nd slot */}
                        {day.slots.length < 2 && (
                          <button
                            type="button"
                            onClick={() => addSlot(i)}
                            className="flex items-center justify-center gap-1 w-full py-1.5 rounded border border-dashed border-neutral-200 text-[10px] text-neutral-400 hover:border-shift-300 hover:text-shift-600 hover:bg-shift-50/30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            2º turno
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center py-6">
                        <span className="text-[10px] text-neutral-300">Libre</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Footer ───────────────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-neutral-200 flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-shift-600 rounded-lg hover:bg-shift-700 transition-colors"
            >
              Guardar semana tipo
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
