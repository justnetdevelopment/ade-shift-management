import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  AlertCircle,
} from 'lucide-react'
import { MOCK_EMPLOYMENTS, MOCK_CENTERS, MOCK_WORK_DAYS, MOCK_SHIFTS } from '../mock-data'
import { formatHours } from '../utils'

// ─── Config ───────────────────────────────────────────────────────────────────

// Approximate hourly gross rates per employee (€/h)
const HOURLY_RATES: Record<string, number> = {
  e1: 15.2,   // Jefe de sala
  e2: 10.8,   // Camarero
  e3: 12.5,   // Cocinero
  e4: 9.5,    // Ayudante cocina
  e5: 10.8,   // Camarero
  e6: 14.0,   // Encargado
}

// Social security employer contribution (~30%)
const SS_RATE = 0.30

// ─── Helpers ──────────────────────────────────────────────────────────────────

function costOf(hours: number, empId: string): number {
  const rate = HOURLY_RATES[empId] ?? 10
  return hours * rate * (1 + SS_RATE)
}

function fmtEur(value: number): string {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function DeviationBadge({ value }: { value: number }) {
  if (Math.abs(value) < 1) {
    return <span className="text-neutral-400 text-xs font-mono">≈ 0</span>
  }
  const positive = value > 0
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span className={`flex items-center gap-0.5 text-xs font-mono font-semibold ${positive ? 'text-warning-600' : 'text-success-600'}`}>
      <Icon className="w-3 h-3" />
      {positive ? '+' : '−'}{fmtEur(Math.abs(value))}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CostsPage() {
  const [centerFilter, setCenterFilter] = useState('all')
  const [view,         setView]         = useState<'employee' | 'center'>('employee')

  // ── Per-employee cost rows ────────────────────────────────────────────────
  const employeeRows = useMemo(() => {
    return MOCK_EMPLOYMENTS
      .filter(emp => centerFilter === 'all' || emp.center_id === centerFilter)
      .map(emp => {
        const rate    = HOURLY_RATES[emp.id] ?? 10
        const wds     = MOCK_WORK_DAYS.filter(w => w.employment_id === emp.id)
        const shifts  = MOCK_SHIFTS.filter(s => s.employment_id === emp.id)

        const plannedH = shifts.reduce((s, sh) => s + sh.duration_hours, 0)
        const actualH  = wds.reduce((s, w) => s + (w.actual_hours ?? 0), 0)

        const plannedCost = costOf(plannedH, emp.id)
        const actualCost  = costOf(actualH, emp.id)
        const deviation   = actualCost - plannedCost

        const center = MOCK_CENTERS.find(c => c.id === emp.center_id)!

        return { emp, center, rate, plannedH, actualH, plannedCost, actualCost, deviation }
      })
  }, [centerFilter])

  // ── Per-center cost rows ──────────────────────────────────────────────────
  const centerRows = useMemo(() => {
    return MOCK_CENTERS
      .filter(c => centerFilter === 'all' || c.id === centerFilter)
      .map(center => {
        const emps = MOCK_EMPLOYMENTS.filter(e => e.center_id === center.id)
        const rows = emps.map(emp => {
          const wds    = MOCK_WORK_DAYS.filter(w => w.employment_id === emp.id)
          const shifts = MOCK_SHIFTS.filter(s => s.employment_id === emp.id)
          const ph     = shifts.reduce((s, sh) => s + sh.duration_hours, 0)
          const ah     = wds.reduce((s, w) => s + (w.actual_hours ?? 0), 0)
          return { ph, ah, pc: costOf(ph, emp.id), ac: costOf(ah, emp.id) }
        })
        return {
          center,
          empCount:    emps.length,
          plannedH:    rows.reduce((s, r) => s + r.ph, 0),
          actualH:     rows.reduce((s, r) => s + r.ah, 0),
          plannedCost: rows.reduce((s, r) => s + r.pc, 0),
          actualCost:  rows.reduce((s, r) => s + r.ac, 0),
          deviation:   rows.reduce((s, r) => s + (r.ac - r.pc), 0),
        }
      })
  }, [centerFilter])

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalPlanned   = employeeRows.reduce((s, r) => s + r.plannedCost, 0)
  const totalActual    = employeeRows.reduce((s, r) => s + r.actualCost, 0)
  const totalDeviation = totalActual - totalPlanned
  const totalPlannedH  = employeeRows.reduce((s, r) => s + r.plannedH, 0)
  const totalActualH   = employeeRows.reduce((s, r) => s + r.actualH, 0)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-neutral-100">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-success-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-neutral-900">Costes laborales</h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Coste planificado vs. real · Marzo 2026 · Incluye SS empleador (~30%)
              </p>
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 gap-0.5">
            {(['employee', 'center'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  view === v ? 'bg-white text-neutral-900 shadow-card' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {v === 'employee' ? 'Por empleado' : 'Por centro'}
              </button>
            ))}
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative">
            <select
              value={centerFilter}
              onChange={e => setCenterFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-shift-500/30 cursor-pointer"
            >
              <option value="all">Todos los centros</option>
              {MOCK_CENTERS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>
          <span className="text-xs text-neutral-400 ml-auto">Datos de muestra — semana 17–21 mar 2026</span>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-3">
        {[
          {
            label: 'Coste planificado',
            value: fmtEur(totalPlanned),
            sub:   formatHours(totalPlannedH) + ' planificadas',
            icon:  BarChart3,
            color: 'text-neutral-700',
            bg:    'bg-neutral-100',
            border:'border-neutral-200',
          },
          {
            label: 'Coste real',
            value: fmtEur(totalActual),
            sub:   formatHours(totalActualH) + ' registradas',
            icon:  BarChart3,
            color: 'text-info-600',
            bg:    'bg-info-50',
            border:'border-info-200',
          },
          {
            label: 'Desviación total',
            value: (totalDeviation >= 0 ? '+' : '') + fmtEur(totalDeviation),
            sub:   totalDeviation > 0 ? 'Sobrecoste' : totalDeviation < 0 ? 'Ahorro' : 'Exacto',
            icon:  totalDeviation > 0 ? TrendingUp : totalDeviation < 0 ? TrendingDown : Minus,
            color: Math.abs(totalDeviation) < 1 ? 'text-success-600' : totalDeviation > 0 ? 'text-warning-600' : 'text-success-600',
            bg:    Math.abs(totalDeviation) < 1 ? 'bg-success-50' : totalDeviation > 0 ? 'bg-warning-50' : 'bg-success-50',
            border:Math.abs(totalDeviation) < 1 ? 'border-success-200' : totalDeviation > 0 ? 'border-warning-200' : 'border-success-200',
          },
          {
            label: 'Ratio desviación',
            value: totalPlanned > 0 ? `${((totalDeviation / totalPlanned) * 100).toFixed(1)}%` : '—',
            sub:   'sobre coste planificado',
            icon:  AlertCircle,
            color: Math.abs(totalDeviation / totalPlanned) < 0.03 ? 'text-success-600' : 'text-warning-600',
            bg:    Math.abs(totalDeviation / totalPlanned) < 0.03 ? 'bg-success-50' : 'bg-warning-50',
            border:Math.abs(totalDeviation / totalPlanned) < 0.03 ? 'border-success-200' : 'border-warning-200',
          },
        ].map(kpi => (
          <div key={kpi.label} className={`bg-white rounded-lg border ${kpi.border} px-4 py-3 flex items-center gap-3 shadow-card`}>
            <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${kpi.bg}`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div>
              <p className={`text-base font-bold font-mono tabular-nums leading-none ${kpi.color}`}>{kpi.value}</p>
              <p className="text-2xs text-neutral-500 mt-0.5">{kpi.label} · {kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto px-6 pb-4">

        {view === 'employee' ? (
          <div className="bg-white rounded-lg border border-neutral-200 shadow-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_80px_110px_110px_120px_80px] gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
              {['Empleado', 'Tarifa', 'H. Plan.', 'Coste plan.', 'H. Real', 'Coste real', 'Desviación'].map(h => (
                <span key={h} className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>

            {employeeRows.map(({ emp, center, rate, plannedH, actualH, plannedCost, actualCost, deviation }) => (
              <div
                key={emp.id}
                className={`grid grid-cols-[1fr_80px_80px_110px_110px_120px_80px] gap-2 items-center px-4 py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors ${
                  deviation > 5 ? 'bg-warning-50/20' : deviation < -5 ? 'bg-success-50/20' : ''
                }`}
              >
                {/* Employee */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ backgroundColor: emp.person.avatar_color }}
                  >
                    {emp.person.avatar_initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 truncate leading-none">{emp.person.legal_name}</p>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5 leading-none">{emp.role} · {center.name}</p>
                  </div>
                </div>

                {/* Rate */}
                <span className="text-xs font-mono text-neutral-500">{rate.toFixed(1)} €/h</span>

                {/* Planned hours */}
                <span className="text-xs font-mono text-neutral-600 tabular-nums">{formatHours(plannedH)}</span>

                {/* Planned cost */}
                <span className="text-xs font-mono text-neutral-700 tabular-nums font-medium">{fmtEur(plannedCost)}</span>

                {/* Actual hours */}
                <span className="text-xs font-mono text-neutral-600 tabular-nums">{formatHours(actualH)}</span>

                {/* Actual cost */}
                <span className="text-xs font-mono font-semibold text-neutral-900 tabular-nums">{fmtEur(actualCost)}</span>

                {/* Deviation */}
                <DeviationBadge value={deviation} />
              </div>
            ))}

            {/* Totals row */}
            <div className="grid grid-cols-[1fr_80px_80px_110px_110px_120px_80px] gap-2 items-center px-4 py-3 bg-neutral-50 border-t border-neutral-200">
              <span className="text-xs font-bold text-neutral-900">Total</span>
              <span />
              <span className="text-xs font-bold font-mono text-neutral-700 tabular-nums">{formatHours(totalPlannedH)}</span>
              <span className="text-xs font-bold font-mono text-neutral-900 tabular-nums">{fmtEur(totalPlanned)}</span>
              <span className="text-xs font-bold font-mono text-neutral-700 tabular-nums">{formatHours(totalActualH)}</span>
              <span className="text-xs font-bold font-mono text-neutral-900 tabular-nums">{fmtEur(totalActual)}</span>
              <DeviationBadge value={totalDeviation} />
            </div>
          </div>

        ) : (

          <div className="bg-white rounded-lg border border-neutral-200 shadow-card overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_100px_120px_100px_120px_120px] gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
              {['Centro', 'Empl.', 'H. Plan.', 'Coste plan.', 'H. Real', 'Coste real', 'Desviación'].map(h => (
                <span key={h} className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</span>
              ))}
            </div>

            {centerRows.map(({ center, empCount, plannedH, actualH, plannedCost, actualCost, deviation }) => (
              <div
                key={center.id}
                className={`grid grid-cols-[1fr_60px_100px_120px_100px_120px_120px] gap-2 items-center px-4 py-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors ${
                  deviation > 10 ? 'bg-warning-50/20' : ''
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-neutral-900">{center.name}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Grupo Arenal · {center.company_id}</p>
                </div>
                <span className="text-xs font-mono text-neutral-500 tabular-nums">{empCount}</span>
                <span className="text-xs font-mono text-neutral-600 tabular-nums">{formatHours(plannedH)}</span>
                <span className="text-xs font-mono text-neutral-700 tabular-nums font-medium">{fmtEur(plannedCost)}</span>
                <span className="text-xs font-mono text-neutral-600 tabular-nums">{formatHours(actualH)}</span>
                <span className="text-xs font-mono font-semibold text-neutral-900 tabular-nums">{fmtEur(actualCost)}</span>
                <DeviationBadge value={deviation} />
              </div>
            ))}

            {/* Totals */}
            <div className="grid grid-cols-[1fr_60px_100px_120px_100px_120px_120px] gap-2 items-center px-4 py-3 bg-neutral-50 border-t border-neutral-200">
              <span className="text-xs font-bold text-neutral-900">Total grupo</span>
              <span className="text-xs font-bold font-mono text-neutral-700 tabular-nums">{employeeRows.length}</span>
              <span className="text-xs font-bold font-mono text-neutral-700 tabular-nums">{formatHours(totalPlannedH)}</span>
              <span className="text-xs font-bold font-mono text-neutral-900 tabular-nums">{fmtEur(totalPlanned)}</span>
              <span className="text-xs font-bold font-mono text-neutral-700 tabular-nums">{formatHours(totalActualH)}</span>
              <span className="text-xs font-bold font-mono text-neutral-900 tabular-nums">{fmtEur(totalActual)}</span>
              <DeviationBadge value={totalDeviation} />
            </div>
          </div>
        )}

        <p className="mt-3 px-1 text-[10px] text-neutral-400">
          Costes brutos estimados (tarifa × horas) + cotización empresarial SS (30%). No incluye complementos ni pagas extra.
        </p>
      </div>
    </div>
  )
}
