// ─── Domain Types — exactly matching PRD data model (Section 5) ───────────────

export type EmploymentStatus = 'active' | 'inactive' | 'on_leave'
export type ShiftStatus = 'draft' | 'review' | 'published' | 'locked'
export type PlanningStatus = 'draft' | 'review' | 'published' | 'locked'
export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface Person {
  id: string
  legal_name: string
  national_id: string
  avatar_initials: string
  avatar_color: string
}

export interface Employment {
  id: string
  person_id: string
  person: Person
  company_id: string
  role: string
  contracted_hours_week: number
  status: EmploymentStatus
  center_id: string
}

export interface Center {
  id: string
  name: string
  company_id: string
}

export interface Shift {
  id: string
  employment_id: string
  date: string          // ISO date string 'YYYY-MM-DD'
  start_time: string    // 'HH:mm'
  end_time: string      // 'HH:mm'
  center_id: string
  role: string
  status: ShiftStatus
  duration_hours: number
}

export interface ValidationViolation {
  id: string
  shift_id?: string
  employment_id: string
  severity: ValidationSeverity
  rule_code: string
  message: string
  detail?: string
}

// ─── UI State Types ────────────────────────────────────────────────────────────

export interface WeekRange {
  start: Date   // Monday
  end: Date     // Sunday
}

export interface EmployeeWeekSummary {
  employment: Employment
  shifts: Shift[]
  total_planned_hours: number
  violations: ValidationViolation[]
}

export interface PlanningFilters {
  center_id: string | null
  role: string | null
  show_violations_only: boolean
}

// ─── Standard Week Template (PRD §6.2 — planning template per employee) ───────

// day_of_week: 0 = Monday … 6 = Sunday (matches date-fns weekStartsOn: 1)
export interface StandardWeekShift {
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6
  start_time: string  // 'HH:mm'
  end_time: string    // 'HH:mm'
  center_id: string
  role: string
}

// ─── App Routing ───────────────────────────────────────────────────────────────

export type AppPage =
  | 'planning'
  | 'employees'
  | 'employee-schedule'
  | 'time-tracking'
  | 'closure'
  | 'balances'
  | 'costs'
  | 'inspection'
  | 'settings'
  | 'employee-portal'

// ─── Employee Portal Types ─────────────────────────────────────────────────────

export type EmployeePortalTab = 'clock' | 'schedule' | 'history'

/** Current clock state for the logged-in employee */
export type ClockStatus =
  | 'not_clocked_in'   // No entry today yet
  | 'clocked_in'       // Has 'in' entry, no matching 'out'
  | 'on_break'         // Last entry is 'break_start'
  | 'clocked_out'      // Has matching 'out' entry — day done

export type ScheduleViewMode = 'week' | 'month'

// ─── Monthly Closure Types (PRD §6.4) ────────────────────────────────────────

export type WorkDayApprovalStatus = 'pending' | 'approved'

export type EmployeeClosureStatus =
  | 'pending'
  | 'manager_approved'
  | 'hr_approved'
  | 'employee_signed'
  | 'locked'

export type ClosureStatus =
  | 'pre_calculation'
  | 'manager_review'
  | 'hr_validation'
  | 'employee_signature'
  | 'locked'

export interface WorkDay {
  id: string
  employment_id: string
  date: string           // 'YYYY-MM-DD'
  planned_hours: number
  actual_hours: number | null   // null = no clock-in recorded
  deviation_hours: number | null
  incident_count: number
  status: WorkDayApprovalStatus
  adjustment_note?: string
}

export interface EmployeeClosure {
  employment_id: string
  status: EmployeeClosureStatus
  total_planned_hours: number
  total_actual_hours: number
  total_deviation_hours: number
  pending_incidents: number
  adjustment_note: string
  signed_at?: string
}

export interface ClosurePeriod {
  id: string
  period_label: string   // 'Marzo 2026'
  period_start: string   // 'YYYY-MM-DD'
  period_end: string
  status: ClosureStatus
  employee_closures: EmployeeClosure[]
}

// ─── Balance Types (PRD §6.5) ─────────────────────────────────────────────────

export type BalanceType = 'vacation' | 'holiday_comp' | 'overtime' | 'absence'

export interface Balance {
  id: string
  employment_id: string
  type: BalanceType
  amount_hours: number        // positive = credit, negative = debt
  accrued_hours: number       // total accrued this year
  consumed_hours: number      // total consumed this year
  expiry_date?: string        // 'YYYY-MM-DD' — null means no expiry
}

// ─── Time Tracking Types (PRD §6.3) ───────────────────────────────────────────

export type TimeEntryType   = 'in' | 'out' | 'break_start' | 'break_end'
export type TimeEntrySource = 'mobile' | 'kiosk' | 'manual' | 'api'
export type IncidentType    =
  | 'no_show'
  | 'late_arrival'
  | 'early_departure'
  | 'unplanned_overtime'
  | 'missed_break'
  | 'unplanned_shift'
export type AttendanceStatus =
  | 'present'
  | 'partial'
  | 'no_show'
  | 'unplanned_shift'
  | 'not_scheduled'

export interface TimeEntry {
  id: string
  employment_id: string
  date: string          // 'YYYY-MM-DD'
  timestamp: string     // 'HH:mm'
  type: TimeEntryType
  source: TimeEntrySource
  device_id?: string
  note?: string
}

export interface Incident {
  id: string
  employment_id: string
  date: string
  type: IncidentType
  shift_id?: string
  detail: string
}
