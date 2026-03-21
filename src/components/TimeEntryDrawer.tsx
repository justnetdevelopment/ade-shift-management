import { useState } from 'react'
import {
  X,
  Smartphone,
  Monitor,
  PenLine,
  Zap,
  AlertCircle,
  AlertTriangle,
  Info,
  Plus,
  Clock,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  Employment,
  Shift,
  TimeEntry,
  Incident,
  TimeEntryType,
  TimeEntrySource,
  IncidentType,
} from '../types'
import { MOCK_CENTERS } from '../mock-data'

// ─── Config ───────────────────────────────────────────────────────────────────

const ENTRY_TYPE_LABELS: Record<TimeEntryType, string> = {
  in:          'Entrada',
  out:         'Salida',
  break_start: 'Inicio pausa',
  break_end:   'Fin pausa',
}

const ENTRY_DOT: Record<TimeEntryType, string> = {
  in:          'bg-success-500',
  out:         'bg-neutral-400',
  break_start: 'bg-neutral-300',
  break_end:   'bg-neutral-300',
}

const SOURCE_CONFIG: Record<TimeEntrySource, { icon: typeof Smartphone; className: string; label: string; badgeClass: string }> = {
  mobile: { icon: Smartphone, className: 'text-success-600', label: 'Móvil',    badgeClass: 'bg-success-50 text-success-700 ring-success-200' },
  kiosk:  { icon: Monitor,    className: 'text-info-600',    label: 'Terminal', badgeClass: 'bg-info-50 text-info-700 ring-info-200'           },
  manual: { icon: PenLine,    className: 'text-warning-600', label: 'Manual',   badgeClass: 'bg-warning-50 text-warning-700 ring-warning-200'  },
  api:    { icon: Zap,        className: 'text-neutral-400', label: 'API',      badgeClass: 'bg-neutral-100 text-neutral-600 ring-neutral-200' },
}

const INCIDENT_CONFIG: Record<IncidentType, { label: string; severity: 'error' | 'warning' | 'info' }> = {
  no_show:            { label: 'Ausencia sin fichar',          severity: 'error'   },
  late_arrival:       { label: 'Entrada con retraso',          severity: 'warning' },
  early_departure:    { label: 'Salida anticipada',            severity: 'warning' },
  unplanned_overtime: { label: 'Horas extra no planificadas',  severity: 'warning' },
  missed_break:       { label: 'Pausa no registrada',          severity: 'warning' },
  unplanned_shift:    { label: 'Fichaje sin turno asignado',   severity: 'info'    },
}

const INCIDENT_ICON = {
  error:   <AlertCircle   className="w-4 h-4 text-error-600   flex-shrink-0 mt-0.5" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning-600 flex-shrink-0 mt-0.5" />,
  info:    <Info          className="w-4 h-4 text-info-600    flex-shrink-0 mt-0.5" />,
}

const INCIDENT_BG = {
  error:   'bg-error-50   border-error-200   text-error-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info:    'bg-info-50    border-info-200    text-info-800',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimeEntryDrawerProps {
  employment:  Employment | null
  date:        string | null
  shifts:      Shift[]
  timeEntries: TimeEntry[]
  incidents:   Incident[]
  isOpen:      boolean
  onClose:     () => void
  onAddEntry:  (entry: Omit<TimeEntry, 'id'>) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TimeEntryDrawer({
  employment,
  date,
  shifts,
  timeEntries,
  incidents,
  isOpen,
  onClose,
  onAddEntry,
}: TimeEntryDrawerProps) {
  const [addFormOpen, setAddFormOpen]   = useState(false)
  const [newTime, setNewTime]           = useState('09:00')
  const [newType, setNewType]           = useState<TimeEntryType>('in')
  const [newNote, setNewNote]           = useState('')

  if (!isOpen || !employment || !date) return null

  const formattedDate = format(parseISO(date), "EEEE, d 'de' MMMM", { locale: es })
  const sortedEntries = [...timeEntries].sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  function handleSaveEntry() {
    if (!employment || !date || !newTime) return
    onAddEntry({
      employment_id: employment.id,
      date,
      timestamp: newTime,
      type: newType,
      source: 'manual',
      note: newNote || undefined,
    })
    setNewTime('09:00')
    setNewType('in')
    setNewNote('')
    setAddFormOpen(false)
  }

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
        className="fixed right-0 top-0 h-full w-96 bg-white shadow-overlay z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de fichajes"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-200">
          <div>
            <p className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              Detalle del día
            </p>
            <p className="text-sm font-semibold text-neutral-900 leading-tight">
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

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">

          {/* Section: Turno planificado */}
          <section className="px-5 py-4">
            <h3 className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Turno planificado
            </h3>
            {shifts.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-info-50 border border-info-200">
                <Info className="w-4 h-4 text-info-600 flex-shrink-0" />
                <span className="text-xs text-info-800">Sin turno asignado este día</span>
              </div>
            ) : (
              <div className="space-y-2">
                {shifts.map(s => {
                  const center = MOCK_CENTERS.find(c => c.id === s.center_id)
                  return (
                    <div key={s.id} className="flex items-center justify-between px-3 py-2.5 rounded-md bg-neutral-50 border border-neutral-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-semibold text-neutral-900">
                            {s.start_time} – {s.end_time}
                          </span>
                          <span className="text-xs text-neutral-500">{s.duration_hours}h</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">{center?.name} · {s.role}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        s.status === 'published' ? 'bg-success-500' :
                        s.status === 'locked'    ? 'bg-navy-500' :
                        'bg-neutral-400'
                      }`} />
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Section: Registro de fichajes */}
          <section className="px-5 py-4">
            <h3 className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Registro de fichajes
            </h3>
            {sortedEntries.length === 0 ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-neutral-50 border border-neutral-200">
                <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span className="text-xs text-neutral-500">Sin fichajes registrados</span>
              </div>
            ) : (
              <ol className="relative space-y-0">
                {sortedEntries.map((entry, idx) => {
                  const srcCfg = SOURCE_CONFIG[entry.source]
                  const SrcIcon = srcCfg.icon
                  const isLast = idx === sortedEntries.length - 1
                  return (
                    <li key={entry.id} className="flex gap-3">
                      {/* Timeline spine */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${ENTRY_DOT[entry.type]}`} />
                        {!isLast && <span className="w-px flex-1 bg-neutral-200 mt-1 mb-0" />}
                      </div>
                      {/* Content */}
                      <div className={`flex-1 pb-3 ${isLast ? '' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-semibold text-neutral-900">
                                {entry.timestamp}
                              </span>
                              <span className="text-xs text-neutral-600">
                                {ENTRY_TYPE_LABELS[entry.type]}
                              </span>
                            </div>
                            {entry.note && (
                              <p className="text-xs text-neutral-500 mt-0.5 italic">{entry.note}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs font-medium ring-1 ring-inset flex-shrink-0 ${srcCfg.badgeClass}`}>
                            <SrcIcon className="w-2.5 h-2.5" />
                            {srcCfg.label}
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>

          {/* Section: Incidencias */}
          {incidents.length > 0 && (
            <section className="px-5 py-4">
              <h3 className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
                Incidencias del día
              </h3>
              <div className="space-y-2">
                {incidents.map(incident => {
                  const cfg = INCIDENT_CONFIG[incident.type]
                  return (
                    <div
                      key={incident.id}
                      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-md border text-xs ${INCIDENT_BG[cfg.severity]}`}
                    >
                      {INCIDENT_ICON[cfg.severity]}
                      <div>
                        <p className="font-semibold">{cfg.label}</p>
                        <p className="text-2xs mt-0.5 opacity-80">{incident.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Section: Add manual entry */}
          <section className="px-5 py-4">
            <h3 className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Fichaje manual
            </h3>
            {!addFormOpen ? (
              <button
                onClick={() => setAddFormOpen(true)}
                className="flex items-center gap-1.5 w-full px-3 py-2 rounded-md border border-dashed border-neutral-300 text-xs font-medium text-neutral-500 hover:border-shift-400 hover:text-shift-600 hover:bg-shift-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir fichaje manual
              </button>
            ) : (
              <div className="rounded-md border border-warning-200 bg-warning-50 p-3 space-y-3">
                <p className="text-2xs text-warning-700 font-medium">
                  Los fichajes manuales quedan registrados con su autor y hora de creación.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-2xs font-semibold text-neutral-600 mb-1">Hora</label>
                    <input
                      type="time"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm font-mono text-neutral-900 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-semibold text-neutral-600 mb-1">Tipo</label>
                    <select
                      value={newType}
                      onChange={e => setNewType(e.target.value as TimeEntryType)}
                      className="w-full px-2.5 py-1.5 text-xs text-neutral-900 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent"
                    >
                      <option value="in">Entrada</option>
                      <option value="out">Salida</option>
                      <option value="break_start">Inicio pausa</option>
                      <option value="break_end">Fin pausa</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-neutral-600 mb-1">
                    Motivo <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Describe el motivo del fichaje manual"
                    className="w-full px-2.5 py-1.5 text-xs text-neutral-900 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent placeholder:text-neutral-400"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEntry}
                    disabled={!newTime || !newNote.trim()}
                    className="flex-1 py-1.5 text-xs font-semibold text-white bg-shift-600 rounded-md hover:bg-shift-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Guardar fichaje
                  </button>
                  <button
                    onClick={() => setAddFormOpen(false)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  )
}
