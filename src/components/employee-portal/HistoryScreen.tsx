import { AlertCircle, CheckCircle2, MinusCircle, Clock } from 'lucide-react'
import { format, startOfWeek, isSameWeek, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { WorkDay, TimeEntry } from '../../types'
import { clsx, formatMinutes } from '../../utils'

interface HistoryScreenProps {
  workDays: WorkDay[]
  timeEntries: TimeEntry[]
}

interface DayRecord {
  workDay: WorkDay
  entries: TimeEntry[]
}

type HistoryStatus = 'complete' | 'incident' | 'no_show'

function getDayStatus(wd: WorkDay): HistoryStatus {
  if (wd.actual_hours === null) return 'no_show'
  if (wd.incident_count > 0) return 'incident'
  return 'complete'
}

function getInTime(entries: TimeEntry[]): string | null {
  return entries.filter(e => e.type === 'in').sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0]?.timestamp ?? null
}
function getOutTime(entries: TimeEntry[]): string | null {
  return entries.filter(e => e.type === 'out').sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]?.timestamp ?? null
}

const STATUS_CONFIG: Record<HistoryStatus, { icon: typeof CheckCircle2; iconClass: string; badgeClass: string; label: string }> = {
  complete: {
    icon: CheckCircle2,
    iconClass: 'text-success-500',
    badgeClass: 'bg-success-50 text-success-700',
    label: 'Completo',
  },
  incident: {
    icon: AlertCircle,
    iconClass: 'text-warning-500',
    badgeClass: 'bg-warning-50 text-warning-700',
    label: 'Incidencia',
  },
  no_show: {
    icon: MinusCircle,
    iconClass: 'text-neutral-400',
    badgeClass: 'bg-neutral-100 text-neutral-500',
    label: 'Sin fichar',
  },
}

function groupByWeek(records: DayRecord[]): { weekLabel: string; weekStart: Date; days: DayRecord[] }[] {
  const sorted = [...records].sort((a, b) => b.workDay.date.localeCompare(a.workDay.date))
  const groups: { weekLabel: string; weekStart: Date; days: DayRecord[] }[] = []

  for (const record of sorted) {
    const date = parseISO(record.workDay.date)
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })

    const existing = groups.find(g => isSameWeek(g.weekStart, weekStart, { weekStartsOn: 1 }))
    if (existing) {
      existing.days.push(record)
    } else {
      const label = (() => {
        const s = format(weekStart, "d 'de' MMM", { locale: es })
        const e = format(new Date(weekStart.getTime() + 6 * 86400000), "d 'de' MMM", { locale: es })
        return `Semana del ${s} al ${e}`
      })()
      groups.push({ weekLabel: label, weekStart, days: [record] })
    }
  }

  return groups
}

export function HistoryScreen({ workDays, timeEntries }: HistoryScreenProps) {
  if (workDays.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16 px-8 text-center">
        <Clock className="w-10 h-10 text-neutral-300" />
        <p className="text-sm font-semibold text-neutral-400">No hay registros aún</p>
        <p className="text-xs text-neutral-300">Aquí verás el historial de tus jornadas una vez hayas fichado.</p>
      </div>
    )
  }

  const records: DayRecord[] = workDays.map(wd => ({
    workDay: wd,
    entries: timeEntries.filter(e => e.date === wd.date),
  }))

  const groups = groupByWeek(records)

  return (
    <div className="flex flex-col px-4 pt-4 pb-6 gap-4">
      {groups.map(group => (
        <div key={group.weekStart.toISOString()}>
          {/* Week header */}
          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2 px-1">
            {group.weekLabel}
          </p>

          {/* Day rows */}
          <div className="flex flex-col gap-2">
            {group.days.map(({ workDay, entries }) => (
              <DayRow key={workDay.id} workDay={workDay} entries={entries} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DayRow({ workDay, entries }: { workDay: WorkDay; entries: TimeEntry[] }) {
  const status = getDayStatus(workDay)
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  const inTime = getInTime(entries)
  const outTime = getOutTime(entries)
  const date = parseISO(workDay.date)
  const dayLabel = format(date, "EEE d MMM", { locale: es })
  const actualMinutes = workDay.actual_hours !== null ? Math.round(workDay.actual_hours * 60) : null

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className={clsx('w-5 h-5 flex-shrink-0', cfg.iconClass)} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-navy-900 capitalize">{dayLabel}</span>
            <span className={clsx('text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', cfg.badgeClass)}>
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1">
            {inTime ? (
              <TimeChip icon="in" time={inTime} />
            ) : (
              <span className="text-xs text-neutral-300">Sin entrada</span>
            )}
            {outTime && <TimeChip icon="out" time={outTime} />}
            {actualMinutes !== null && (
              <span className="ml-auto text-xs font-semibold text-neutral-500">
                {formatMinutes(actualMinutes)}
              </span>
            )}
          </div>

          {workDay.adjustment_note && (
            <p className="text-[10px] text-neutral-400 mt-1 truncate">{workDay.adjustment_note}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function TimeChip({ icon, time }: { icon: 'in' | 'out'; time: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={clsx('w-1.5 h-1.5 rounded-full', icon === 'in' ? 'bg-success-400' : 'bg-error-400')} />
      <span className="text-xs font-mono text-neutral-600">{time}</span>
    </div>
  )
}
