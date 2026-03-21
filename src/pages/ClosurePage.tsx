import { useState } from 'react'
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  AlertTriangle,
  FileDown,
  ChevronDown,
  Lock,
  FileSignature,
  ArrowRight,
} from 'lucide-react'
import type {
  ClosurePeriod,
  ClosureStatus,
  EmployeeClosureStatus,
} from '../types'
import {
  MOCK_CLOSURE_PERIOD,
  MOCK_EMPLOYMENTS,
  MOCK_WORK_DAYS,
} from '../mock-data'
import { WorkDayDrawer } from '../components/WorkDayDrawer'
import { formatDeviation } from '../utils'

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS: { id: ClosureStatus; label: string; shortLabel: string; icon: typeof CheckCircle2 }[] = [
  { id: 'pre_calculation',    label: 'Pre-cálculo',             shortLabel: 'Pre-cálculo',   icon: CheckCircle2   },
  { id: 'manager_review',     label: 'Revisión responsable',    shortLabel: 'Responsable',   icon: CheckCircle2   },
  { id: 'hr_validation',      label: 'Validación RR.HH.',       shortLabel: 'RR.HH.',        icon: CheckCircle2   },
  { id: 'employee_signature', label: 'Firma del empleado',      shortLabel: 'Firma',         icon: FileSignature  },
  { id: 'locked',             label: 'Período cerrado',         shortLabel: 'Cerrado',       icon: Lock           },
]

const STEP_ORDER: ClosureStatus[] = [
  'pre_calculation', 'manager_review', 'hr_validation', 'employee_signature', 'locked',
]

function stepIndex(s: ClosureStatus) { return STEP_ORDER.indexOf(s) }

function nextPeriodStatus(s: ClosureStatus): ClosureStatus | null {
  const idx = stepIndex(s)
  return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : null
}

// ─── Employee closure status config ──────────────────────────────────────────

const EMP_STATUS_CONFIG: Record<EmployeeClosureStatus, {
  label:      string
  badgeClass: string
  dotClass:   string
}> = {
  pending:          { label: 'Pendiente',         badgeClass: 'bg-neutral-100 text-neutral-600 ring-neutral-200', dotClass: 'bg-neutral-400'  },
  manager_approved: { label: 'Aprobado resp.',    badgeClass: 'bg-info-50 text-info-700 ring-info-200',           dotClass: 'bg-info-500'     },
  hr_approved:      { label: 'Validado RR.HH.',   badgeClass: 'bg-shift-50 text-shift-700 ring-shift-200',        dotClass: 'bg-shift-500'    },
  employee_signed:  { label: 'Firmado',           badgeClass: 'bg-success-100 text-success-700 ring-success-200', dotClass: 'bg-success-500'  },
  locked:           { label: 'Cerrado',           badgeClass: 'bg-navy-100 text-navy-700 ring-navy-200',          dotClass: 'bg-navy-600'     },
}

// What the table's action button says for each (period, employee) combination
function actionLabel(periodStatus: ClosureStatus, empStatus: EmployeeClosureStatus): { label: string; variant: 'primary' | 'done' | 'muted' } {
  if (periodStatus === 'manager_review'     && empStatus === 'pending')          return { label: 'Revisar',         variant: 'primary' }
  if (periodStatus === 'hr_validation'      && empStatus === 'manager_approved') return { label: 'Validar',          variant: 'primary' }
  if (periodStatus === 'employee_signature' && empStatus === 'hr_approved')      return { label: 'Registrar firma',  variant: 'primary' }
  if (['manager_approved', 'hr_approved', 'employee_signed', 'locked'].includes(empStatus)) {
    return { label: EMP_STATUS_CONFIG[empStatus].label, variant: 'done' }
  }
  return { label: 'Ver detalle', variant: 'muted' }
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStatus }: { currentStatus: ClosureStatus }) {
  const current = stepIndex(currentStatus)

  return (
    <div className="flex items-center px-6 py-4 bg-white border-b border-neutral-200">
      {STEPS.map((step, i) => {
        const isPast    = i < current
        const isCurrent = i === current
        void (i > current) // isFuture — reserved for future styling
        const Icon      = step.icon

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Circle + label */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isPast    ? 'bg-success-500'     :
                isCurrent ? 'bg-shift-600'       :
                            'bg-neutral-200'
              }`}>
                {isPast ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <Icon className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Circle className="w-3 h-3 text-neutral-400" />
                )}
              </div>
              <span className={`text-2xs font-semibold whitespace-nowrap ${
                isPast    ? 'text-success-600' :
                isCurrent ? 'text-shift-700'   :
                            'text-neutral-400'
              }`}>
                {step.shortLabel}
              </span>
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-4 ${isPast ? 'bg-success-300' : 'bg-neutral-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Summary stat card ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 px-4 py-3 shadow-card">
      <p className="text-2xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold tabular-nums mt-1 ${color ?? 'text-neutral-900'}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABLE_GRID = 'grid grid-cols-[minmax(160px,1fr)_88px_88px_80px_64px_140px_120px]'

export function ClosurePage() {
  const [period,      setPeriod]      = useState<ClosurePeriod>(MOCK_CLOSURE_PERIOD)
  const [drawerEmpId, setDrawerEmpId] = useState<string | null>(null)
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  const closures  = period.employee_closures
  // Summary stats
  const pendingCount  = closures.filter(c => c.status === 'pending').length
  const advancedCount = closures.filter(c => c.status !== 'pending').length
  const incidentCount = closures.reduce((a, c) => a + c.pending_incidents, 0)

  // Can the period advance to next stage?
  const REQUIRED: Record<ClosureStatus, EmployeeClosureStatus[]> = {
    pre_calculation:    ['manager_approved', 'hr_approved', 'employee_signed', 'locked'],
    manager_review:     ['manager_approved', 'hr_approved', 'employee_signed', 'locked'],
    hr_validation:      ['hr_approved', 'employee_signed', 'locked'],
    employee_signature: ['employee_signed', 'locked'],
    locked:             ['locked'],
  }
  const requiredForCurrentStage = REQUIRED[period.status]

  const canAdvancePeriod =
    period.status !== 'locked' &&
    closures.every(c => requiredForCurrentStage.includes(c.status))

  function handleOpenDrawer(empId: string) {
    setDrawerEmpId(empId)
    setDrawerOpen(true)
  }

  function handleAdvanceEmployee(empId: string, newStatus: EmployeeClosureStatus, note: string) {
    setPeriod(prev => {
      const newClosures = prev.employee_closures.map(c =>
        c.employment_id === empId
          ? { ...c, status: newStatus, adjustment_note: note || c.adjustment_note }
          : c
      )
      return { ...prev, employee_closures: newClosures }
    })
  }

  function handleAdvancePeriod() {
    const next = nextPeriodStatus(period.status)
    if (!next) return
    setPeriod(prev => ({ ...prev, status: next }))
  }

  const selectedClosure    = closures.find(c => c.employment_id === drawerEmpId) ?? null
  const selectedEmployment = MOCK_EMPLOYMENTS.find(e => e.id === drawerEmpId) ?? null
  const selectedWorkDays   = MOCK_WORK_DAYS.filter(w => w.employment_id === drawerEmpId)

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-neutral-900">Cierre mensual</h1>
            {/* Period selector (mock — single period) */}
            <div className="relative">
              <button className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 transition-colors">
                {period.period_label}
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
              period.status === 'locked'
                ? 'bg-navy-100 text-navy-700 ring-navy-200'
                : 'bg-shift-50 text-shift-700 ring-shift-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${period.status === 'locked' ? 'bg-navy-600' : 'bg-shift-500'}`} />
              {STEPS.find(s => s.id === period.status)?.label ?? period.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Advance period button */}
            {canAdvancePeriod && period.status !== 'locked' && (
              <button
                onClick={handleAdvancePeriod}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-shift-600 rounded-md hover:bg-shift-700 transition-colors shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                Avanzar período
              </button>
            )}

            {/* Export buttons — only when locked */}
            {period.status === 'locked' && (
              <>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 hover:text-neutral-900 transition-colors">
                  <FileDown className="w-3.5 h-3.5" />
                  Exportar PDF
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 hover:text-neutral-900 transition-colors">
                  <FileDown className="w-3.5 h-3.5" />
                  Exportar CSV
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <StepIndicator currentStatus={period.status} />

      {/* ── Summary cards ── */}
      <div className="flex-shrink-0 px-4 py-3 grid grid-cols-4 gap-3">
        <StatCard label="Empleados"       value={closures.length} sub="en este período" />
        <StatCard label="Pendientes"      value={pendingCount}   sub="de revisión"   color={pendingCount  > 0 ? 'text-warning-600' : 'text-success-600'} />
        <StatCard label="Avanzados"       value={advancedCount}  sub="aprobados o más" />
        <StatCard label="Incidencias"     value={incidentCount}  sub="sin resolver"  color={incidentCount > 0 ? 'text-error-600'   : 'text-success-600'} />
      </div>

      {/* ── Banner when period can advance ── */}
      {canAdvancePeriod && period.status !== 'locked' && (
        <div className="flex-shrink-0 mx-4 mb-2 flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-success-50 border border-success-200">
          <CheckCircle2 className="w-4 h-4 text-success-600 flex-shrink-0" />
          <p className="text-xs text-success-800">
            <span className="font-semibold">Todos los empleados han completado esta etapa.</span>
            {' '}Puedes avanzar el período a la siguiente fase.
          </p>
        </div>
      )}

      {/* ── Employee table ── */}
      <div className="flex-1 overflow-auto mx-4 mb-4 rounded-lg border border-neutral-200 bg-white shadow-card">

        {/* Table header */}
        <div className={`${TABLE_GRID} border-b border-neutral-200 bg-neutral-50`}>
          {['Empleado', 'Plan.', 'Real', 'Desv.', 'Incid.', 'Estado', ''].map((h, i) => (
            <div key={i} className={`px-3 py-2 text-2xs font-semibold text-neutral-500 uppercase tracking-wide ${i === 0 ? 'px-4' : i >= 1 && i <= 3 ? 'text-right' : ''}`}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {closures.map(closure => {
          const emp    = MOCK_EMPLOYMENTS.find(e => e.id === closure.employment_id)
          if (!emp) return null

          const statusCfg = EMP_STATUS_CONFIG[closure.status]
          const action    = actionLabel(period.status, closure.status)
          const devMins   = Math.round(closure.total_deviation_hours * 60)

          return (
            <div
              key={closure.employment_id}
              className={`${TABLE_GRID} items-center border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer`}
              onClick={() => handleOpenDrawer(emp.id)}
            >
              {/* Employee */}
              <div className="flex items-center gap-2.5 px-4 py-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
                  style={{ backgroundColor: emp.person.avatar_color }}
                >
                  {emp.person.avatar_initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate leading-tight">
                    {emp.person.legal_name.split(' ').slice(0, 2).join(' ')}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">{emp.role}</p>
                </div>
              </div>

              {/* Planned */}
              <div className="px-3 py-3 text-right">
                <span className="text-sm font-mono text-neutral-900 tabular-nums">
                  {closure.total_planned_hours}h
                </span>
                {closure.total_planned_hours > emp.contracted_hours_week && (
                  <AlertCircle className="w-3 h-3 text-error-500 inline ml-1" />
                )}
              </div>

              {/* Actual */}
              <div className="px-3 py-3 text-right">
                <span className="text-sm font-mono text-neutral-900 tabular-nums">
                  {closure.total_actual_hours}h
                </span>
              </div>

              {/* Deviation */}
              <div className="px-3 py-3 text-right">
                {Math.abs(devMins) < 6 ? (
                  <span className="text-sm font-mono text-neutral-400">≈0</span>
                ) : (
                  <span className={`text-sm font-mono font-medium tabular-nums ${
                    devMins > 30 || devMins < -30 ? 'text-warning-600' : 'text-neutral-500'
                  }`}>
                    {formatDeviation(devMins)}
                  </span>
                )}
              </div>

              {/* Incidents */}
              <div className="px-3 py-3 text-center">
                {closure.pending_incidents > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning-700">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {closure.pending_incidents}
                  </span>
                ) : (
                  <span className="text-xs text-neutral-300">—</span>
                )}
              </div>

              {/* Status badge */}
              <div className="px-3 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusCfg.badgeClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dotClass}`} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Action */}
              <div className="px-3 py-3" onClick={e => { e.stopPropagation(); handleOpenDrawer(emp.id) }}>
                <button className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                  action.variant === 'primary' ? 'bg-shift-600 text-white hover:bg-shift-700' :
                  action.variant === 'done'    ? 'bg-success-50 text-success-700 border border-success-200 cursor-default' :
                                                 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                }`}>
                  {action.label}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── WorkDay Drawer ── */}
      <WorkDayDrawer
        closure={selectedClosure}
        employment={selectedEmployment}
        workDays={selectedWorkDays}
        periodStatus={period.status}
        periodLabel={period.period_label}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAdvance={handleAdvanceEmployee}
      />
    </div>
  )
}
