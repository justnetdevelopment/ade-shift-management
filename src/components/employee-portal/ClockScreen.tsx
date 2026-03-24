import { useState, useEffect } from 'react'
import { LogIn, LogOut, Coffee, Play, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ClockStatus, TimeEntry, Shift, Employment } from '../../types'
import { clsx, formatMinutes } from '../../utils'

interface ClockScreenProps {
  employment: Employment
  todayShift: Shift | null
  todayEntries: TimeEntry[]
  onAddEntry: (type: TimeEntry['type']) => void
}

function deriveClockStatus(entries: TimeEntry[]): ClockStatus {
  if (entries.length === 0) return 'not_clocked_in'
  const sorted = [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const last = sorted[sorted.length - 1]
  if (last.type === 'out') return 'clocked_out'
  if (last.type === 'break_start') return 'on_break'
  return 'clocked_in'
}

function getElapsedMinutes(entries: TimeEntry[], status: ClockStatus): number | null {
  if (status === 'not_clocked_in' || status === 'clocked_out') return null
  const sorted = [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const now = format(new Date(), 'HH:mm')

  if (status === 'clocked_in') {
    // Find last 'in' entry
    const lastIn = [...sorted].reverse().find(e => e.type === 'in')
    if (!lastIn) return null
    const [h, m] = lastIn.timestamp.split(':').map(Number)
    const [nh, nm] = now.split(':').map(Number)
    return (nh * 60 + nm) - (h * 60 + m)
  }
  if (status === 'on_break') {
    const lastBreakStart = [...sorted].reverse().find(e => e.type === 'break_start')
    if (!lastBreakStart) return null
    const [h, m] = lastBreakStart.timestamp.split(':').map(Number)
    const [nh, nm] = now.split(':').map(Number)
    return (nh * 60 + nm) - (h * 60 + m)
  }
  return null
}

function getFirstInTime(entries: TimeEntry[]): string | null {
  const inEntry = entries.filter(e => e.type === 'in').sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0]
  return inEntry?.timestamp ?? null
}

const ENTRY_TYPE_LABELS: Record<TimeEntry['type'], string> = {
  in: 'Entrada',
  out: 'Salida',
  break_start: 'Inicio pausa',
  break_end: 'Fin pausa',
}

export function ClockScreen({ employment, todayShift, todayEntries, onAddEntry }: ClockScreenProps) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const status = deriveClockStatus(todayEntries)
  const elapsed = getElapsedMinutes(todayEntries, status)
  const firstIn = getFirstInTime(todayEntries)

  const todayLabel = format(now, "EEEE d 'de' MMMM", { locale: es })
  const currentTime = format(now, 'HH:mm:ss')

  return (
    <div className="flex flex-col min-h-full px-4 pt-6 pb-4 gap-6">

      {/* Time + date */}
      <div className="text-center">
        <div className="text-5xl font-mono font-semibold tracking-tight text-navy-900">
          {currentTime}
        </div>
        <div className="mt-1 text-sm text-neutral-500 capitalize">{todayLabel}</div>
      </div>

      {/* Today's planned shift */}
      {todayShift ? (
        <div className="bg-shift-50 border border-shift-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-shift-100 flex items-center justify-center flex-shrink-0">
            <LogIn className="w-4 h-4 text-shift-600" />
          </div>
          <div>
            <p className="text-xs text-shift-500 font-medium uppercase tracking-wide">Turno de hoy</p>
            <p className="text-sm font-semibold text-shift-900">
              Entrada: {todayShift.start_time} · {todayShift.role}
            </p>
            <p className="text-xs text-shift-600">{employment.person.legal_name.split(' ')[0]} · Arenal Centro</p>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div>
            <p className="text-xs text-neutral-400 font-medium uppercase tracking-wide">Hoy</p>
            <p className="text-sm font-medium text-neutral-500">Sin turno programado</p>
          </div>
        </div>
      )}

      {/* Status pill */}
      <StatusPill status={status} elapsed={elapsed} firstIn={firstIn} />

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <ClockButtons status={status} onAddEntry={onAddEntry} />
      </div>

      {/* Today's event log */}
      {todayEntries.length > 0 && (
        <div className="mt-auto">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Registros de hoy
          </p>
          <div className="flex flex-col gap-2">
            {[...todayEntries]
              .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
              .map(entry => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-white border border-neutral-100 rounded-xl px-4 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <EntryDot type={entry.type} />
                    <span className="text-sm text-neutral-700">{ENTRY_TYPE_LABELS[entry.type]}</span>
                  </div>
                  <span className="text-sm font-mono font-medium text-neutral-900">{entry.timestamp}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EntryDot({ type }: { type: TimeEntry['type'] }) {
  const color = {
    in: 'bg-success-500',
    out: 'bg-error-500',
    break_start: 'bg-warning-500',
    break_end: 'bg-info-500',
  }[type]
  return <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', color)} />
}

function StatusPill({
  status,
  elapsed,
  firstIn,
}: {
  status: ClockStatus
  elapsed: number | null
  firstIn: string | null
}) {
  const config = {
    not_clocked_in: {
      bg: 'bg-neutral-100',
      text: 'text-neutral-500',
      label: 'Sin fichar',
      sub: 'Todavía no has registrado entrada',
    },
    clocked_in: {
      bg: 'bg-success-50',
      text: 'text-success-700',
      label: 'Trabajando',
      sub: elapsed !== null ? `Llevas ${formatMinutes(elapsed)}` : firstIn ? `Desde las ${firstIn}` : '',
    },
    on_break: {
      bg: 'bg-warning-50',
      text: 'text-warning-700',
      label: 'En pausa',
      sub: elapsed !== null ? `Pausa de ${formatMinutes(elapsed)}` : '',
    },
    clocked_out: {
      bg: 'bg-navy-50',
      text: 'text-navy-600',
      label: 'Jornada finalizada',
      sub: firstIn ? `Entrada: ${firstIn}` : '',
    },
  }[status]

  return (
    <div className={clsx('rounded-2xl px-4 py-3 text-center', config.bg)}>
      <p className={clsx('text-base font-semibold', config.text)}>{config.label}</p>
      {config.sub && <p className={clsx('text-xs mt-0.5', config.text, 'opacity-80')}>{config.sub}</p>}
    </div>
  )
}

function ClockButtons({
  status,
  onAddEntry,
}: {
  status: ClockStatus
  onAddEntry: (type: TimeEntry['type']) => void
}) {
  if (status === 'clocked_out') {
    return (
      <div className="flex items-center justify-center gap-2 py-2">
        <CheckCircle2 className="w-5 h-5 text-success-500" />
        <span className="text-sm font-medium text-neutral-500">Jornada completada</span>
      </div>
    )
  }

  if (status === 'not_clocked_in') {
    return (
      <button
        onClick={() => onAddEntry('in')}
        className="w-full flex items-center justify-center gap-3 bg-success-600 hover:bg-success-700 active:bg-success-800 text-white font-semibold text-lg rounded-2xl py-5 transition-colors"
      >
        <LogIn className="w-6 h-6" />
        Registrar entrada
      </button>
    )
  }

  if (status === 'on_break') {
    return (
      <button
        onClick={() => onAddEntry('break_end')}
        className="w-full flex items-center justify-center gap-3 bg-warning-500 hover:bg-warning-600 active:bg-warning-700 text-white font-semibold text-lg rounded-2xl py-5 transition-colors"
      >
        <Play className="w-6 h-6" />
        Fin de pausa
      </button>
    )
  }

  // clocked_in: show exit + break
  return (
    <>
      <button
        onClick={() => onAddEntry('out')}
        className="w-full flex items-center justify-center gap-3 bg-error-600 hover:bg-error-700 active:bg-error-800 text-white font-semibold text-lg rounded-2xl py-5 transition-colors"
      >
        <LogOut className="w-6 h-6" />
        Registrar salida
      </button>
      <button
        onClick={() => onAddEntry('break_start')}
        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-warning-300 hover:bg-warning-50 active:bg-warning-100 text-warning-700 font-semibold text-base rounded-2xl py-4 transition-colors"
      >
        <Coffee className="w-5 h-5" />
        Iniciar pausa
      </button>
    </>
  )
}
