import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronUp,
  CalendarDays,
} from 'lucide-react'
import { format, parseISO, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Employment, TimeEntry, Incident, IncidentType } from '../types'
import {
  MOCK_EMPLOYMENTS,
  MOCK_SHIFTS,
  MOCK_CENTERS,
  MOCK_TIME_ENTRIES,
  MOCK_INCIDENTS,
} from '../mock-data'
import { AttendanceRow, AttendanceTableHeader } from '../components/AttendanceRow'
import { TimeEntryDrawer } from '../components/TimeEntryDrawer'

// ─── Config ───────────────────────────────────────────────────────────────────

const INCIDENT_SEVERITY: Record<IncidentType, 'error' | 'warning' | 'info'> = {
  no_show:            'error',
  late_arrival:       'warning',
  early_departure:    'warning',
  unplanned_overtime: 'warning',
  missed_break:       'warning',
  unplanned_shift:    'info',
}

const INCIDENT_LABEL: Record<IncidentType, string> = {
  no_show:            'Ausencia sin fichar',
  late_arrival:       'Entrada con retraso',
  early_departure:    'Salida anticipada',
  unplanned_overtime: 'Horas extra no planificadas',
  missed_break:       'Pausa no registrada',
  unplanned_shift:    'Fichaje sin turno asignado',
}

const SEV_ICON = {
  error:   <AlertCircle   className="w-3.5 h-3.5" />,
  warning: <AlertTriangle className="w-3.5 h-3.5" />,
  info:    <Info          className="w-3.5 h-3.5" />,
}

const SEV_COLORS = {
  error:   { container: 'bg-error-50 border-error-200',   icon: 'text-error-600',   text: 'text-error-800',   detail: 'text-error-600'   },
  warning: { container: 'bg-warning-50 border-warning-200', icon: 'text-warning-600', text: 'text-warning-800', detail: 'text-warning-600' },
  info:    { container: 'bg-info-50 border-info-200',     icon: 'text-info-600',    text: 'text-info-800',    detail: 'text-info-600'    },
}

// Dates with mock data
const AVAILABLE_DATES = ['2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23']

// ─── Incident panel ───────────────────────────────────────────────────────────

function IncidentPanel({
  incidents,
  onSelectEmployee,
}: {
  incidents: Incident[]
  onSelectEmployee: (empId: string) => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  if (incidents.length === 0) return null

  const errors   = incidents.filter(i => INCIDENT_SEVERITY[i.type] === 'error')
  const warnings = incidents.filter(i => INCIDENT_SEVERITY[i.type] === 'warning')
  const infos    = incidents.filter(i => INCIDENT_SEVERITY[i.type] === 'info')

  const allSorted = [...errors, ...warnings, ...infos]

  return (
    <div className="flex-shrink-0 border-b border-neutral-200 bg-white">
      <button
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-neutral-50 transition-colors"
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
            Incidencias del día
          </span>
          {errors.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-error-700">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.length} ausencia{errors.length > 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-warning-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              {warnings.length} aviso{warnings.length > 1 ? 's' : ''}
            </span>
          )}
          {infos.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-info-700">
              <Info className="w-3.5 h-3.5" />
              {infos.length} info
            </span>
          )}
        </div>
        {collapsed
          ? <ChevronDown className="w-4 h-4 text-neutral-400" />
          : <ChevronUp   className="w-4 h-4 text-neutral-400" />
        }
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-2">
          {allSorted.map(incident => {
            const severity = INCIDENT_SEVERITY[incident.type]
            const colors   = SEV_COLORS[severity]
            const emp      = MOCK_EMPLOYMENTS.find(e => e.id === incident.employment_id)
            return (
              <div
                key={incident.id}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-md border ${colors.container}`}
              >
                <span className={`mt-0.5 flex-shrink-0 ${colors.icon}`}>
                  {SEV_ICON[severity]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-semibold ${colors.text}`}>
                      {emp?.person.legal_name.split(' ').slice(0, 2).join(' ') ?? 'Empleado'}
                    </span>
                    <span className={`text-xs ${colors.text}`}>—</span>
                    <span className={`text-xs font-medium ${colors.text}`}>
                      {INCIDENT_LABEL[incident.type]}
                    </span>
                  </div>
                  <p className={`text-2xs mt-0.5 ${colors.detail}`}>{incident.detail}</p>
                </div>
                <button
                  onClick={() => onSelectEmployee(incident.employment_id)}
                  className={`text-2xs font-medium underline underline-offset-2 flex-shrink-0 ${colors.text} hover:opacity-70`}
                >
                  Ver
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TimeTrackingPage() {
  const [selectedDate,   setSelectedDate]   = useState('2026-03-17')
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null)
  const [drawerOpen,     setDrawerOpen]     = useState(false)
  const [selectedEmp,    setSelectedEmp]    = useState<Employment | null>(null)
  const [timeEntries,    setTimeEntries]    = useState<TimeEntry[]>(MOCK_TIME_ENTRIES)

  // ── Derived data for selected date ──────────────────────────────────────────
  const dateShifts    = MOCK_SHIFTS.filter(s => s.date === selectedDate)
  const dateEntries   = timeEntries.filter(e => e.date === selectedDate)
  const dateIncidents = MOCK_INCIDENTS.filter(i => i.date === selectedDate)

  const filteredEmployments = MOCK_EMPLOYMENTS.filter(emp =>
    !selectedCenter || emp.center_id === selectedCenter
  )

  const employeeRows = filteredEmployments.map(emp => ({
    employment:  emp,
    shifts:      dateShifts.filter(s => s.employment_id === emp.id),
    timeEntries: dateEntries.filter(e => e.employment_id === emp.id),
    incidents:   dateIncidents.filter(i => i.employment_id === emp.id),
  }))

  // ── Summary stats ──────────────────────────────────────────────────────────
  const presentCount  = employeeRows.filter(r => r.timeEntries.some(e => e.type === 'in') && r.shifts.length > 0).length
  const incidentCount = employeeRows.filter(r => r.incidents.length > 0).length
  const noShowCount   = dateIncidents.filter(i => i.type === 'no_show').length

  // ── Selected employee data (for drawer) ────────────────────────────────────
  const selectedRow = selectedEmp
    ? employeeRows.find(r => r.employment.id === selectedEmp.id) ?? null
    : null

  // ── Date navigation ────────────────────────────────────────────────────────
  function navigateDate(delta: number) {
    const d = parseISO(selectedDate)
    setSelectedDate(format(addDays(d, delta), 'yyyy-MM-dd'))
  }

  function handleRowClick(emp: Employment) {
    setSelectedEmp(emp)
    setDrawerOpen(true)
  }

  function handleSelectFromPanel(empId: string) {
    const emp = MOCK_EMPLOYMENTS.find(e => e.id === empId)
    if (emp) {
      setSelectedEmp(emp)
      setDrawerOpen(true)
    }
  }

  function handleAddEntry(entry: Omit<TimeEntry, 'id'>) {
    setTimeEntries(prev => [...prev, { ...entry, id: `te${Date.now()}` }])
  }

  const formattedDate = format(parseISO(selectedDate), "EEEE, d 'de' MMMM yyyy", { locale: es })
  const hasData = AVAILABLE_DATES.includes(selectedDate)

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">

          {/* Date navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate(-1)}
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Día anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-neutral-900 min-w-[240px] text-center capitalize">
              {formattedDate}
            </span>
            <button
              onClick={() => navigateDate(1)}
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Día siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Center filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCenter ?? ''}
                onChange={e => setSelectedCenter(e.target.value || null)}
                className="pl-2.5 pr-7 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md appearance-none cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent"
              >
                <option value="">Todos los centros</option>
                {MOCK_CENTERS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-success-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-success-500" />
              {presentCount} presentes
            </span>
            {noShowCount > 0 && (
              <span className="flex items-center gap-1.5 text-error-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-error-500" />
                {noShowCount} ausencia{noShowCount > 1 ? 's' : ''}
              </span>
            )}
            {incidentCount > 0 && (
              <span className="flex items-center gap-1.5 text-warning-700 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {incidentCount} incidencia{incidentCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Incident panel ── */}
      <IncidentPanel
        incidents={dateIncidents}
        onSelectEmployee={handleSelectFromPanel}
      />

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        <AttendanceTableHeader />

        {/* Empty state — no data for this date */}
        {!hasData && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <CalendarDays className="w-10 h-10 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-500">Sin datos para este día</p>
            <p className="text-xs text-neutral-400">
              Los fichajes del {formattedDate} no están disponibles en el sistema
            </p>
          </div>
        )}

        {/* Attendance rows */}
        {hasData && filteredEmployments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-sm font-medium text-neutral-500">Sin empleados para este filtro</p>
          </div>
        )}

        {hasData && employeeRows.map(({ employment, shifts, timeEntries: empEntries, incidents: empIncidents }) => (
          <AttendanceRow
            key={employment.id}
            employment={employment}
            shifts={shifts}
            timeEntries={empEntries}
            incidents={empIncidents}
            onClick={() => handleRowClick(employment)}
          />
        ))}
      </div>

      {/* ── Detail drawer ── */}
      <TimeEntryDrawer
        employment={selectedRow?.employment ?? null}
        date={selectedDate}
        shifts={selectedRow?.shifts ?? []}
        timeEntries={selectedRow?.timeEntries ?? []}
        incidents={selectedRow?.incidents ?? []}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAddEntry={handleAddEntry}
      />
    </div>
  )
}
