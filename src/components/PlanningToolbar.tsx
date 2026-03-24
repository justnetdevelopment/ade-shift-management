import { ChevronLeft, ChevronRight, Copy, Send, ChevronDown } from 'lucide-react'
import { format, addWeeks, subWeeks, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from './Badge'
import type { PlanningStatus, WeekRange } from '../types'
import { MOCK_CENTERS, MOCK_ROLES } from '../mock-data'

interface PlanningToolbarProps {
  weekRange: WeekRange
  planningStatus: PlanningStatus
  activeCenter: string | null
  activeRole: string | null
  onWeekChange: (week: WeekRange) => void
  onCenterChange: (centerId: string | null) => void
  onRoleChange: (role: string | null) => void
  onPublish: () => void
  onCopyPreviousWeek: () => void
}

function formatWeekLabel(weekRange: WeekRange): string {
  const startFmt = format(weekRange.start, "d 'de' MMM", { locale: es })
  const endFmt = format(weekRange.end, "d 'de' MMM yyyy", { locale: es })
  return `${startFmt} – ${endFmt}`
}

const STATUS_ACTIONS: Record<PlanningStatus, { label: string; next: PlanningStatus | null }> = {
  draft:     { label: 'Enviar a revisión', next: 'review' },
  review:    { label: 'Publicar planificación', next: 'published' },
  published: { label: 'Planificación publicada', next: null },
  locked:    { label: 'Período cerrado', next: null },
}

export function PlanningToolbar({
  weekRange,
  planningStatus,
  activeCenter,
  activeRole,
  onWeekChange,
  onCenterChange,
  onRoleChange,
  onPublish,
  onCopyPreviousWeek,
}: PlanningToolbarProps) {
  const action = STATUS_ACTIONS[planningStatus]
  const canPublish = planningStatus === 'draft' || planningStatus === 'review'

  function goToPrevWeek() {
    const prev = subWeeks(weekRange.start, 1)
    onWeekChange({ start: prev, end: addDays(prev, 6) })
  }

  function goToNextWeek() {
    const next = addWeeks(weekRange.start, 1)
    onWeekChange({ start: next, end: addDays(next, 6) })
  }

  return (
    <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4">
      {/* Top row — same height as sidebar logo (h-14) */}
      <div className="flex items-center justify-between gap-4 h-14">
        {/* Week navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-neutral-900 min-w-[200px] text-center">
            {formatWeekLabel(weekRange)}
          </span>
          <button
            onClick={goToNextWeek}
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            aria-label="Semana siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Center filter */}
          <div className="relative">
            <select
              value={activeCenter ?? ''}
              onChange={e => onCenterChange(e.target.value || null)}
              className="pl-2.5 pr-7 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md appearance-none cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent"
            >
              <option value="">Todos los centros</option>
              {MOCK_CENTERS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>

          {/* Role filter */}
          <div className="relative">
            <select
              value={activeRole ?? ''}
              onChange={e => onRoleChange(e.target.value || null)}
              className="pl-2.5 pr-7 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md appearance-none cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent"
            >
              <option value="">Todos los roles</option>
              {MOCK_ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Status + actions */}
        <div className="flex items-center gap-2.5">
          <Badge variant={planningStatus} />

          <button
            onClick={onCopyPreviousWeek}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:border-neutral-300 hover:text-neutral-900 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar semana anterior
          </button>

          {canPublish && (
            <button
              onClick={onPublish}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-shift-600 rounded-md hover:bg-shift-700 transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
