import { Smartphone, Monitor, PenLine, Zap } from 'lucide-react'
import type {
  Employment,
  Shift,
  TimeEntry,
  Incident,
  AttendanceStatus,
  TimeEntrySource,
  IncidentType,
} from '../types'
import { computeActualMinutes, formatMinutes, formatDeviation } from '../utils'

// ─── Config maps ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; badgeClass: string; dotClass: string }> = {
  present:         { label: 'Presente',     badgeClass: 'bg-success-100 text-success-700 ring-success-200', dotClass: 'bg-success-500'  },
  partial:         { label: 'Parcial',       badgeClass: 'bg-warning-100 text-warning-700 ring-warning-200', dotClass: 'bg-warning-500'  },
  no_show:         { label: 'Sin fichar',    badgeClass: 'bg-error-50 text-error-700 ring-error-200',        dotClass: 'bg-error-500'    },
  unplanned_shift: { label: 'Sin turno',     badgeClass: 'bg-info-50 text-info-700 ring-info-200',           dotClass: 'bg-info-500'     },
  not_scheduled:   { label: 'No programado', badgeClass: 'bg-neutral-100 text-neutral-500 ring-neutral-200', dotClass: 'bg-neutral-300'  },
}

const SOURCE_CONFIG: Record<TimeEntrySource, { icon: typeof Smartphone; className: string; label: string }> = {
  mobile: { icon: Smartphone, className: 'text-success-600', label: 'Móvil'     },
  kiosk:  { icon: Monitor,    className: 'text-info-600',    label: 'Terminal'  },
  manual: { icon: PenLine,    className: 'text-warning-600', label: 'Manual'    },
  api:    { icon: Zap,        className: 'text-neutral-400', label: 'API'       },
}

const INCIDENT_SEVERITY: Record<IncidentType, 'error' | 'warning' | 'info'> = {
  no_show:            'error',
  late_arrival:       'warning',
  early_departure:    'warning',
  unplanned_overtime: 'warning',
  missed_break:       'warning',
  unplanned_shift:    'info',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(shifts: Shift[], timeEntries: TimeEntry[], incidents: Incident[]): AttendanceStatus {
  const hasIn  = timeEntries.some(e => e.type === 'in')
  const hasOut = timeEntries.some(e => e.type === 'out')

  if (shifts.length === 0) {
    return hasIn ? 'unplanned_shift' : 'not_scheduled'
  }
  if (incidents.some(i => i.type === 'no_show')) return 'no_show'
  if (!hasIn) return 'no_show'
  if (!hasOut) return 'partial'
  if (incidents.some(i => i.type === 'early_departure')) return 'partial'
  return 'present'
}

function SourceIcon({ entry }: { entry: TimeEntry }) {
  const cfg = SOURCE_CONFIG[entry.source]
  const Icon = cfg.icon
  return <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.className}`} aria-label={cfg.label} />
}

// ─── Column layout ────────────────────────────────────────────────────────────

const GRID = 'grid grid-cols-[minmax(160px,1fr)_160px_116px_116px_88px_88px_120px]'

// ─── Component ────────────────────────────────────────────────────────────────

interface AttendanceRowProps {
  employment:  Employment
  shifts:      Shift[]
  timeEntries: TimeEntry[]
  incidents:   Incident[]
  onClick:     () => void
}

export function AttendanceRow({ employment, shifts, timeEntries, incidents, onClick }: AttendanceRowProps) {
  const status = deriveStatus(shifts, timeEntries, incidents)

  const inEntries  = timeEntries.filter(e => e.type === 'in' ).sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const outEntries = timeEntries.filter(e => e.type === 'out').sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  const firstIn  = inEntries[0]  ?? null
  const lastOut  = outEntries[outEntries.length - 1] ?? null

  const actualMinutes   = computeActualMinutes(timeEntries)
  const plannedMinutes  = shifts.reduce((acc, s) => acc + Math.round(s.duration_hours * 60), 0)
  const deviationMinutes = (actualMinutes !== null && plannedMinutes > 0) ? actualMinutes - plannedMinutes : null

  // Incident types present for this row
  const incidentTypes = new Set(incidents.map(i => i.type))
  const hasLateArrival   = incidentTypes.has('late_arrival')
  const hasEarlyDep      = incidentTypes.has('early_departure')
  const hasOvertime      = incidentTypes.has('unplanned_overtime')

  // Incident dot for clock-in / clock-out cells
  const inDotSeverity  = hasLateArrival ? 'warning' : null
  const outDotSeverity = (hasEarlyDep || hasOvertime) ? 'warning' : null

  const worstSeverity = incidents.reduce<'error' | 'warning' | 'info' | null>((acc, i) => {
    const s = INCIDENT_SEVERITY[i.type]
    if (s === 'error')              return 'error'
    if (s === 'warning' && acc !== 'error') return 'warning'
    if (s === 'info' && acc === null)       return 'info'
    return acc
  }, null)

  const rowBg =
    worstSeverity === 'error'   ? 'bg-error-50/40'   :
    worstSeverity === 'warning' ? 'bg-warning-50/40' :
    worstSeverity === 'info'    ? 'bg-info-50/30'    :
    'bg-white'

  const statusCfg = STATUS_CONFIG[status]

  return (
    <div
      role="row"
      aria-label={employment.person.legal_name}
      className={`${GRID} items-center gap-0 border-b border-neutral-100 cursor-pointer hover:brightness-95 transition-all ${rowBg}`}
      onClick={onClick}
    >
      {/* ── Employee ── */}
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold"
          style={{ backgroundColor: employment.person.avatar_color }}
        >
          {employment.person.avatar_initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-neutral-900 truncate leading-tight">
            {employment.person.legal_name.split(' ').slice(0, 2).join(' ')}
          </p>
          <p className="text-xs text-neutral-500 truncate">{employment.role}</p>
        </div>
      </div>

      {/* ── Turno planificado ── */}
      <div className="px-3 py-3">
        {shifts.length === 0 ? (
          <span className="text-xs text-neutral-400">—</span>
        ) : (
          <div className="flex flex-col gap-0.5">
            {shifts.map(s => (
              <span key={s.id} className="flex items-center gap-1.5 text-xs font-mono text-neutral-700">
                <span className="w-1.5 h-1.5 rounded-full bg-shift-500 flex-shrink-0" />
                {s.start_time}–{s.end_time}
                <span className="text-neutral-400 text-2xs ml-0.5">{s.duration_hours}h</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Entrada ── */}
      <div className="px-3 py-3">
        {firstIn === null ? (
          <span className={`text-sm font-mono ${status === 'no_show' ? 'text-error-400' : 'text-neutral-300'}`}>
            {status === 'no_show' ? '—' : '—'}
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            {inDotSeverity && (
              <span className="w-1.5 h-1.5 rounded-full bg-warning-500 flex-shrink-0" />
            )}
            <span className="text-sm font-mono text-neutral-900">{firstIn.timestamp}</span>
            <SourceIcon entry={firstIn} />
          </div>
        )}
      </div>

      {/* ── Salida ── */}
      <div className="px-3 py-3">
        {lastOut === null ? (
          <span className={`text-xs font-mono ${firstIn ? 'text-warning-500' : 'text-neutral-300'}`}>
            {firstIn ? 'En turno' : '—'}
          </span>
        ) : (
          <div className="flex items-center gap-1.5">
            {outDotSeverity && (
              <span className="w-1.5 h-1.5 rounded-full bg-warning-500 flex-shrink-0" />
            )}
            <span className="text-sm font-mono text-neutral-900">{lastOut.timestamp}</span>
            <SourceIcon entry={lastOut} />
          </div>
        )}
      </div>

      {/* ── Horas reales ── */}
      <div className="px-3 py-3 text-right">
        {actualMinutes === null ? (
          <span className="text-xs text-neutral-400">—</span>
        ) : (
          <span className="text-sm font-mono text-neutral-900 tabular-nums">
            {formatMinutes(actualMinutes)}
          </span>
        )}
      </div>

      {/* ── Desviación ── */}
      <div className="px-3 py-3 text-right">
        {deviationMinutes === null ? (
          <span className="text-xs text-neutral-400">—</span>
        ) : Math.abs(deviationMinutes) <= 5 ? (
          <span className="text-sm font-mono text-neutral-400">≈0</span>
        ) : (
          <span className={`text-sm font-mono font-medium tabular-nums ${
            deviationMinutes > 30 ? 'text-warning-600' : deviationMinutes < -30 ? 'text-warning-600' : 'text-neutral-500'
          }`}>
            {formatDeviation(deviationMinutes)}
          </span>
        )}
      </div>

      {/* ── Estado ── */}
      <div className="px-3 py-3">
        <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusCfg.badgeClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dotClass}`} />
          {statusCfg.label}
        </span>
      </div>
    </div>
  )
}

// ─── Table header (exported for use in page) ──────────────────────────────────

export function AttendanceTableHeader() {
  return (
    <div className={`${GRID} border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10`}>
      {([ 'Empleado', 'Turno planificado', 'Entrada', 'Salida', 'Horas', 'Desviación', 'Estado' ] as const).map((label, i) => (
        <div
          key={label}
          className={`px-3 py-2 text-2xs font-semibold text-neutral-500 uppercase tracking-wide ${
            i === 0 ? 'px-4' : i >= 4 && i <= 5 ? 'text-right' : ''
          }`}
        >
          {label}
        </div>
      ))}
    </div>
  )
}
