import { useState } from 'react'
import { Timer, CalendarDays, History, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import type { EmployeePortalTab, TimeEntry } from '../types'
import { ClockScreen } from '../components/employee-portal/ClockScreen'
import { ScheduleScreen } from '../components/employee-portal/ScheduleScreen'
import { HistoryScreen } from '../components/employee-portal/HistoryScreen'
import {
  MOCK_EMPLOYMENTS,
  MOCK_SHIFTS,
  MOCK_TIME_ENTRIES,
  MOCK_WORK_DAYS,
  PORTAL_EMPLOYMENT_ID,
  PORTAL_EXTRA_SHIFTS,
  PORTAL_TIME_ENTRIES,
  PORTAL_WORK_DAYS,
  MOCK_CENTERS,
} from '../mock-data'
import { clsx, toISODate } from '../utils'
import logo from '../images/logo.png'

const TABS: { id: EmployeePortalTab; label: string; icon: typeof Timer }[] = [
  { id: 'clock',    label: 'Fichar',   icon: Timer      },
  { id: 'schedule', label: 'Horario',  icon: CalendarDays },
  { id: 'history',  label: 'Historial', icon: History    },
]

interface EmployeePortalPageProps {
  onBack: () => void
}

export function EmployeePortalPage({ onBack }: EmployeePortalPageProps) {
  const [activeTab, setActiveTab] = useState<EmployeePortalTab>('clock')

  // The "logged in" employee
  const employment = MOCK_EMPLOYMENTS.find(e => e.id === PORTAL_EMPLOYMENT_ID)!

  // All shifts for this employee across all available data
  const allShifts = [
    ...MOCK_SHIFTS.filter(s => s.employment_id === PORTAL_EMPLOYMENT_ID),
    ...PORTAL_EXTRA_SHIFTS,
  ]

  // Today's shift
  const todayISO = toISODate(new Date())
  const todayShift = allShifts.find(s => s.date === todayISO) ?? null

  // Time entries: combine mock entries + portal-specific entries for this employee
  const [dynamicEntries, setDynamicEntries] = useState<TimeEntry[]>([])

  const allEntries: TimeEntry[] = [
    ...MOCK_TIME_ENTRIES.filter(e => e.employment_id === PORTAL_EMPLOYMENT_ID),
    ...PORTAL_TIME_ENTRIES,
    ...dynamicEntries,
  ]

  const todayEntries = allEntries.filter(e => e.date === todayISO)

  function handleAddEntry(type: TimeEntry['type']) {
    const newEntry: TimeEntry = {
      id: `dynamic-${Date.now()}`,
      employment_id: PORTAL_EMPLOYMENT_ID,
      date: todayISO,
      timestamp: format(new Date(), 'HH:mm'),
      type,
      source: 'mobile',
    }
    setDynamicEntries(prev => [...prev, newEntry])
  }

  // Work days: combine both datasets for this employee
  const allWorkDays = [
    ...MOCK_WORK_DAYS.filter(wd => wd.employment_id === PORTAL_EMPLOYMENT_ID),
    ...PORTAL_WORK_DAYS,
  ].sort((a, b) => b.date.localeCompare(a.date))

  function centerName(centerId: string): string {
    return MOCK_CENTERS.find(c => c.id === centerId)?.name ?? centerId
  }

  return (
    <div
      className="flex flex-col bg-neutral-50"
      style={{ minHeight: '100dvh' }}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 h-14 bg-white border-b border-neutral-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
            title="Volver al panel"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-500" />
          </button>
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center p-1">
            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Employee avatar */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-semibold text-navy-900 leading-tight">
              {employment.person.legal_name.split(' ')[0]} {employment.person.legal_name.split(' ')[1]}
            </p>
            <p className="text-[10px] text-neutral-400 leading-tight">{employment.role}</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold"
            style={{ backgroundColor: employment.person.avatar_color }}
          >
            {employment.person.avatar_initials}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
        {activeTab === 'clock' && (
          <ClockScreen
            employment={employment}
            todayShift={todayShift}
            todayEntries={todayEntries}
            onAddEntry={handleAddEntry}
          />
        )}
        {activeTab === 'schedule' && (
          <ScheduleScreen
            shifts={allShifts}
            centerName={centerName}
          />
        )}
        {activeTab === 'history' && (
          <HistoryScreen
            workDays={allWorkDays}
            timeEntries={allEntries}
          />
        )}
      </div>

      {/* ── Bottom Tab Bar ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 flex z-10"
        style={{ height: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
                active ? 'text-shift-600' : 'text-neutral-400'
              )}
            >
              <Icon className={clsx('w-5 h-5', active && 'stroke-[2.5]')} />
              <span className={clsx('text-[10px] font-semibold', active ? 'text-shift-600' : 'text-neutral-400')}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-shift-500 rounded-full" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
