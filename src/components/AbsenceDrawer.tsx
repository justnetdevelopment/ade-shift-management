import { useState, useEffect } from 'react'
import { X, Trash2, Palmtree, UserX, Briefcase, FileX, AlertCircle } from 'lucide-react'
import type { Absence, AbsenceType, Employment } from '../types'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import { es } from 'date-fns/locale'

interface AbsenceDrawerProps {
  absence: Absence | null
  employment: Employment | null
  isOpen: boolean
  onClose: () => void
  onSave: (absence: Absence) => void
  onDelete: (absenceId: string) => void
}

const ABSENCE_OPTIONS: {
  type: AbsenceType
  label: string
  Icon: React.ElementType
  color: string
  bg: string
  border: string
  blocks: boolean
}[] = [
  {
    type: 'vacation',
    label: 'Vacaciones',
    Icon: Palmtree,
    color: 'text-info-700',
    bg: 'bg-info-50',
    border: 'border-info-300',
    blocks: true,
  },
  {
    type: 'sick_leave',
    label: 'Baja médica',
    Icon: UserX,
    color: 'text-error-700',
    bg: 'bg-error-50',
    border: 'border-error-300',
    blocks: true,
  },
  {
    type: 'personal',
    label: 'Asunto propio',
    Icon: Briefcase,
    color: 'text-shift-700',
    bg: 'bg-shift-50',
    border: 'border-shift-300',
    blocks: false,
  },
  {
    type: 'justified',
    label: 'Justificada',
    Icon: FileX,
    color: 'text-warning-700',
    bg: 'bg-warning-50',
    border: 'border-warning-300',
    blocks: false,
  },
  {
    type: 'unjustified',
    label: 'Injustificada',
    Icon: AlertCircle,
    color: 'text-neutral-700',
    bg: 'bg-neutral-50',
    border: 'border-neutral-300',
    blocks: false,
  },
]

const LABELS: Record<AbsenceType, string> = {
  vacation:    'Vacaciones',
  sick_leave:  'Baja médica',
  personal:    'Asunto propio',
  justified:   'Justificada',
  unjustified: 'Injustificada',
}

export function AbsenceDrawer({
  absence,
  employment,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: AbsenceDrawerProps) {
  const [type,      setType]      = useState<AbsenceType>('vacation')
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [reason,    setReason]    = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)

  useEffect(() => {
    if (absence) {
      setType(absence.type)
      setStartDate(absence.start_date)
      setEndDate(absence.end_date)
      setReason(absence.reason ?? '')
    }
    setConfirmDelete(false)
    setDateError(null)
  }, [absence])

  if (!isOpen || !absence || !employment) return null

  function handleStartChange(val: string) {
    setStartDate(val)
    if (endDate && isAfter(parseISO(val), parseISO(endDate))) {
      setEndDate(val)
    }
    setDateError(null)
  }

  function handleEndChange(val: string) {
    if (isBefore(parseISO(val), parseISO(startDate))) {
      setDateError('La fecha de fin no puede ser anterior a la de inicio')
      return
    }
    setEndDate(val)
    setDateError(null)
  }

  function handleSave() {
    if (!absence || !startDate || !endDate) return
    if (isBefore(parseISO(endDate), parseISO(startDate))) {
      setDateError('La fecha de fin no puede ser anterior a la de inicio')
      return
    }
    onSave({
      id:              absence.id,
      employment_id:   absence.employment_id,
      status:          absence.status,
      type,
      label:           LABELS[type],
      start_date:      startDate,
      end_date:        endDate,
      reason:          reason.trim() || undefined,
      blocks_planning: type === 'vacation' || type === 'sick_leave',
    })
    onClose()
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (!absence) return
    onDelete(absence.id)
    onClose()
  }

  const formattedStart = startDate
    ? format(parseISO(startDate), "d MMM yyyy", { locale: es })
    : '—'
  const formattedEnd = endDate
    ? format(parseISO(endDate), "d MMM yyyy", { locale: es })
    : '—'
  const dayCount = startDate && endDate
    ? Math.round((parseISO(endDate).getTime() - parseISO(startDate).getTime()) / 86_400_000) + 1
    : 0

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
        aria-label="Editar ausencia"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-neutral-200">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-0.5">
              Editar ausencia
            </p>
            <p className="text-sm font-semibold text-neutral-900">
              {employment.person.legal_name.split(' ').slice(0, 2).join(' ')}
            </p>
            <p className="text-xs text-neutral-500">{employment.role}</p>
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

          {/* Tipo de ausencia */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Tipo de ausencia
            </p>
            <div className="space-y-1.5">
              {ABSENCE_OPTIONS.map(opt => {
                const isActive = type === opt.type
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setType(opt.type)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      isActive
                        ? `${opt.bg} ${opt.border} ring-1 ring-offset-0`
                        : 'border-neutral-150 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <opt.Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? opt.color : 'text-neutral-400'}`} />
                    <span className={`text-sm font-medium ${isActive ? opt.color : 'text-neutral-700'}`}>
                      {opt.label}
                    </span>
                    {opt.blocks && (
                      <span className={`ml-auto text-2xs font-medium px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/60 text-neutral-600' : 'bg-neutral-100 text-neutral-400'
                      }`}>
                        Bloquea
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fechas */}
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Periodo
            </p>
            <div className="space-y-2">
              <div>
                <label className="block text-2xs text-neutral-500 mb-1">Fecha inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => handleStartChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-2xs text-neutral-500 mb-1">Fecha fin</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => handleEndChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent bg-white"
                />
              </div>
              {dateError && (
                <p className="text-xs text-error-600">{dateError}</p>
              )}
              {dayCount > 0 && !dateError && (
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-lg text-xs text-neutral-500">
                  <span>{formattedStart} → {formattedEnd}</span>
                  <span className="font-semibold text-neutral-700">{dayCount} día{dayCount > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Motivo (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
              Motivo <span className="normal-case font-normal text-neutral-400">(opcional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Añadir nota..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent bg-white placeholder-neutral-300"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-neutral-200 space-y-2">
          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!startDate || !endDate || !!dateError}
            className="w-full py-2 px-4 bg-shift-600 hover:bg-shift-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Guardar cambios
          </button>

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 px-4 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-error-600 hover:bg-error-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Eliminar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-error-600 hover:bg-error-50 text-sm font-medium rounded-lg transition-colors border border-transparent hover:border-error-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Eliminar ausencia
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
