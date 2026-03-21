import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Shield,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  CalendarDays,
  ChevronDown,
} from 'lucide-react'
import {
  MOCK_EMPLOYMENTS,
  MOCK_CENTERS,
  MOCK_WORK_DAYS,
  MOCK_TIME_ENTRIES,
} from '../mock-data'
import { formatHours, formatDeviation } from '../utils'

// ─── Table grid layout ────────────────────────────────────────────────────────

const COL = 'grid-cols-[180px_90px_110px_82px_54px_60px_60px_54px_66px_36px_88px]'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClockIn(empId: string, date: string): string | null {
  const entry = MOCK_TIME_ENTRIES.find(te => te.employment_id === empId && te.date === date && te.type === 'in')
  return entry?.timestamp ?? null
}

function getClockOut(empId: string, date: string): string | null {
  const entries = MOCK_TIME_ENTRIES.filter(te => te.employment_id === empId && te.date === date && te.type === 'out')
  return entries.length ? entries[entries.length - 1].timestamp : null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InspectionPage() {
  const [centerFilter,   setCenterFilter]   = useState('all')
  const [employeeFilter, setEmployeeFilter] = useState('all')
  const [dateFrom,       setDateFrom]       = useState('2026-03-17')
  const [dateTo,         setDateTo]         = useState('2026-03-21')

  // ── Build table rows ──────────────────────────────────────────────────────
  const rows = useMemo(() => {
    return MOCK_WORK_DAYS
      .filter(wd => {
        if (wd.date < dateFrom || wd.date > dateTo) return false
        if (employeeFilter !== 'all' && wd.employment_id !== employeeFilter) return false
        const emp = MOCK_EMPLOYMENTS.find(e => e.id === wd.employment_id)!
        if (centerFilter !== 'all' && emp.center_id !== centerFilter) return false
        return true
      })
      .sort((a, b) => {
        const d = a.date.localeCompare(b.date)
        return d !== 0 ? d : a.employment_id.localeCompare(b.employment_id)
      })
      .map(wd => {
        const emp    = MOCK_EMPLOYMENTS.find(e => e.id === wd.employment_id)!
        const center = MOCK_CENTERS.find(c => c.id === emp.center_id)!
        return {
          wd,
          emp,
          center,
          clockIn:  getClockIn(wd.employment_id, wd.date),
          clockOut: getClockOut(wd.employment_id, wd.date),
        }
      })
  }, [centerFilter, employeeFilter, dateFrom, dateTo])

  // ── Summary KPIs ──────────────────────────────────────────────────────────
  const totalPlanned   = rows.reduce((s, r) => s + r.wd.planned_hours, 0)
  const totalActual    = rows.reduce((s, r) => s + (r.wd.actual_hours ?? 0), 0)
  const totalIncidents = rows.reduce((s, r) => s + r.wd.incident_count, 0)
  const uniqueEmps     = new Set(rows.map(r => r.emp.id)).size

  // ── Audit timestamp ───────────────────────────────────────────────────────
  const generatedAt = format(new Date('2026-03-21T14:32:00'), "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-neutral-100">

      {/* ── Page header ── */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-950 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-neutral-900">Registro de Jornada</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-navy-950 text-white uppercase">
                  Modo Inspección
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-neutral-100 text-neutral-500 border border-neutral-200 uppercase">
                  RDL 8/2019
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Vista de sólo lectura · Todos los accesos quedan registrados
              </p>
            </div>
          </div>

          {/* Export actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 hover:bg-neutral-50 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-navy-950 rounded-md hover:bg-navy-900 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Exportar PDF oficial
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 mt-4">
          {/* Centro */}
          <div className="relative">
            <select
              value={centerFilter}
              onChange={e => setCenterFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-navy-500/30 transition-colors cursor-pointer"
            >
              <option value="all">Todos los centros</option>
              {MOCK_CENTERS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>

          {/* Empleado */}
          <div className="relative">
            <select
              value={employeeFilter}
              onChange={e => setEmployeeFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-navy-500/30 transition-colors cursor-pointer"
            >
              <option value="all">Todos los empleados</option>
              {MOCK_EMPLOYMENTS.map(e => (
                <option key={e.id} value={e.id}>{e.person.legal_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="px-2 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-navy-500/30 transition-colors"
            />
            <span className="text-xs text-neutral-400">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="px-2 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-navy-500/30 transition-colors"
            />
          </div>

          {/* Result count */}
          <span className="ml-auto text-xs text-neutral-400">
            {rows.length} {rows.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-3">
        {[
          { icon: Users,        label: 'Empleados',        value: String(uniqueEmps),                  sub: 'en el período'    },
          { icon: CalendarDays, label: 'Hs. planificadas', value: formatHours(totalPlanned),           sub: 'según turno'      },
          { icon: Clock,        label: 'Hs. reales',       value: formatHours(totalActual),            sub: 'registradas'      },
          { icon: AlertCircle,  label: 'Incidencias',      value: String(totalIncidents),              sub: 'en el período',
            warn: totalIncidents > 0 },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-lg border border-neutral-200 px-4 py-3 flex items-center gap-3 shadow-card">
            <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
              kpi.warn ? 'bg-warning-50' : 'bg-neutral-50'
            }`}>
              <kpi.icon className={`w-4 h-4 ${kpi.warn ? 'text-warning-600' : 'text-neutral-500'}`} />
            </div>
            <div>
              <p className="text-base font-bold font-mono tabular-nums text-neutral-900 leading-none">{kpi.value}</p>
              <p className="text-2xs text-neutral-500 mt-0.5">{kpi.label} · {kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-card overflow-hidden">

          {/* Header */}
          <div className={`grid ${COL} gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200`}>
            {[
              'Empleado', 'NIF', 'Centro', 'Fecha',
              'Plan.', 'Entrada', 'Salida', 'Real', 'Desv.',
              'Inc.', 'Estado',
            ].map(h => (
              <span key={h} className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <div className="py-16 text-center">
              <Shield className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Sin registros para los filtros seleccionados</p>
            </div>
          ) : (
            rows.map(({ wd, emp, center, clockIn, clockOut }) => {
              const dayLabel = format(parseISO(wd.date), 'EEE d MMM', { locale: es })
              const hasDeviation = wd.deviation_hours !== null && Math.abs(wd.deviation_hours) >= 0.1
              const deviationClass = !hasDeviation
                ? 'text-neutral-400'
                : wd.deviation_hours! > 0
                ? 'text-warning-600'
                : 'text-warning-600'

              return (
                <div
                  key={wd.id}
                  className={`grid ${COL} gap-2 items-center px-4 py-2.5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors ${
                    wd.incident_count > 0 ? 'bg-warning-50/30' : ''
                  }`}
                >
                  {/* Empleado */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: emp.person.avatar_color }}
                    >
                      {emp.person.avatar_initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-900 truncate leading-none">{emp.person.legal_name}</p>
                      <p className="text-[10px] text-neutral-400 truncate leading-none mt-0.5">{emp.role}</p>
                    </div>
                  </div>

                  {/* NIF */}
                  <span className="text-xs font-mono text-neutral-500">{emp.person.national_id}</span>

                  {/* Centro */}
                  <span className="text-xs text-neutral-600 truncate">{center.name}</span>

                  {/* Fecha */}
                  <span className="text-xs text-neutral-700 capitalize">{dayLabel}</span>

                  {/* Plan. */}
                  <span className="text-xs font-mono text-neutral-600 tabular-nums">
                    {wd.planned_hours > 0 ? formatHours(wd.planned_hours) : '—'}
                  </span>

                  {/* Entrada */}
                  <span className="text-xs font-mono text-neutral-700 tabular-nums">
                    {clockIn ?? '—'}
                  </span>

                  {/* Salida */}
                  <span className="text-xs font-mono text-neutral-700 tabular-nums">
                    {clockOut ?? '—'}
                  </span>

                  {/* Real */}
                  <span className={`text-xs font-mono tabular-nums font-semibold ${
                    wd.actual_hours === null ? 'text-neutral-400' : 'text-neutral-900'
                  }`}>
                    {wd.actual_hours === null ? '—' : formatHours(wd.actual_hours)}
                  </span>

                  {/* Desv. */}
                  <span className={`text-xs font-mono tabular-nums ${deviationClass}`}>
                    {wd.deviation_hours === null ? '—'
                      : !hasDeviation ? '≈ 0'
                      : formatDeviation(Math.round(wd.deviation_hours * 60))}
                  </span>

                  {/* Inc. */}
                  <span className="flex items-center justify-center">
                    {wd.incident_count > 0 ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-warning-700">
                        <AlertCircle className="w-3 h-3" />
                        {wd.incident_count}
                      </span>
                    ) : (
                      <span className="text-neutral-200">—</span>
                    )}
                  </span>

                  {/* Estado */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                    wd.status === 'approved'
                      ? 'text-success-700'
                      : 'text-neutral-500'
                  }`}>
                    {wd.status === 'approved'
                      ? <><CheckCircle2 className="w-3 h-3 text-success-500" />Aprobado</>
                      : <><Clock className="w-3 h-3 text-neutral-400" />Pendiente</>
                    }
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* ── Audit footer ── */}
        <div className="mt-3 px-1 flex items-center justify-between">
          <p className="text-[10px] text-neutral-400">
            Registro generado el <span className="font-medium text-neutral-600">{generatedAt}</span>
            {' '}· Inspector: <span className="font-medium text-neutral-600">Sistema (sólo lectura)</span>
          </p>
          <p className="text-[10px] font-mono text-neutral-400">
            SHA-256: a4b7c2d1e8f3…9d0e
          </p>
        </div>
      </div>
    </div>
  )
}
