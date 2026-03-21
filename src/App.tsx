import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { PlanningPage } from './pages/PlanningPage'
import { TimeTrackingPage } from './pages/TimeTrackingPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { EmployeeSchedulePage } from './pages/EmployeeSchedulePage'
import { ClosurePage } from './pages/ClosurePage'
import { InspectionPage } from './pages/InspectionPage'
import { BalancesPage } from './pages/BalancesPage'
import { CostsPage } from './pages/CostsPage'
import type { AppPage } from './types'

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <p className="text-xs text-neutral-400 mt-1">Módulo en desarrollo</p>
      </div>
    </div>
  )
}

export default function App() {
  const [activePage,           setActivePage]           = useState<AppPage>('planning')
  const [scheduleEmploymentId, setScheduleEmploymentId] = useState<string | null>(null)

  function handleViewSchedule(empId: string) {
    setScheduleEmploymentId(empId)
    setActivePage('employee-schedule')
  }

  function handleBackFromSchedule() {
    setActivePage('employees')
  }

  function handlePageChange(page: AppPage) {
    // Clicking 'employees' in the nav always goes to the list
    if (page === 'employees') setScheduleEmploymentId(null)
    setActivePage(page)
  }

  return (
    <AppShell activePage={activePage} onPageChange={handlePageChange}>
      {activePage === 'planning'           && <PlanningPage />}
      {activePage === 'time-tracking'      && <TimeTrackingPage />}
      {activePage === 'employees'          && <EmployeesPage onViewSchedule={handleViewSchedule} />}
      {activePage === 'employee-schedule'  && scheduleEmploymentId &&
        <EmployeeSchedulePage employmentId={scheduleEmploymentId} onBack={handleBackFromSchedule} />
      }
      {activePage === 'closure'            && <ClosurePage />}
      {activePage === 'balances'           && <BalancesPage />}
      {activePage === 'costs'              && <CostsPage />}
      {activePage === 'inspection'         && <InspectionPage />}
      {activePage === 'settings'           && <ComingSoon label="Configuración" />}
    </AppShell>
  )
}
