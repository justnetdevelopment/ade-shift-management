import type { CostSummary } from '../types'

interface CostSummaryHeaderProps {
  summary: CostSummary
  dateLabel: string
}

function fmtEur(v: number): string {
  return v.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)} %`
}

interface KPITileProps {
  label: string
  value: string
  sub?: string
  valueColor?: string
  dimmed?: boolean
}

function KPITile({ label, value, sub, valueColor = 'text-neutral-900', dimmed }: KPITileProps) {
  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-2.5 min-w-0">
      <span className={`text-sm font-bold font-mono tabular-nums leading-none ${dimmed ? 'text-neutral-300' : valueColor}`}>
        {value}
      </span>
      {sub && (
        <span className="text-2xs text-neutral-400 leading-tight mt-0.5">{sub}</span>
      )}
      <span className="text-2xs text-neutral-500 leading-tight mt-0.5 truncate">{label}</span>
    </div>
  )
}

export function CostSummaryHeader({ summary, dateLabel }: CostSummaryHeaderProps) {
  const {
    fixed_cost, extra_cost, total_cost,
    revenue_actual, revenue_estimated,
  } = summary

  const revenueReal = revenue_actual
  const revenueEst  = revenue_estimated

  const baseRev = revenueReal ?? revenueEst
  const mb      = baseRev > 0 ? (baseRev - total_cost) / baseRev : null
  const mbColor = mb === null ? 'text-neutral-300' : mb >= 0.15 ? 'text-success-700' : mb >= 0 ? 'text-warning-700' : 'text-error-700'

  return (
    <div className="flex-shrink-0 bg-white border-b border-neutral-200">
      <div className="flex items-stretch divide-x divide-neutral-150 h-[52px]">

        {/* Date label — same width as employee column so KPIs align with the grid */}
        <div className="w-48 flex-shrink-0 flex items-center px-3">
          <span className="text-2xs font-semibold text-neutral-400 uppercase tracking-wide whitespace-nowrap truncate">
            {dateLabel}
          </span>
        </div>

        {/* 1. Coste fijo */}
        <KPITile label="Coste fijo" value={fmtEur(fixed_cost)} />

        {/* 2. Coste extra */}
        <KPITile
          label="Coste extra"
          value={extra_cost > 0 ? fmtEur(extra_cost) : '—'}
          valueColor="text-warning-700"
          dimmed={extra_cost === 0}
        />

        {/* 3. Coste personal */}
        <KPITile
          label="Coste personal"
          value={fmtEur(total_cost)}
          sub={`${summary.per_employment.length} empleados`}
        />

        {/* 4. Facturación real */}
        <KPITile
          label="Facturación real"
          value={revenueReal !== null ? fmtEur(revenueReal) : '—'}
          valueColor="text-info-700"
          dimmed={revenueReal === null}
        />

        {/* 5. Estimación */}
        <KPITile
          label="Estimación"
          value={revenueEst > 0 ? fmtEur(revenueEst) : '—'}
          valueColor="text-neutral-600"
          dimmed={revenueEst === 0}
        />

        {/* 6. MB % */}
        <KPITile
          label="MB %"
          value={mb !== null ? fmtPct(mb) : '—'}
          valueColor={mbColor}
          dimmed={mb === null}
        />

      </div>
    </div>
  )
}
