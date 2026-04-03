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

// ─── Gantt / Hourly Planning Types ────────────────────────────────────────────

export type ViewMode = 'weekly' | 'gantt'

export type AbsenceType = 'vacation' | 'sick_leave' | 'personal' | 'justified' | 'unjustified'

export interface Absence {
  id: string
  employment_id: string
  type: AbsenceType
  label: string          // display name in Spanish
  start_date: string     // 'YYYY-MM-DD'
  end_date: string
  status: 'requested' | 'approved' | 'rejected'
  reason?: string
  blocks_planning: boolean
}

export interface EmployeeCost {
  employment_id: string
  hourly_rate: number       // gross €/hour
  ss_rate: number           // employer SS contribution rate, e.g. 0.298
  overtime_mult: number     // e.g. 1.25
  night_mult: number        // e.g. 1.25
  night_start: string       // 'HH:mm' when night shift starts, e.g. '22:00'
  night_end: string         // 'HH:mm' when night shift ends, e.g. '06:00'
}

export interface RevenueDaily {
  center_id: string
  date: string               // 'YYYY-MM-DD'
  revenue_actual: number | null
  revenue_estimated: number
  covers: number | null
  source: 'manual' | 'revo_api' | 'estimate'
  target_labor_ratio: number  // e.g. 0.15 = 15%
}

export interface CostSummaryPerEmployee {
  employment_id: string
  planned_hours: number
  extra_hours: number
  cost_fixed: number
  cost_extra: number
  cost_total: number
}

export interface CostSummary {
  fixed_cost: number
  extra_cost: number
  total_cost: number
  revenue_actual: number | null
  revenue_estimated: number
  labor_ratio: number
  target_ratio: number
  deviation: number       // labor_ratio - target_ratio (positive = over budget)
  revenue_source: RevenueDaily['source']
  per_employment: CostSummaryPerEmployee[]
}

export interface CoverageSlot {
  slot_start: string     // 'HH:mm'
  slot_end: string       // 'HH:mm'
  count: number          // total active employees
  by_role: Record<string, number>
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
