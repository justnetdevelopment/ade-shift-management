import type { Center, Employment, Shift, ValidationViolation, TimeEntry, Incident, WorkDay, ClosurePeriod, Balance, StandardWeekShift } from './types'

export const MOCK_CENTERS: Center[] = [
  { id: 'c1', name: 'Arenal Centro', company_id: 'co1' },
  { id: 'c2', name: 'Arenal Retiro', company_id: 'co1' },
  { id: 'c3', name: 'Arenal Salamanca', company_id: 'co1' },
]

export const MOCK_ROLES = ['Cocinero/a', 'Camarero/a', 'Ayudante cocina', 'Jefe de sala', 'Encargado/a']

export const MOCK_EMPLOYMENTS: Employment[] = [
  {
    id: 'e1',
    person_id: 'p1',
    person: { id: 'p1', legal_name: 'María García López', national_id: '12345678A', avatar_initials: 'MG', avatar_color: '#4f46e5' },
    company_id: 'co1',
    role: 'Jefe de sala',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c1',
  },
  {
    id: 'e2',
    person_id: 'p2',
    person: { id: 'p2', legal_name: 'Carlos Ruiz Martín', national_id: '87654321B', avatar_initials: 'CR', avatar_color: '#16a34a' },
    company_id: 'co1',
    role: 'Camarero/a',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c1',
  },
  {
    id: 'e3',
    person_id: 'p3',
    person: { id: 'p3', legal_name: 'Ana Fernández Torres', national_id: '11223344C', avatar_initials: 'AF', avatar_color: '#d97706' },
    company_id: 'co1',
    role: 'Cocinero/a',
    contracted_hours_week: 32,
    status: 'active',
    center_id: 'c1',
  },
  {
    id: 'e4',
    person_id: 'p4',
    person: { id: 'p4', legal_name: 'David Sánchez Pérez', national_id: '55667788D', avatar_initials: 'DS', avatar_color: '#dc2626' },
    company_id: 'co1',
    role: 'Ayudante cocina',
    contracted_hours_week: 10,
    status: 'active',
    center_id: 'c1',
  },
  {
    id: 'e5',
    person_id: 'p5',
    person: { id: 'p5', legal_name: 'Laura Moreno Díaz', national_id: '99001122E', avatar_initials: 'LM', avatar_color: '#7c3aed' },
    company_id: 'co1',
    role: 'Camarero/a',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c2',
  },
  {
    id: 'e6',
    person_id: 'p6',
    person: { id: 'p6', legal_name: 'Roberto Jiménez Gil', national_id: '33445566F', avatar_initials: 'RJ', avatar_color: '#0284c7' },
    company_id: 'co1',
    role: 'Encargado/a',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c2',
  },
]

// Standard week templates per employment (day_of_week: 0=Mon … 6=Sun)
export const MOCK_STANDARD_WEEKS: Record<string, StandardWeekShift[]> = {
  // María García — 40h, full-time manager Mon–Fri 09:00–17:00
  e1: [
    { day_of_week: 0, start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala' },
    { day_of_week: 1, start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala' },
    { day_of_week: 2, start_time: '12:00', end_time: '20:00', center_id: 'c1', role: 'Jefe de sala' },
    { day_of_week: 3, start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala' },
    { day_of_week: 4, start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala' },
  ],
  // Ana Fernández — 32h, cocinera Mon–Thu 10:00–18:00
  e3: [
    { day_of_week: 0, start_time: '10:00', end_time: '18:00', center_id: 'c1', role: 'Cocinero/a' },
    { day_of_week: 1, start_time: '10:00', end_time: '18:00', center_id: 'c1', role: 'Cocinero/a' },
    { day_of_week: 2, start_time: '10:00', end_time: '18:00', center_id: 'c1', role: 'Cocinero/a' },
    { day_of_week: 3, start_time: '10:00', end_time: '18:00', center_id: 'c1', role: 'Cocinero/a' },
  ],
  // Laura Moreno — 20h, camarera Wed–Sat 15:00–20:00
  e5: [
    { day_of_week: 2, start_time: '15:00', end_time: '20:00', center_id: 'c2', role: 'Camarero/a' },
    { day_of_week: 3, start_time: '15:00', end_time: '20:00', center_id: 'c2', role: 'Camarero/a' },
    { day_of_week: 4, start_time: '15:00', end_time: '20:00', center_id: 'c2', role: 'Camarero/a' },
    { day_of_week: 5, start_time: '15:00', end_time: '20:00', center_id: 'c2', role: 'Camarero/a' },
  ],
  // Roberto Jiménez — 40h, encargado Mon–Fri 09:00–17:00
  e6: [
    { day_of_week: 0, start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a' },
    { day_of_week: 1, start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a' },
    { day_of_week: 2, start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a' },
    { day_of_week: 3, start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a' },
    { day_of_week: 4, start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a' },
  ],
}

// Week of 2026-03-17 (Mon) to 2026-03-23 (Sun)
export const MOCK_SHIFTS: Shift[] = [
  // María García (40h contracted) — full-time manager
  { id: 's1', employment_id: 'e1', date: '2026-03-17', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 8 },
  { id: 's2', employment_id: 'e1', date: '2026-03-18', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 8 },
  { id: 's3', employment_id: 'e1', date: '2026-03-19', start_time: '12:00', end_time: '20:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 8 },
  { id: 's4', employment_id: 'e1', date: '2026-03-20', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 8 },
  { id: 's5', employment_id: 'e1', date: '2026-03-21', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'draft', duration_hours: 8 },

  // Carlos Ruiz (20h contracted) — VIOLATION: 32.5h planned
  { id: 's6', employment_id: 'e2', date: '2026-03-17', start_time: '10:00', end_time: '16:30', center_id: 'c1', role: 'Camarero/a', status: 'draft', duration_hours: 6.5 },
  { id: 's7', employment_id: 'e2', date: '2026-03-18', start_time: '10:00', end_time: '16:30', center_id: 'c1', role: 'Camarero/a', status: 'draft', duration_hours: 6.5 },
  { id: 's8', employment_id: 'e2', date: '2026-03-19', start_time: '10:00', end_time: '16:30', center_id: 'c1', role: 'Camarero/a', status: 'draft', duration_hours: 6.5 },
  { id: 's9', employment_id: 'e2', date: '2026-03-20', start_time: '10:00', end_time: '16:30', center_id: 'c1', role: 'Camarero/a', status: 'draft', duration_hours: 6.5 },
  { id: 's10', employment_id: 'e2', date: '2026-03-21', start_time: '10:00', end_time: '16:30', center_id: 'c1', role: 'Camarero/a', status: 'draft', duration_hours: 6.5 },

  // Ana Fernández (32h contracted) — split shift on Monday (turno partido)
  { id: 's11', employment_id: 'e3', date: '2026-03-17', start_time: '08:00', end_time: '14:00', center_id: 'c1', role: 'Cocinero/a', status: 'published', duration_hours: 6 },
  { id: 's11b', employment_id: 'e3', date: '2026-03-17', start_time: '17:30', end_time: '21:00', center_id: 'c1', role: 'Cocinero/a', status: 'published', duration_hours: 3.5 },
  { id: 's12', employment_id: 'e3', date: '2026-03-18', start_time: '08:00', end_time: '16:00', center_id: 'c1', role: 'Cocinero/a', status: 'published', duration_hours: 8 },
  { id: 's13', employment_id: 'e3', date: '2026-03-20', start_time: '08:00', end_time: '14:00', center_id: 'c1', role: 'Cocinero/a', status: 'draft', duration_hours: 6 },
  { id: 's13b', employment_id: 'e3', date: '2026-03-20', start_time: '18:00', end_time: '22:00', center_id: 'c1', role: 'Cocinero/a', status: 'draft', duration_hours: 4 },
  { id: 's14', employment_id: 'e3', date: '2026-03-21', start_time: '08:00', end_time: '14:00', center_id: 'c1', role: 'Cocinero/a', status: 'draft', duration_hours: 6 },

  // David Sánchez (10h contracted) — VIOLATION: rest gap warning on Wed→Thu
  { id: 's15', employment_id: 'e4', date: '2026-03-18', start_time: '20:00', end_time: '01:00', center_id: 'c1', role: 'Ayudante cocina', status: 'draft', duration_hours: 5 },
  { id: 's16', employment_id: 'e4', date: '2026-03-19', start_time: '07:00', end_time: '12:00', center_id: 'c1', role: 'Ayudante cocina', status: 'draft', duration_hours: 5 },

  // Laura Moreno (20h contracted) — holiday on Friday (INFO)
  { id: 's17', employment_id: 'e5', date: '2026-03-17', start_time: '12:00', end_time: '20:00', center_id: 'c2', role: 'Camarero/a', status: 'published', duration_hours: 8 },
  { id: 's18', employment_id: 'e5', date: '2026-03-18', start_time: '12:00', end_time: '18:00', center_id: 'c2', role: 'Camarero/a', status: 'published', duration_hours: 6 },
  { id: 's19', employment_id: 'e5', date: '2026-03-21', start_time: '10:00', end_time: '16:00', center_id: 'c2', role: 'Camarero/a', status: 'draft', duration_hours: 6 },

  // Roberto Jiménez (40h contracted)
  { id: 's20', employment_id: 'e6', date: '2026-03-17', start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a', status: 'published', duration_hours: 8 },
  { id: 's21', employment_id: 'e6', date: '2026-03-18', start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a', status: 'published', duration_hours: 8 },
  { id: 's22', employment_id: 'e6', date: '2026-03-19', start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a', status: 'published', duration_hours: 8 },
  { id: 's23', employment_id: 'e6', date: '2026-03-20', start_time: '09:00', end_time: '17:00', center_id: 'c2', role: 'Encargado/a', status: 'draft', duration_hours: 8 },
  { id: 's24', employment_id: 'e6', date: '2026-03-21', start_time: '09:00', end_time: '13:00', center_id: 'c2', role: 'Encargado/a', status: 'draft', duration_hours: 4 },
]

export const MOCK_VIOLATIONS: ValidationViolation[] = [
  // Carlos Ruiz — 32.5h planned vs 20h contracted
  {
    id: 'v1',
    shift_id: 's10',
    employment_id: 'e2',
    severity: 'error',
    rule_code: 'HOURS_EXCEED_CONTRACT',
    message: 'Horas planificadas superan el contrato',
    detail: '32.5h planificadas · 20h contratadas · +12.5h exceso',
  },
  // David Sánchez — rest gap between shifts
  {
    id: 'v2',
    shift_id: 's16',
    employment_id: 'e4',
    severity: 'warning',
    rule_code: 'MIN_REST_PERIOD',
    message: 'Descanso entre turnos insuficiente',
    detail: '6h de descanso · mínimo legal 12h · entre Mar 20:00 y Mié 07:00',
  },
  // Laura Moreno — scheduled on public holiday
  {
    id: 'v3',
    shift_id: 's19',
    employment_id: 'e5',
    severity: 'info',
    rule_code: 'PUBLIC_HOLIDAY_WORKED',
    message: 'Turno en festivo — se generará compensación',
    detail: 'Viernes 21 Mar es festivo autonómico. Se acreditará 1 día de compensación.',
  },
]

// Public holidays this week
export const PUBLIC_HOLIDAYS: string[] = ['2026-03-21']

// ─── Time Entries — week of 2026-03-17 ────────────────────────────────────────
export const MOCK_TIME_ENTRIES: TimeEntry[] = [
  // ── Monday 2026-03-17 ────────────────────────────────────────────────────────
  // María García (e1) — on time, standard day
  { id: 'te1',  employment_id: 'e1', date: '2026-03-17', timestamp: '09:03', type: 'in',          source: 'kiosk'  },
  { id: 'te2',  employment_id: 'e1', date: '2026-03-17', timestamp: '17:05', type: 'out',         source: 'kiosk'  },
  // Carlos Ruiz (e2) — late arrival 25 min
  { id: 'te3',  employment_id: 'e2', date: '2026-03-17', timestamp: '10:25', type: 'in',          source: 'mobile' },
  { id: 'te4',  employment_id: 'e2', date: '2026-03-17', timestamp: '16:30', type: 'out',         source: 'mobile' },
  // Ana Fernández (e3) — split shift (turno partido)
  { id: 'te5',  employment_id: 'e3', date: '2026-03-17', timestamp: '08:00', type: 'in',          source: 'kiosk'  },
  { id: 'te6',  employment_id: 'e3', date: '2026-03-17', timestamp: '13:58', type: 'out',         source: 'kiosk'  },
  { id: 'te7',  employment_id: 'e3', date: '2026-03-17', timestamp: '17:32', type: 'in',          source: 'kiosk'  },
  { id: 'te8',  employment_id: 'e3', date: '2026-03-17', timestamp: '21:05', type: 'out',         source: 'kiosk'  },
  // David Sánchez (e4) — NO shift on Monday; clocked in anyway → unplanned_shift
  { id: 'te9',  employment_id: 'e4', date: '2026-03-17', timestamp: '09:30', type: 'in',          source: 'manual', note: 'Sin turno asignado — revisión requerida' },
  { id: 'te10', employment_id: 'e4', date: '2026-03-17', timestamp: '13:00', type: 'out',         source: 'manual' },
  // Laura Moreno (e5) — unplanned overtime +90 min
  { id: 'te11', employment_id: 'e5', date: '2026-03-17', timestamp: '12:00', type: 'in',          source: 'mobile' },
  { id: 'te12', employment_id: 'e5', date: '2026-03-17', timestamp: '21:30', type: 'out',         source: 'mobile' },
  // Roberto Jiménez (e6) — on time, with lunch break
  { id: 'te13', employment_id: 'e6', date: '2026-03-17', timestamp: '09:00', type: 'in',          source: 'kiosk'  },
  { id: 'te14', employment_id: 'e6', date: '2026-03-17', timestamp: '13:00', type: 'break_start', source: 'kiosk'  },
  { id: 'te15', employment_id: 'e6', date: '2026-03-17', timestamp: '14:00', type: 'break_end',   source: 'kiosk'  },
  { id: 'te16', employment_id: 'e6', date: '2026-03-17', timestamp: '17:00', type: 'out',         source: 'kiosk'  },

  // ── Tuesday 2026-03-18 ───────────────────────────────────────────────────────
  // María García (e1) — minor overrun, no incident
  { id: 'te17', employment_id: 'e1', date: '2026-03-18', timestamp: '09:05', type: 'in',  source: 'kiosk'  },
  { id: 'te18', employment_id: 'e1', date: '2026-03-18', timestamp: '17:10', type: 'out', source: 'kiosk'  },
  // Carlos Ruiz (e2) — late arrival 22 min
  { id: 'te19', employment_id: 'e2', date: '2026-03-18', timestamp: '10:22', type: 'in',  source: 'mobile' },
  { id: 'te20', employment_id: 'e2', date: '2026-03-18', timestamp: '16:30', type: 'out', source: 'mobile' },
  // Ana Fernández (e3) — early departure 32 min
  { id: 'te21', employment_id: 'e3', date: '2026-03-18', timestamp: '08:02', type: 'in',  source: 'kiosk'  },
  { id: 'te22', employment_id: 'e3', date: '2026-03-18', timestamp: '15:28', type: 'out', source: 'kiosk'  },
  // David Sánchez (e4) — no entries at all → no_show (shift 20:00–01:00)
  // Laura Moreno (e5) — unplanned overtime +70 min
  { id: 'te23', employment_id: 'e5', date: '2026-03-18', timestamp: '12:03', type: 'in',  source: 'mobile' },
  { id: 'te24', employment_id: 'e5', date: '2026-03-18', timestamp: '19:10', type: 'out', source: 'mobile' },
  // Roberto Jiménez (e6) — exact
  { id: 'te25', employment_id: 'e6', date: '2026-03-18', timestamp: '09:00', type: 'in',  source: 'kiosk'  },
  { id: 'te26', employment_id: 'e6', date: '2026-03-18', timestamp: '17:00', type: 'out', source: 'kiosk'  },
]

// ─── Incidents ────────────────────────────────────────────────────────────────
export const MOCK_INCIDENTS: Incident[] = [
  // Monday 2026-03-17
  {
    id: 'i1', employment_id: 'e2', date: '2026-03-17', type: 'late_arrival', shift_id: 's6',
    detail: 'Entrada a las 10:25 · turno planificado a las 10:00 · retraso de 25 min',
  },
  {
    id: 'i2', employment_id: 'e4', date: '2026-03-17', type: 'unplanned_shift',
    detail: 'Fichaje registrado sin turno asignado · 09:30–13:00 · revisión de RRHH requerida',
  },
  {
    id: 'i3', employment_id: 'e5', date: '2026-03-17', type: 'unplanned_overtime', shift_id: 's17',
    detail: 'Salida a las 21:30 · turno hasta las 20:00 · +1h 30m no planificadas',
  },
  // Tuesday 2026-03-18
  {
    id: 'i4', employment_id: 'e2', date: '2026-03-18', type: 'late_arrival', shift_id: 's7',
    detail: 'Entrada a las 10:22 · turno planificado a las 10:00 · retraso de 22 min',
  },
  {
    id: 'i5', employment_id: 'e3', date: '2026-03-18', type: 'early_departure', shift_id: 's12',
    detail: 'Salida a las 15:28 · turno hasta las 16:00 · salida anticipada 32 min',
  },
  {
    id: 'i6', employment_id: 'e4', date: '2026-03-18', type: 'no_show', shift_id: 's15',
    detail: 'Sin fichaje registrado · turno planificado a las 20:00 · alerta a las 20:15',
  },
  {
    id: 'i7', employment_id: 'e5', date: '2026-03-18', type: 'unplanned_overtime', shift_id: 's18',
    detail: 'Salida a las 19:10 · turno hasta las 18:00 · +1h 10m no planificadas',
  },
]

// ─── WorkDays — March 2026 closure (week 17–21) ───────────────────────────────
export const MOCK_WORK_DAYS: WorkDay[] = [
  // ── María García (e1) — all approved, minor overruns ─────────────────────────
  { id: 'wd1',  employment_id: 'e1', date: '2026-03-17', planned_hours: 8,    actual_hours: 8.03, deviation_hours:  0.03, incident_count: 0, status: 'approved' },
  { id: 'wd2',  employment_id: 'e1', date: '2026-03-18', planned_hours: 8,    actual_hours: 8.08, deviation_hours:  0.08, incident_count: 0, status: 'approved' },
  { id: 'wd3',  employment_id: 'e1', date: '2026-03-19', planned_hours: 8,    actual_hours: 8,    deviation_hours:  0,    incident_count: 0, status: 'approved' },
  { id: 'wd4',  employment_id: 'e1', date: '2026-03-20', planned_hours: 8,    actual_hours: 8,    deviation_hours:  0,    incident_count: 0, status: 'approved' },
  { id: 'wd5',  employment_id: 'e1', date: '2026-03-21', planned_hours: 8,    actual_hours: 8,    deviation_hours:  0,    incident_count: 0, status: 'approved' },

  // ── Carlos Ruiz (e2) — pending (contract violation + late arrivals) ───────────
  { id: 'wd6',  employment_id: 'e2', date: '2026-03-17', planned_hours: 6.5,  actual_hours: 6.08, deviation_hours: -0.42, incident_count: 1, status: 'pending' },
  { id: 'wd7',  employment_id: 'e2', date: '2026-03-18', planned_hours: 6.5,  actual_hours: 6.13, deviation_hours: -0.37, incident_count: 1, status: 'pending' },
  { id: 'wd8',  employment_id: 'e2', date: '2026-03-19', planned_hours: 6.5,  actual_hours: 6.5,  deviation_hours:  0,    incident_count: 0, status: 'pending' },
  { id: 'wd9',  employment_id: 'e2', date: '2026-03-20', planned_hours: 6.5,  actual_hours: 6.5,  deviation_hours:  0,    incident_count: 0, status: 'pending' },
  { id: 'wd10', employment_id: 'e2', date: '2026-03-21', planned_hours: 6.5,  actual_hours: 6.5,  deviation_hours:  0,    incident_count: 0, status: 'pending' },

  // ── Ana Fernández (e3) — approved (split shifts, early departure Tue) ─────────
  { id: 'wd11', employment_id: 'e3', date: '2026-03-17', planned_hours: 9.5,  actual_hours: 9.52, deviation_hours:  0.02, incident_count: 0, status: 'approved' },
  { id: 'wd12', employment_id: 'e3', date: '2026-03-18', planned_hours: 8,    actual_hours: 7.43, deviation_hours: -0.57, incident_count: 1, status: 'approved', adjustment_note: 'Salida anticipada acordada con responsable' },
  { id: 'wd13', employment_id: 'e3', date: '2026-03-20', planned_hours: 10,   actual_hours: 10,   deviation_hours:  0,    incident_count: 0, status: 'approved' },
  { id: 'wd14', employment_id: 'e3', date: '2026-03-21', planned_hours: 6,    actual_hours: 6,    deviation_hours:  0,    incident_count: 0, status: 'approved' },

  // ── David Sánchez (e4) — pending (no-show Tue + unplanned shift Mon) ──────────
  { id: 'wd15', employment_id: 'e4', date: '2026-03-17', planned_hours: 0,    actual_hours: 3.5,  deviation_hours:  3.5,  incident_count: 1, status: 'pending', adjustment_note: '' },
  { id: 'wd16', employment_id: 'e4', date: '2026-03-18', planned_hours: 5,    actual_hours: null, deviation_hours: -5,    incident_count: 1, status: 'pending' },
  { id: 'wd17', employment_id: 'e4', date: '2026-03-19', planned_hours: 5,    actual_hours: 5,    deviation_hours:  0,    incident_count: 0, status: 'pending' },

  // ── Laura Moreno (e5) — pending (overtime both days + holiday Fri) ────────────
  { id: 'wd18', employment_id: 'e5', date: '2026-03-17', planned_hours: 8,    actual_hours: 9.5,  deviation_hours:  1.5,  incident_count: 1, status: 'pending' },
  { id: 'wd19', employment_id: 'e5', date: '2026-03-18', planned_hours: 6,    actual_hours: 7.12, deviation_hours:  1.12, incident_count: 1, status: 'pending' },
  { id: 'wd20', employment_id: 'e5', date: '2026-03-21', planned_hours: 6,    actual_hours: 6,    deviation_hours:  0,    incident_count: 0, status: 'pending' },

  // ── Roberto Jiménez (e6) — all approved, exact hours ─────────────────────────
  { id: 'wd21', employment_id: 'e6', date: '2026-03-17', planned_hours: 8,    actual_hours: 8,    deviation_hours:  0,    incident_count: 0, status: 'approved' },
  { id: 'wd22', employment_id: 'e6', date: '2026-03-18', planned_hours: 8,    actual_hours: 8,    deviation_hours:  0,    incident_count: 0, status: 'approved' },
  { id: 'wd23', employment_id: 'e6', date: '2026-03-19', planned_hours: 8,    actual_hours: 8,    deviation_hours:  0,    incident_count: 0, status: 'approved' },
  { id: 'wd24', employment_id: 'e6', date: '2026-03-20', planned_hours: 8,    actual_hours: 8,    deviation_hours:  0,    incident_count: 0, status: 'approved' },
  { id: 'wd25', employment_id: 'e6', date: '2026-03-21', planned_hours: 4,    actual_hours: 4,    deviation_hours:  0,    incident_count: 0, status: 'approved' },
]

// ─── Balances — as of March 2026 ──────────────────────────────────────────────
// Each employee has up to 4 separate buckets (PRD §6.5 critical rule: never mixed)
export const MOCK_BALANCES: Balance[] = [
  // ── María García (e1) — 40h/week, Jefe de sala ──────────────────────────────
  { id: 'b1',  employment_id: 'e1', type: 'vacation',     amount_hours:  80,   accrued_hours: 80,  consumed_hours: 0,    expiry_date: '2027-03-31' },
  { id: 'b2',  employment_id: 'e1', type: 'holiday_comp', amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },
  { id: 'b3',  employment_id: 'e1', type: 'overtime',     amount_hours:  0.11, accrued_hours: 0.11,consumed_hours: 0   },
  { id: 'b4',  employment_id: 'e1', type: 'absence',      amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },

  // ── Carlos Ruiz (e2) — 20h/week, Camarero ───────────────────────────────────
  { id: 'b5',  employment_id: 'e2', type: 'vacation',     amount_hours:  40,   accrued_hours: 40,  consumed_hours: 0,    expiry_date: '2027-03-31' },
  { id: 'b6',  employment_id: 'e2', type: 'holiday_comp', amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },
  { id: 'b7',  employment_id: 'e2', type: 'overtime',     amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },
  { id: 'b8',  employment_id: 'e2', type: 'absence',      amount_hours: -1.5,  accrued_hours: 0,   consumed_hours: 1.5 },

  // ── Ana Fernández (e3) — 32h/week, Cocinero ─────────────────────────────────
  { id: 'b9',  employment_id: 'e3', type: 'vacation',     amount_hours:  64,   accrued_hours: 64,  consumed_hours: 0,    expiry_date: '2027-03-31' },
  { id: 'b10', employment_id: 'e3', type: 'holiday_comp', amount_hours:  8,    accrued_hours: 8,   consumed_hours: 0,    expiry_date: '2027-01-15' },
  { id: 'b11', employment_id: 'e3', type: 'overtime',     amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },
  { id: 'b12', employment_id: 'e3', type: 'absence',      amount_hours: -0.57, accrued_hours: 0,   consumed_hours: 0.57 },

  // ── David Sánchez (e4) — 10h/week, Ayudante ─────────────────────────────────
  { id: 'b13', employment_id: 'e4', type: 'vacation',     amount_hours:  20,   accrued_hours: 20,  consumed_hours: 0,    expiry_date: '2027-03-31' },
  { id: 'b14', employment_id: 'e4', type: 'holiday_comp', amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },
  { id: 'b15', employment_id: 'e4', type: 'overtime',     amount_hours:  3.5,  accrued_hours: 3.5, consumed_hours: 0   },
  { id: 'b16', employment_id: 'e4', type: 'absence',      amount_hours: -5,    accrued_hours: 0,   consumed_hours: 5   },

  // ── Laura Moreno (e5) — 20h/week, Camarero ──────────────────────────────────
  { id: 'b17', employment_id: 'e5', type: 'vacation',     amount_hours:  40,   accrued_hours: 40,  consumed_hours: 0,    expiry_date: '2027-03-31' },
  { id: 'b18', employment_id: 'e5', type: 'holiday_comp', amount_hours:  8,    accrued_hours: 8,   consumed_hours: 0,    expiry_date: '2027-03-21' },
  { id: 'b19', employment_id: 'e5', type: 'overtime',     amount_hours:  2.62, accrued_hours: 2.62,consumed_hours: 0   },
  { id: 'b20', employment_id: 'e5', type: 'absence',      amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },

  // ── Roberto Jiménez (e6) — 40h/week, Encargado ──────────────────────────────
  { id: 'b21', employment_id: 'e6', type: 'vacation',     amount_hours:  80,   accrued_hours: 80,  consumed_hours: 0,    expiry_date: '2027-03-31' },
  { id: 'b22', employment_id: 'e6', type: 'holiday_comp', amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },
  { id: 'b23', employment_id: 'e6', type: 'overtime',     amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },
  { id: 'b24', employment_id: 'e6', type: 'absence',      amount_hours:  0,    accrued_hours: 0,   consumed_hours: 0   },
]

// ─── Closure period — March 2026 ──────────────────────────────────────────────
export const MOCK_CLOSURE_PERIOD: ClosurePeriod = {
  id: 'cp1',
  period_label: 'Marzo 2026',
  period_start: '2026-03-01',
  period_end:   '2026-03-31',
  status: 'manager_review',
  employee_closures: [
    {
      employment_id: 'e1', status: 'manager_approved',
      total_planned_hours: 40, total_actual_hours: 40.11, total_deviation_hours: 0.11,
      pending_incidents: 0, adjustment_note: '',
    },
    {
      employment_id: 'e2', status: 'pending',
      total_planned_hours: 32.5, total_actual_hours: 31.71, total_deviation_hours: -0.79,
      pending_incidents: 2, adjustment_note: '',
    },
    {
      employment_id: 'e3', status: 'manager_approved',
      total_planned_hours: 33.5, total_actual_hours: 32.95, total_deviation_hours: -0.55,
      pending_incidents: 0, adjustment_note: 'Salida anticipada del 18/03 acordada con responsable.',
    },
    {
      employment_id: 'e4', status: 'pending',
      total_planned_hours: 10, total_actual_hours: 8.5, total_deviation_hours: -1.5,
      pending_incidents: 2, adjustment_note: '',
    },
    {
      employment_id: 'e5', status: 'pending',
      total_planned_hours: 20, total_actual_hours: 22.62, total_deviation_hours: 2.62,
      pending_incidents: 2, adjustment_note: '',
    },
    {
      employment_id: 'e6', status: 'employee_signed',
      total_planned_hours: 36, total_actual_hours: 36, total_deviation_hours: 0,
      pending_incidents: 0, adjustment_note: '',
      signed_at: '2026-03-22T10:14:00Z',
    },
  ],
}
