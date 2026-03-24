import { useState } from 'react'
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, X } from 'lucide-react'
import type { ValidationViolation } from '../types'
import { MOCK_EMPLOYMENTS } from '../mock-data'

interface ValidationPanelProps {
  violations: ValidationViolation[]
  onDismiss?: (id: string) => void
  onSelectEmployee?: (employmentId: string) => void
}

const SEVERITY_CONFIG = {
  error: {
    icon: AlertCircle,
    containerClass: 'bg-error-50 border-error-200',
    iconClass: 'text-error-600',
    textClass: 'text-error-800',
    detailClass: 'text-error-600',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-warning-50 border-warning-200',
    iconClass: 'text-warning-600',
    textClass: 'text-warning-800',
    detailClass: 'text-warning-600',
    label: 'Aviso',
  },
  info: {
    icon: Info,
    containerClass: 'bg-info-50 border-info-200',
    iconClass: 'text-info-600',
    textClass: 'text-info-800',
    detailClass: 'text-info-600',
    label: 'Info',
  },
}

export function ValidationPanel({ violations, onDismiss, onSelectEmployee }: ValidationPanelProps) {
  const [collapsed, setCollapsed] = useState(true)

  if (violations.length === 0) return null

  const errors = violations.filter(v => v.severity === 'error')
  const warnings = violations.filter(v => v.severity === 'warning')
  const infos = violations.filter(v => v.severity === 'info')

  return (
    <div className="flex-shrink-0 border-b border-neutral-200 bg-white">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-neutral-50 transition-colors"
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">
            Validaciones
          </span>
          {errors.length > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-error-700">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.length} error{errors.length > 1 ? 'es' : ''}
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
          : <ChevronUp className="w-4 h-4 text-neutral-400" />
        }
      </button>

      {/* Violation list */}
      {!collapsed && (
        <div className="px-4 pb-3 space-y-2">
          {[...errors, ...warnings, ...infos].map(violation => {
            const config = SEVERITY_CONFIG[violation.severity]
            const Icon = config.icon
            const employee = MOCK_EMPLOYMENTS.find(e => e.id === violation.employment_id)

            return (
              <div
                key={violation.id}
                className={`flex items-start gap-3 px-3 py-2.5 rounded-md border ${config.containerClass}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-semibold ${config.textClass}`}>
                      {employee?.person.legal_name ?? 'Empleado'}
                    </span>
                    <span className={`text-xs ${config.textClass}`}>—</span>
                    <span className={`text-xs font-medium ${config.textClass}`}>
                      {violation.message}
                    </span>
                  </div>
                  {violation.detail && (
                    <p className={`text-2xs mt-0.5 ${config.detailClass}`}>{violation.detail}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onSelectEmployee && (
                    <button
                      onClick={() => onSelectEmployee(violation.employment_id)}
                      className={`text-2xs font-medium underline underline-offset-2 ${config.textClass} hover:opacity-70`}
                    >
                      Ver
                    </button>
                  )}
                  {onDismiss && violation.severity !== 'error' && (
                    <button
                      onClick={() => onDismiss(violation.id)}
                      className={`ml-1 ${config.iconClass} hover:opacity-70`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
