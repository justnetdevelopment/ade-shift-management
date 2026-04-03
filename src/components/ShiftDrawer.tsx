import { useState, useEffect } from 'react'
import { X, Trash2, AlertCircle, AlertTriangle, Info, Clock, ChevronUp, ChevronDown, Sunrise, Sun, Sunset, Moon } from 'lucide-react'
import type { Employment, Shift, ValidationViolation } from '../types'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { TimeSlider } from './TimeSlider'

interface ShiftDrawerProps {
  employment: Employment | null
  date: string | null
  shift: Shift | null
  violations: ValidationViolation[]
  isOpen: boolean
  onClose: () => void
  onSave: (shift: Omit<Shift, 'id' | 'status' | 'duration_hours'> & { id?: string }) => void
  onDelete: (shiftId: string) => void
}

const VIOLATION_ICON = {
  error:   <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0" />,
  info:    <Info className="w-4 h-4 text-info-600 flex-shrink-0" />,
}

const VIOLATION_BG = {
  error:   'bg-error-50 border-error-200 text-error-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info:    'bg-info-50 border-info-200 text-info-800',
}

const SHIFT_PRESETS = [
  { label: 'Mañana',  Icon: Sunrise, start: '07:00', end: '15:00' },
  { label: 'Jornada', Icon: Sun,     start: '09:00', end: '17:00' },
  { label: 'Tarde',   Icon: Sunset,  start: '15:00', end: '23:00' },
  { label: 'Noche',   Icon: Moon,    start: '22:00', end: '06:00' },
]

// ─── Custom time input with +/- 15-min steppers ───────────────────────────────

interface TimeStepInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function TimeStepInput({ label, value, onChange }: TimeStepInputProps) {
  function step(direction: 1 | -1) {
    const [h, m] = value.split(':').map(Number)
    let total = h * 60 + m + direction * 15
    total = ((total % 1440) + 1440) % 1440
    const nh = Math.floor(total / 60)
    const nm = total % 60
    onChange(`${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`)
  }

  return (
    <div className="flex-1">
      <label className="block text-2xs text-neutral-500 mb-1">{label}</label>
      <div className="flex flex-col items-stretch">
        <button
          type="button"
          onClick={() => step(1)}
          className="flex items-center justify-center py-0.5 rounded-t-md border border-b-0 border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          aria-label={`Aumentar ${label}`}
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <input
          type="time"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-2 py-1.5 text-sm font-mono text-neutral-900 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent text-center bg-white"
        />
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex items-center justify-center py-0.5 rounded-b-md border border-t-0 border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          aria-label={`Reducir ${label}`}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

export function ShiftDrawer({
  employment,
  date,
  shift,
  violations,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: ShiftDrawerProps) {
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [centerId, setCenterId] = useState('')
  const [role, setRole] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (shift) {
      setStartTime(shift.start_time)
      setEndTime(shift.end_time)
      setCenterId(shift.center_id)
      setRole(shift.role)
    } else if (employment) {
      setStartTime('09:00')
      setEndTime('17:00')
      setCenterId(employment.center_id)
      setRole(employment.role)
    }
    setConfirmDelete(false)
  }, [shift, employment, date])

  if (!isOpen || !employment || !date) return null

  const formattedDate = format(parseISO(date), "EEEE, d 'de' MMMM", { locale: es })
  const durationHours = computeDuration(startTime, endTime)
  const isEditing = !!shift

  function computeDuration(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    let minutes = (eh * 60 + em) - (sh * 60 + sm)
    if (minutes < 0) minutes += 24 * 60
    return Math.round(minutes / 60 * 10) / 10
  }

  function applyPreset(start: string, end: string) {
    setStartTime(start)
    setEndTime(end)
  }

  function handleSave() {
    if (!employment || !date) return
    onSave({
      ...(shift?.id ? { id: shift.id } : {}),
      employment_id: employment.id,
      date,
      start_time: startTime,
      end_time: endTime,
      center_id: centerId,
      role,
    })
    onClose()
  }

  function handleDelete() {
    if (!shift) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    onDelete(shift.id)
    onClose()
  }

  const shiftViolations = shift
    ? violations.filter(v => v.shift_id === shift.id || v.employment_id === employment.id)
    : []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed right-0 top-0 h-full w-80 bg-white shadow-overlay z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label={isEditing ? 'Editar turno' : 'Nuevo turno'}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-neutral-200">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-0.5">
              {isEditing ? 'Editar turno' : 'Nuevo turno'}
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {employment.person.legal_name.split(' ').slice(0, 2).join(' ')}
            </p>
            <p className="text-xs text-neutral-500 capitalize">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

          {/* 1. Shift presets */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Turnos habituales
            </p>
            <div className="grid grid-cols-4 gap-1">
              {SHIFT_PRESETS.map(preset => {
                const isActive = startTime === preset.start && endTime === preset.end
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.start, preset.end)}
                    className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-center transition-all ${
                      isActive
                        ? 'border-shift-400 bg-shift-50 ring-1 ring-shift-300'
                        : 'border-neutral-150 hover:border-shift-200 hover:bg-shift-50/50'
                    }`}
                  >
                    <preset.Icon className={`w-4 h-4 ${isActive ? 'text-shift-500' : 'text-neutral-400'}`} />
                    <span className={`text-2xs font-semibold leading-tight ${isActive ? 'text-shift-700' : 'text-neutral-700'}`}>
                      {preset.label}
                    </span>
                    <span className={`text-2xs tabular-nums font-mono leading-tight ${isActive ? 'text-shift-600' : 'text-neutral-400'}`}>
                      {preset.start.replace(':00', 'h')}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Time range — custom steppers */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Horario
            </label>

            <div className="flex items-start gap-2">
              <TimeStepInput label="Inicio" value={startTime} onChange={setStartTime} />
              <div className="flex-shrink-0 pt-7 text-neutral-300 font-bold">→</div>
              <TimeStepInput label="Fin" value={endTime} onChange={setEndTime} />
            </div>

            {/* Duration indicator */}
            <div className="flex items-center gap-1.5 mt-2 text-xs text-neutral-500">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {durationHours}h de turno
                {endTime < startTime ? ' · nocturno' : ''}
              </span>
            </div>

            {/* 3. Visual 24h slider */}
            <div className="mt-4">
              <TimeSlider
                startTime={startTime}
                endTime={endTime}
                onChange={(s, e) => { setStartTime(s); setEndTime(e) }}
              />
            </div>
          </div>

          {/* Contract hours context */}
          <div className="bg-neutral-50 rounded-md px-3 py-2.5 space-y-1">
            <p className="text-2xs font-semibold text-neutral-500 uppercase tracking-wide">Contrato</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-600">Horas semanales contratadas</span>
              <span className="text-xs font-semibold text-neutral-900 tabular-nums">
                {employment.contracted_hours_week}h
              </span>
            </div>
          </div>

          {/* Validation alerts for this shift */}
          {shiftViolations.length > 0 && (
            <div className="space-y-2">
              <p className="text-2xs font-semibold text-neutral-500 uppercase tracking-wide">
                Validaciones
              </p>
              {shiftViolations.map(v => (
                <div
                  key={v.id}
                  className={`flex items-start gap-2 px-3 py-2 rounded-md border text-xs ${VIOLATION_BG[v.severity]}`}
                >
                  {VIOLATION_ICON[v.severity]}
                  <div>
                    <p className="font-medium">{v.message}</p>
                    {v.detail && <p className="text-2xs mt-0.5 opacity-80">{v.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-neutral-200 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 text-sm font-semibold text-white bg-shift-600 rounded-md hover:bg-shift-700 transition-colors"
            >
              {isEditing ? 'Guardar cambios' : 'Crear turno'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors"
            >
              Cancelar
            </button>
          </div>

          {isEditing && (
            <button
              onClick={handleDelete}
              className={`w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-md transition-colors ${
                confirmDelete
                  ? 'bg-error-600 text-white hover:bg-error-700'
                  : 'text-error-600 hover:bg-error-50 border border-error-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? '¿Confirmar eliminación?' : 'Eliminar turno'}
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
