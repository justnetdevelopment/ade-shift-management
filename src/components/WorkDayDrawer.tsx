import { useState } from 'react'
import { X, AlertCircle, CheckCircle2, Clock, FileSignature, Lock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type {
  Employment,
  EmployeeClosure,
  EmployeeClosureStatus,
  ClosureStatus,
  WorkDay,
} from '../types'
import { MOCK_CENTERS } from '../mock-data'
import { formatDeviation, formatHours } from '../utils'

// ─── Config ───────────────────────────────────────────────────────────────────

const DAY_STATUS_STYLE = {
  pending:  { dot: 'bg-neutral-300', text: 'text-neutral-500', label: 'Pendiente' },
  approved: { dot: 'bg-success-500', text: 'text-success-700', label: 'Aprobado'  },
}

// What action does this drawer's CTA perform, given the period+employee state?
type DrawerAction =
  | { kind: 'approve_manager';  label: string }
  | { kind: 'validate_hr';      label: string }
  | { kind: 'sign_employee';    label: string }
  | { kind: 'readonly';         label: string }

function resolveAction(periodStatus: ClosureStatus, empStatus: EmployeeClosureStatus): DrawerAction {
  if (periodStatus === 'manager_review'     && empStatus === 'pending')           return { kind: 'approve_manager', label: 'Aprobar días del empleado' }
  if (periodStatus === 'hr_validation'      && empStatus === 'manager_approved')  return { kind: 'validate_hr',     label: 'Validar como RR.HH.' }
  if (periodStatus === 'employee_signature' && empStatus === 'hr_approved')       return { kind: 'sign_employee',   label: 'Registrar firma del empleado' }
  return { kind: 'readonly', label: 'Solo lectura' }
}

function nextEmployeeStatus(action: DrawerAction['kind']): EmployeeClosureStatus {
  if (action === 'approve_manager') return 'manager_approved'
  if (action === 'validate_hr')     return 'hr_approved'
  if (action === 'sign_employee')   return 'employee_signed'
  return 'locked'
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkDayDrawerProps {
  closure:       EmployeeClosure | null
  employment:    Employment | null
  workDays:      WorkDay[]
  periodStatus:  ClosureStatus
  periodLabel:   string
  isOpen:        boolean
  onClose:       () => void
  onAdvance:     (empId: string, newStatus: EmployeeClosureStatus, note: string) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkDayDrawer({
  closure,
  employment,
  workDays,
  periodStatus,
  periodLabel,
  isOpen,
  onClose,
  onAdvance,
}: WorkDayDrawerProps) {
  const [note, setNote] = useState('')

  if (!isOpen || !closure || !employment) return null

  const empWorkDays = workDays
    .filter(w => w.employment_id === employment.id)
    .sort((a, b) => a.date.localeCompare(b.date))

  const center = MOCK_CENTERS.find(c => c.id === employment!.center_id)
  const action = resolveAction(periodStatus, closure.status)
  const isReadonly = action.kind === 'readonly'

  function handleAdvance() {
    onAdvance(employment!.id, nextEmployeeStatus(action.kind), note)
    onClose()
  }

  // ── Status header banner ──────────────────────────────────────────────────
  const statusBanner = {
    pending:          { bg: 'bg-neutral-50  border-neutral-200', icon: <Clock         className="w-4 h-4 text-neutral-500"  />, text: 'Pendiente de revisión'     },
    manager_approved: { bg: 'bg-info-50     border-info-200',    icon: <CheckCircle2  className="w-4 h-4 text-info-600"      />, text: 'Aprobado por responsable'   },
    hr_approved:      { bg: 'bg-shift-50    border-shift-200',   icon: <CheckCircle2  className="w-4 h-4 text-shift-600"     />, text: 'Validado por RR.HH.'        },
    employee_signed:  { bg: 'bg-success-50  border-success-200', icon: <FileSignature className="w-4 h-4 text-success-600"   />, text: closure.signed_at ? `Firmado el ${format(parseISO(closure.signed_at), "d MMM", { locale: es })}` : 'Firmado por el empleado' },
    locked:           { bg: 'bg-navy-50     border-navy-200',    icon: <Lock          className="w-4 h-4 text-navy-600"      />, text: 'Período cerrado'            },
  }[closure.status]

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed right-0 top-0 h-full w-[440px] bg-white shadow-overlay z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de cierre del empleado"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-200">
          <div>
            <p className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">
              {periodLabel} · Cierre mensual
            </p>
            <p className="text-sm font-semibold text-neutral-900 leading-tight">
              {employment.person.legal_name}
            </p>
            <p className="text-xs text-neutral-500">{employment.role} · {center?.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Status banner ── */}
        <div className={`flex items-center gap-2.5 px-5 py-2.5 border-b ${statusBanner.bg}`}>
          {statusBanner.icon}
          <span className="text-xs font-semibold text-neutral-700">{statusBanner.text}</span>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-100">

          {/* Period summary */}
          <section className="px-5 py-4">
            <h3 className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Resumen del período
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Planificadas', value: `${closure.total_planned_hours}h`, sub: `${employment.contracted_hours_week}h contrato` },
                { label: 'Reales',       value: `${closure.total_actual_hours}h`,  sub: null },
                {
                  label: 'Desviación',
                  value: Math.abs(closure.total_deviation_hours) < 0.1
                    ? '≈ 0h'
                    : formatDeviation(Math.round(closure.total_deviation_hours * 60)),
                  sub: null,
                  valueClass: closure.total_deviation_hours > 0.5
                    ? 'text-warning-600'
                    : closure.total_deviation_hours < -0.5
                    ? 'text-warning-600'
                    : 'text-success-600',
                },
              ].map(card => (
                <div key={card.label} className="rounded-lg bg-neutral-50 border border-neutral-200 px-3 py-2.5 text-center">
                  <p className="text-2xs text-neutral-500 mb-1">{card.label}</p>
                  <p className={`text-base font-bold font-mono tabular-nums ${(card as any).valueClass ?? 'text-neutral-900'}`}>
                    {card.value}
                  </p>
                  {card.sub && <p className="text-2xs text-neutral-400 mt-0.5">{card.sub}</p>}
                </div>
              ))}
            </div>

            {/* Contract alert for Carlos Ruiz (hours exceed contract) */}
            {closure.total_planned_hours > employment.contracted_hours_week && (
              <div className="flex items-start gap-2 mt-3 px-3 py-2.5 rounded-md bg-error-50 border border-error-200">
                <AlertCircle className="w-4 h-4 text-error-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-error-800">
                  <span className="font-semibold">Exceso de horas contractuales — </span>
                  {closure.total_planned_hours}h planificadas vs {employment.contracted_hours_week}h contratadas
                  ({closure.total_planned_hours - employment.contracted_hours_week}h extra)
                </p>
              </div>
            )}

            {closure.pending_incidents > 0 && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-md bg-warning-50 border border-warning-200">
                <AlertCircle className="w-3.5 h-3.5 text-warning-600 flex-shrink-0" />
                <p className="text-xs text-warning-800">
                  <span className="font-semibold">{closure.pending_incidents} incidencia{closure.pending_incidents > 1 ? 's' : ''} pendiente{closure.pending_incidents > 1 ? 's' : ''}</span>
                  {' '}de resolución
                </p>
              </div>
            )}
          </section>

          {/* WorkDays table */}
          <section className="px-5 py-4">
            <h3 className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-3">
              Días trabajados
            </h3>

            {empWorkDays.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-4">Sin registros para este período</p>
            ) : (
              <div className="space-y-1">
                {/* Mini table header */}
                <div className="grid grid-cols-[80px_56px_56px_56px_70px] gap-2 px-1 pb-1">
                  {['Fecha', 'Plan.', 'Real', 'Desv.', 'Estado'].map(h => (
                    <span key={h} className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide">{h}</span>
                  ))}
                </div>

                {empWorkDays.map(wd => {
                  const day = parseISO(wd.date)
                  const dayLabel = format(day, "EEE d MMM", { locale: es })
                  const style = DAY_STATUS_STYLE[wd.status]

                  return (
                    <div
                      key={wd.id}
                      className={`grid grid-cols-[80px_56px_56px_56px_70px] gap-2 items-center px-2 py-2 rounded-md ${
                        wd.incident_count > 0 ? 'bg-warning-50/60' : 'bg-neutral-50/60'
                      }`}
                    >
                      <span className="text-xs text-neutral-700 capitalize truncate font-medium">{dayLabel}</span>

                      <span className="text-xs font-mono text-neutral-600 tabular-nums">
                        {formatHours(wd.planned_hours)}
                      </span>

                      <span className="text-xs font-mono text-neutral-900 tabular-nums">
                        {wd.actual_hours === null ? '—' : formatHours(wd.actual_hours)}
                      </span>

                      <span className={`text-xs font-mono tabular-nums ${
                        wd.deviation_hours === null        ? 'text-neutral-400' :
                        Math.abs(wd.deviation_hours) < 0.1 ? 'text-neutral-400' :
                        wd.deviation_hours > 0             ? 'text-warning-600' :
                                                             'text-warning-600'
                      }`}>
                        {wd.deviation_hours === null ? '—'
                          : Math.abs(wd.deviation_hours) < 0.1 ? '≈0'
                          : formatDeviation(Math.round(wd.deviation_hours * 60))}
                      </span>

                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                        <span className={`text-2xs font-medium ${style.text}`}>{style.label}</span>
                        {wd.incident_count > 0 && (
                          <AlertCircle className="w-3 h-3 text-warning-500 ml-0.5" />
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Adjustment note */}
          <section className="px-5 py-4">
            <h3 className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
              Nota de ajuste
            </h3>
            {isReadonly ? (
              <p className="text-xs text-neutral-600 bg-neutral-50 rounded-md border border-neutral-200 px-3 py-2.5 min-h-[56px]">
                {closure.adjustment_note || <span className="text-neutral-400 italic">Sin notas</span>}
              </p>
            ) : (
              <textarea
                value={note || closure.adjustment_note}
                onChange={e => setNote(e.target.value)}
                placeholder="Añade notas o justificaciones para este período…"
                rows={3}
                className="w-full px-3 py-2 text-xs text-neutral-900 border border-neutral-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent placeholder:text-neutral-400 resize-none"
              />
            )}
          </section>
        </div>

        {/* ── Footer action ── */}
        <div className="px-5 py-4 border-t border-neutral-200">
          {!isReadonly ? (
            <button
              onClick={handleAdvance}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-shift-600 rounded-lg hover:bg-shift-700 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {action.label}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2.5 text-sm text-neutral-400">
              <Lock className="w-4 h-4" />
              <span>Período en solo lectura</span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
