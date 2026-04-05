import { format, isToday, isWeekend } from 'date-fns'
import { es } from 'date-fns/locale'

interface DaySelectorProps {
  weekDays: Date[]
  selectedDate: string   // 'YYYY-MM-DD'
  onSelectDate: (date: string) => void
}

const DAY_SHORT: Record<string, string> = {
  lunes: 'Lun', martes: 'Mar', miércoles: 'Mié',
  jueves: 'Jue', viernes: 'Vie', sábado: 'Sáb', domingo: 'Dom',
}

export function DaySelector({ weekDays, selectedDate, onSelectDate }: DaySelectorProps) {
  return (
    <div className="flex flex-shrink-0 border-b border-neutral-200 bg-white">
      {/* Employee column spacer — aligns with PlanningGrid */}
      <div className="w-48 flex-shrink-0 border-r border-neutral-200" />

      {/* Day tabs */}
      <div className="flex-1 grid grid-cols-7 gap-1 px-1 py-2">
        {weekDays.map((day) => {
          const dateStr  = format(day, 'yyyy-MM-dd')
          const dayName  = format(day, 'EEEE', { locale: es }).toLowerCase()
          const abbr     = DAY_SHORT[dayName] ?? dayName.slice(0, 3)
          const dayNum   = format(day, 'd')
          const selected = dateStr === selectedDate
          const today    = isToday(day)
          const weekend  = isWeekend(day)

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center py-0.5 rounded-md transition-colors ${
                selected
                  ? 'bg-shift-600'
                  : today
                    ? 'bg-shift-50 hover:bg-shift-100'
                    : 'hover:bg-neutral-100'
              }`}
            >
              <span className={`text-2xs font-semibold uppercase tracking-wide ${
                selected  ? 'text-white/80'  :
                today     ? 'text-shift-600' :
                weekend   ? 'text-neutral-400' :
                'text-neutral-500'
              }`}>
                {abbr}
              </span>
              <span className={`text-sm font-bold tabular-nums ${
                selected  ? 'text-white'     :
                today     ? 'text-shift-700' :
                weekend   ? 'text-neutral-400' :
                'text-neutral-800'
              }`}>
                {dayNum}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

