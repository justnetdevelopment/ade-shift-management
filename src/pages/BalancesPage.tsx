import { useState, useMemo } from 'react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Wallet,
  AlertCircle,
  ChevronDown,
  Umbrella,
  CalendarDays,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { MOCK_EMPLOYMENTS, MOCK_CENTERS, MOCK_BALANCES } from '../mock-data'
import type { Balance, BalanceType } from '../types'
import { formatHours } from '../utils'

// ─── Config ───────────────────────────────────────────────────────────────────

const BALANCE_META: Record<BalanceType, {
  label: string
  shortLabel: string
  description: string
  icon: typeof Umbrella
  colorClass: string
  bgClass: string
  borderClass: string
  textClass: string
}> = {
  vacation: {
    label: 'Vacaciones',
    shortLabel: 'Vacac.',
    description: 'Días de vacaciones anuales',
    icon: Umbrella,
    colorClass: 'text-info-600',
    bgClass: 'bg-info-50',
    borderClass: 'border-info-200',
    textClass: 'text-info-700',
  },
  holiday_comp: {
    label: 'Comp. festivos',
    shortLabel: 'Festivos',
    description: 'Compensación por trabajo en festivo',
    icon: CalendarDays,
    colorClass: 'text-shift-600',
    bgClass: 'bg-shift-50',
    borderClass: 'border-shift-200',
    textClass: 'text-shift-700',
  },
  overtime: {
    label: 'Banco de horas',
    shortLabel: 'H. extra',
    description: 'Horas extra validadas pendientes',
    icon: TrendingUp,
    colorClass: 'text-success-600',
    bgClass: 'bg-success-50',
    borderClass: 'border-success-200',
    textClass: 'text-success-700',
  },
  absence: {
    label: 'Ausencias',
    shortLabel: 'Ausenc.',
    description: 'Deuda por ausencias no justificadas',
    icon: TrendingDown,
    colorClass: 'text-error-600',
    bgClass: 'bg-error-50',
    borderClass: 'border-error-200',
    textClass: 'text-error-700',
  },
}

const BALANCE_TYPES: BalanceType[] = ['vacation', 'holiday_comp', 'overtime', 'absence']
const TODAY = '2026-03-21'
const EXPIRY_WARN_DAYS = 60

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntilExpiry(expiryDate: string): number {
  return differenceInDays(parseISO(expiryDate), parseISO(TODAY))
}

function isExpiryWarning(balance: Balance): boolean {
  if (!balance.expiry_date) return false
  if (balance.amount_hours <= 0) return false
  return daysUntilExpiry(balance.expiry_date) <= EXPIRY_WARN_DAYS
}

// ─── BalanceCell ──────────────────────────────────────────────────────────────

function BalanceCell({ balance }: { balance: Balance }) {
  const meta   = BALANCE_META[balance.type]
  const warn   = isExpiryWarning(balance)
  const isDebt = balance.amount_hours < 0

  if (balance.amount_hours === 0 && balance.accrued_hours === 0) {
    return <span className="text-xs text-neutral-300 font-mono">—</span>
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className={`text-sm font-bold font-mono tabular-nums ${
        isDebt ? 'text-error-600' : meta.colorClass
      }`}>
        {isDebt ? '−' : ''}{formatHours(Math.abs(balance.amount_hours))}
      </span>
      {balance.expiry_date && balance.amount_hours > 0 && (
        <span className={`text-[9px] font-medium leading-none flex items-center gap-0.5 ${
          warn ? 'text-warning-600' : 'text-neutral-400'
        }`}>
          {warn && <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />}
          {warn
            ? `Caduca en ${daysUntilExpiry(balance.expiry_date)}d`
            : `Hasta ${format(parseISO(balance.expiry_date), 'd MMM yy', { locale: es })}`
          }
        </span>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BalancesPage() {
  const [centerFilter, setCenterFilter] = useState('all')
  const [search,       setSearch]       = useState('')

  // Index balances by employment × type
  const balanceIndex = useMemo(() => {
    const idx: Record<string, Record<BalanceType, Balance>> = {}
    for (const b of MOCK_BALANCES) {
      if (!idx[b.employment_id]) idx[b.employment_id] = {} as Record<BalanceType, Balance>
      idx[b.employment_id][b.type] = b
    }
    return idx
  }, [])

  const employees = useMemo(() => {
    return MOCK_EMPLOYMENTS.filter(emp => {
      if (centerFilter !== 'all' && emp.center_id !== centerFilter) return false
      if (search && !emp.person.legal_name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [centerFilter, search])

  // Summary KPIs
  const totalVacation    = MOCK_BALANCES.filter(b => b.type === 'vacation').reduce((s, b) => s + b.amount_hours, 0)
  const totalOvertime    = MOCK_BALANCES.filter(b => b.type === 'overtime').reduce((s, b) => s + b.amount_hours, 0)
  const totalAbsenceDebt = MOCK_BALANCES.filter(b => b.type === 'absence').reduce((s, b) => s + b.amount_hours, 0)
  const expiryAlerts     = MOCK_BALANCES.filter(isExpiryWarning).length

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-neutral-100">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-info-100 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-info-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-neutral-900">Saldos de tiempo</h1>
              <p className="text-xs text-neutral-500 mt-0.5">
                Cuatro bolsas independientes por empleado · Marzo 2026
              </p>
            </div>
          </div>

          {expiryAlerts > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-warning-50 border border-warning-200">
              <AlertCircle className="w-3.5 h-3.5 text-warning-600" />
              <span className="text-xs font-semibold text-warning-700">
                {expiryAlerts} saldo{expiryAlerts > 1 ? 's' : ''} próximo{expiryAlerts > 1 ? 's' : ''} a caducar
              </span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative">
            <select
              value={centerFilter}
              onChange={e => setCenterFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-shift-500/30 transition-colors cursor-pointer"
            >
              <option value="all">Todos los centros</option>
              {MOCK_CENTERS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>

          <input
            type="text"
            placeholder="Buscar empleado…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-3 py-1.5 text-xs text-neutral-700 bg-white border border-neutral-200 rounded-md placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-shift-500/30 focus:border-transparent transition-colors w-48"
          />

          <span className="ml-auto text-xs text-neutral-400">
            {employees.length} empleado{employees.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── KPI strip ── */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-3">
        {[
          { type: 'vacation'    as BalanceType, value: formatHours(totalVacation),         label: 'Total vacaciones acumuladas' },
          { type: 'overtime'    as BalanceType, value: formatHours(totalOvertime),          label: 'Banco de horas extra' },
          { type: 'absence'     as BalanceType, value: formatHours(Math.abs(totalAbsenceDebt)), label: 'Deuda por ausencias' },
          { type: 'holiday_comp'as BalanceType, value: `${expiryAlerts} alertas`,          label: 'Saldos próximos a caducar' },
        ].map(({ type, value, label }) => {
          const meta = BALANCE_META[type]
          const Icon = meta.icon
          return (
            <div key={type} className={`bg-white rounded-lg border ${meta.borderClass} px-4 py-3 flex items-center gap-3 shadow-card`}>
              <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${meta.bgClass}`}>
                <Icon className={`w-4 h-4 ${meta.colorClass}`} />
              </div>
              <div>
                <p className={`text-base font-bold font-mono tabular-nums leading-none ${meta.colorClass}`}>{value}</p>
                <p className="text-2xs text-neutral-500 mt-0.5">{label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="bg-white rounded-lg border border-neutral-200 shadow-card overflow-hidden">

          {/* Header */}
          <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
            <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide">Empleado</span>
            {BALANCE_TYPES.map(type => {
              const meta = BALANCE_META[type]
              const Icon = meta.icon
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${meta.colorClass}`} />
                  <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide">{meta.shortLabel}</span>
                </div>
              )
            })}
          </div>

          {/* Rows */}
          {employees.length === 0 ? (
            <div className="py-16 text-center">
              <Wallet className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">Sin empleados para los filtros seleccionados</p>
            </div>
          ) : (
            employees.map(emp => {
              const center    = MOCK_CENTERS.find(c => c.id === emp.center_id)!
              const empBals   = balanceIndex[emp.id] ?? {}
              const hasAlert  = BALANCE_TYPES.some(t => empBals[t] && isExpiryWarning(empBals[t]))
              const hasDebt   = BALANCE_TYPES.some(t => empBals[t] && empBals[t].amount_hours < 0)

              return (
                <div
                  key={emp.id}
                  className={`grid grid-cols-[1fr_140px_140px_140px_140px] gap-2 items-center px-4 py-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50/60 transition-colors ${
                    hasDebt ? 'bg-error-50/20' : hasAlert ? 'bg-warning-50/20' : ''
                  }`}
                >
                  {/* Employee info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ backgroundColor: emp.person.avatar_color }}
                    >
                      {emp.person.avatar_initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-neutral-900 truncate leading-none">
                          {emp.person.legal_name}
                        </p>
                        {(hasAlert || hasDebt) && (
                          <AlertCircle className={`w-3 h-3 flex-shrink-0 ${hasDebt ? 'text-error-500' : 'text-warning-500'}`} />
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate leading-none mt-0.5">
                        {emp.role} · {center.name} · {emp.contracted_hours_week}h/sem
                      </p>
                    </div>
                  </div>

                  {/* Balance cells */}
                  {BALANCE_TYPES.map(type => (
                    <div key={type}>
                      {empBals[type]
                        ? <BalanceCell balance={empBals[type]} />
                        : <span className="text-xs text-neutral-300 font-mono">—</span>
                      }
                    </div>
                  ))}
                </div>
              )
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-3 px-1 flex items-center gap-6">
          {BALANCE_TYPES.map(type => {
            const meta = BALANCE_META[type]
            const Icon = meta.icon
            return (
              <div key={type} className="flex items-center gap-1.5">
                <Icon className={`w-3 h-3 ${meta.colorClass}`} />
                <span className="text-[10px] text-neutral-500 font-medium">{meta.label}</span>
                <span className="text-[10px] text-neutral-400">— {meta.description}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
