import type { Center, Employment, Shift, ValidationViolation, TimeEntry, Incident, WorkDay, ClosurePeriod, Balance, StandardWeekShift } from './types'

export const MOCK_CENTERS: Center[] = [
  { id: 'c1', name: 'Alcobita',     company_id: 'co1' },
  { id: 'c2', name: 'El Bandoler',  company_id: 'co1' },
  { id: 'c3', name: 'Alcoba Azul',  company_id: 'co1' },
  { id: 'c4', name: 'Rumbla',       company_id: 'co1' },
  { id: 'c5', name: 'Arenal',       company_id: 'co1' },
  { id: 'c6', name: 'Barcino',      company_id: 'co1' },
  { id: 'c7', name: 'Xup Xup',      company_id: 'co1' },
  { id: 'c8', name: 'Oficina',      company_id: 'co1' },
]

export const MOCK_ROLES = ['Sala', 'Cocina', 'Mantenimiento', 'Limpieza']

export const MOCK_EMPLOYMENTS: Employment[] = [
  {
    id: 'e1',
    person_id: 'p1',
    person: { id: 'p1', legal_name: 'marc hernandez geli', national_id: '44001700D', avatar_initials: 'MH', avatar_color: '#4f46e5' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e2',
    person_id: 'p2',
    person: { id: 'p2', legal_name: 'joaquin manuel ramos carvallo', national_id: '08843906S', avatar_initials: 'JR', avatar_color: '#16a34a' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e3',
    person_id: 'p3',
    person: { id: 'p3', legal_name: 'raimunda nonata silva lago', national_id: '31914822E', avatar_initials: 'RS', avatar_color: '#d97706' },
    company_id: 'co1',
    role: 'Cocina',
    contracted_hours_week: 32,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e4',
    person_id: 'p4',
    person: { id: 'p4', legal_name: 'antonio mendes gonçalves', national_id: '55362330L', avatar_initials: 'AM', avatar_color: '#dc2626' },
    company_id: 'co1',
    role: 'Cocina',
    contracted_hours_week: 10,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e5',
    person_id: 'p5',
    person: { id: 'p5', legal_name: 'danielli simoes de oliveira', national_id: '31915927T', avatar_initials: 'DS', avatar_color: '#7c3aed' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e6',
    person_id: 'p6',
    person: { id: 'p6', legal_name: 'abdoulaye drame', national_id: 'Y6894700G', avatar_initials: 'AD', avatar_color: '#0284c7' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e7',
    person_id: 'p7',
    person: { id: 'p7', legal_name: 'hamza jahangir', national_id: 'Y3422743N', avatar_initials: 'HJ', avatar_color: '#be185d' },
    company_id: 'co1',
    role: 'Cocina',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e8',
    person_id: 'p8',
    person: { id: 'p8', legal_name: 'nicole noemi de la rosa suero', national_id: '60314075W', avatar_initials: 'NR', avatar_color: '#0891b2' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e9',
    person_id: 'p9',
    person: { id: 'p9', legal_name: 'lamine sane', national_id: 'Y7422764B', avatar_initials: 'LS', avatar_color: '#65a30d' },
    company_id: 'co1',
    role: 'Cocina',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e10',
    person_id: 'p10',
    person: { id: 'p10', legal_name: 'jose carlos salinas bracesco', national_id: '60597265Q', avatar_initials: 'JS', avatar_color: '#9333ea' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e11',
    person_id: 'p11',
    person: { id: 'p11', legal_name: 'hamza souane sebari', national_id: '26592725X', avatar_initials: 'HS', avatar_color: '#ea580c' },
    company_id: 'co1',
    role: 'Cocina',
    contracted_hours_week: 32,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e12',
    person_id: 'p12',
    person: { id: 'p12', legal_name: 'carlos arturo rendon ramirez', national_id: '18463060V', avatar_initials: 'CR', avatar_color: '#0d9488' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e13',
    person_id: 'p13',
    person: { id: 'p13', legal_name: 'sellam mouloulid', national_id: 'Y6788900G', avatar_initials: 'SM', avatar_color: '#6366f1' },
    company_id: 'co1',
    role: 'Mantenimiento',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e14',
    person_id: 'p14',
    person: { id: 'p14', legal_name: 'ana isabel hernandez utrilla', national_id: '78090884L', avatar_initials: 'AH', avatar_color: '#b45309' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e15',
    person_id: 'p15',
    person: { id: 'p15', legal_name: 'israel flores mamani', national_id: '01884844V', avatar_initials: 'IF', avatar_color: '#1d4ed8' },
    company_id: 'co1',
    role: 'Cocina',
    contracted_hours_week: 32,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e16',
    person_id: 'p16',
    person: { id: 'p16', legal_name: 'abrahan jose bastidas galeno', national_id: 'X3540073M', avatar_initials: 'AB', avatar_color: '#15803d' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e17',
    person_id: 'p17',
    person: { id: 'p17', legal_name: 'prueba justnet', national_id: 'X6928918F', avatar_initials: 'PJ', avatar_color: '#9f1239' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e18',
    person_id: 'p18',
    person: { id: 'p18', legal_name: 'fabio rejon casado', national_id: '52598639P', avatar_initials: 'FR', avatar_color: '#0369a1' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e19',
    person_id: 'p19',
    person: { id: 'p19', legal_name: 'kelly gonzalez murillo', national_id: '48234504P', avatar_initials: 'KG', avatar_color: '#7e22ce' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e20',
    person_id: 'p20',
    person: { id: 'p20', legal_name: 'danny mycol paredes becerra', national_id: 'Y8634974Y', avatar_initials: 'DP', avatar_color: '#c2410c' },
    company_id: 'co1',
    role: 'Cocina',
    contracted_hours_week: 32,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e21',
    person_id: 'p21',
    person: { id: 'p21', legal_name: 'muhammad waqas rana', national_id: 'Y3569163Z', avatar_initials: 'MR', avatar_color: '#0f766e' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 40,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e22',
    person_id: 'p22',
    person: { id: 'p22', legal_name: 'abderrahim hazakhana', national_id: 'Y6052320E', avatar_initials: 'AZ', avatar_color: '#4338ca' },
    company_id: 'co1',
    role: 'Cocina',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e23',
    person_id: 'p23',
    person: { id: 'p23', legal_name: 'daniela dianelis methol carvajal', national_id: '46415975C', avatar_initials: 'DM', avatar_color: '#a16207' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e24',
    person_id: 'p24',
    person: { id: 'p24', legal_name: 'jainaba sise touray', national_id: '38887747Z', avatar_initials: 'JT', avatar_color: '#166534' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
  {
    id: 'e25',
    person_id: 'p25',
    person: { id: 'p25', legal_name: 'marilyn peralta lopez', national_id: 'Z1629866E', avatar_initials: 'MP', avatar_color: '#1e40af' },
    company_id: 'co1',
    role: 'Sala',
    contracted_hours_week: 20,
    status: 'active',
    center_id: 'c5',
  },
]

// Standard week templates per employment (day_of_week: 0=Mon … 6=Sun)
export const MOCK_STANDARD_WEEKS: Record<string, StandardWeekShift[]> = {
  // marc hernandez geli — 40h, sala Mon–Fri 09:00–17:00
  e1: [
    { day_of_week: 0, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 1, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 2, start_time: '12:00', end_time: '20:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 3, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 4, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
  ],
  // raimunda nonata silva lago — 32h, cocina Mon–Thu 10:00–18:00
  e3: [
    { day_of_week: 0, start_time: '10:00', end_time: '18:00', center_id: 'c5', role: 'Cocina' },
    { day_of_week: 1, start_time: '10:00', end_time: '18:00', center_id: 'c5', role: 'Cocina' },
    { day_of_week: 2, start_time: '10:00', end_time: '18:00', center_id: 'c5', role: 'Cocina' },
    { day_of_week: 3, start_time: '10:00', end_time: '18:00', center_id: 'c5', role: 'Cocina' },
  ],
  // danielli simoes de oliveira — 20h, sala Mié–Sáb 15:00–20:00
  e5: [
    { day_of_week: 2, start_time: '15:00', end_time: '20:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 3, start_time: '15:00', end_time: '20:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 4, start_time: '15:00', end_time: '20:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 5, start_time: '15:00', end_time: '20:00', center_id: 'c5', role: 'Sala' },
  ],
  // abdoulaye drame — 40h, sala Mon–Fri 09:00–17:00
  e6: [
    { day_of_week: 0, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 1, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 2, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 3, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
    { day_of_week: 4, start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala' },
  ],
}

// Week of 2026-03-17 (Mon) to 2026-03-23 (Sun)
export const MOCK_SHIFTS: Shift[] = [
  // marc hernandez geli (40h contracted)
  { id: 's1', employment_id: 'e1', date: '2026-03-17', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 's2', employment_id: 'e1', date: '2026-03-18', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 's3', employment_id: 'e1', date: '2026-03-19', start_time: '12:00', end_time: '20:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 's4', employment_id: 'e1', date: '2026-03-20', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 's5', employment_id: 'e1', date: '2026-03-21', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 8 },

  // joaquin manuel ramos carvallo (20h contracted) — VIOLATION: 32.5h planned
  { id: 's6', employment_id: 'e2', date: '2026-03-17', start_time: '10:00', end_time: '16:30', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 6.5 },
  { id: 's7', employment_id: 'e2', date: '2026-03-18', start_time: '10:00', end_time: '16:30', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 6.5 },
  { id: 's8', employment_id: 'e2', date: '2026-03-19', start_time: '10:00', end_time: '16:30', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 6.5 },
  { id: 's9', employment_id: 'e2', date: '2026-03-20', start_time: '10:00', end_time: '16:30', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 6.5 },
  { id: 's10', employment_id: 'e2', date: '2026-03-21', start_time: '10:00', end_time: '16:30', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 6.5 },

  // raimunda nonata silva lago (32h contracted) — split shift on Monday (turno partido)
  { id: 's11', employment_id: 'e3', date: '2026-03-17', start_time: '08:00', end_time: '14:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 6 },
  { id: 's11b', employment_id: 'e3', date: '2026-03-17', start_time: '17:30', end_time: '21:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 3.5 },
  { id: 's12', employment_id: 'e3', date: '2026-03-18', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 's13', employment_id: 'e3', date: '2026-03-20', start_time: '08:00', end_time: '14:00', center_id: 'c5', role: 'Cocina', status: 'draft', duration_hours: 6 },
  { id: 's13b', employment_id: 'e3', date: '2026-03-20', start_time: '18:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'draft', duration_hours: 4 },
  { id: 's14', employment_id: 'e3', date: '2026-03-21', start_time: '08:00', end_time: '14:00', center_id: 'c5', role: 'Cocina', status: 'draft', duration_hours: 6 },

  // antonio mendes gonçalves (10h contracted) — VIOLATION: rest gap warning on Wed→Thu
  { id: 's15', employment_id: 'e4', date: '2026-03-18', start_time: '20:00', end_time: '01:00', center_id: 'c5', role: 'Cocina', status: 'draft', duration_hours: 5 },
  { id: 's16', employment_id: 'e4', date: '2026-03-19', start_time: '07:00', end_time: '12:00', center_id: 'c5', role: 'Cocina', status: 'draft', duration_hours: 5 },

  // danielli simoes de oliveira (20h contracted) — holiday on Friday (INFO)
  { id: 's17', employment_id: 'e5', date: '2026-03-17', start_time: '12:00', end_time: '20:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 's18', employment_id: 'e5', date: '2026-03-18', start_time: '12:00', end_time: '18:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 6 },
  { id: 's19', employment_id: 'e5', date: '2026-03-21', start_time: '10:00', end_time: '16:00', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 6 },

  // abdoulaye drame (40h contracted)
  { id: 's20', employment_id: 'e6', date: '2026-03-17', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 's21', employment_id: 'e6', date: '2026-03-18', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 's22', employment_id: 'e6', date: '2026-03-19', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 's23', employment_id: 'e6', date: '2026-03-20', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 8 },
  { id: 's24', employment_id: 'e6', date: '2026-03-21', start_time: '09:00', end_time: '13:00', center_id: 'c5', role: 'Sala', status: 'draft', duration_hours: 4 },
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

// ─── Employee Portal — María García (e1) demo data ────────────────────────────
// Covers 4 weeks for the schedule view: -1 week past, current week, +2 future

export const PORTAL_EMPLOYMENT_ID = 'e1'

// Extra shifts for weeks outside the planning mock (e1 only)
export const PORTAL_EXTRA_SHIFTS: Shift[] = [
  // Week 2026-03-10 (prev week) — Mon–Fri 09:00–17:00
  { id: 'pe1',  employment_id: 'e1', date: '2026-03-10', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'locked',    duration_hours: 8 },
  { id: 'pe2',  employment_id: 'e1', date: '2026-03-11', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'locked',    duration_hours: 8 },
  { id: 'pe3',  employment_id: 'e1', date: '2026-03-12', start_time: '12:00', end_time: '20:00', center_id: 'c1', role: 'Jefe de sala', status: 'locked',    duration_hours: 8 },
  { id: 'pe4',  employment_id: 'e1', date: '2026-03-13', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'locked',    duration_hours: 8 },
  { id: 'pe5',  employment_id: 'e1', date: '2026-03-14', start_time: '09:00', end_time: '13:00', center_id: 'c1', role: 'Jefe de sala', status: 'locked',    duration_hours: 4 },
  // Week 2026-03-24 (next week) — Mon turno partido, rest standard
  { id: 'pe6',   employment_id: 'e1', date: '2026-03-24', start_time: '09:00', end_time: '14:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 5 },
  { id: 'pe6b',  employment_id: 'e1', date: '2026-03-24', start_time: '20:00', end_time: '23:00', center_id: 'c2', role: 'Jefe de sala', status: 'published', duration_hours: 3 },
  { id: 'pe7',   employment_id: 'e1', date: '2026-03-25', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 8 },
  { id: 'pe8',   employment_id: 'e1', date: '2026-03-26', start_time: '11:00', end_time: '19:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 8 },
  { id: 'pe9',   employment_id: 'e1', date: '2026-03-27', start_time: '09:00', end_time: '14:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 5 },
  { id: 'pe9b',  employment_id: 'e1', date: '2026-03-27', start_time: '19:00', end_time: '23:00', center_id: 'c1', role: 'Jefe de sala', status: 'published', duration_hours: 4 },
  { id: 'pe10',  employment_id: 'e1', date: '2026-03-28', start_time: '09:00', end_time: '13:00', center_id: 'c1', role: 'Jefe de sala', status: 'draft',     duration_hours: 4 },
  // Week 2026-03-31 (week after next)
  { id: 'pe11', employment_id: 'e1', date: '2026-03-31', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'draft',     duration_hours: 8 },
  { id: 'pe12', employment_id: 'e1', date: '2026-04-01', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'draft',     duration_hours: 8 },
  { id: 'pe13', employment_id: 'e1', date: '2026-04-02', start_time: '12:00', end_time: '20:00', center_id: 'c1', role: 'Jefe de sala', status: 'draft',     duration_hours: 8 },
  { id: 'pe14', employment_id: 'e1', date: '2026-04-03', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'draft',     duration_hours: 8 },
  { id: 'pe15', employment_id: 'e1', date: '2026-04-04', start_time: '09:00', end_time: '17:00', center_id: 'c1', role: 'Jefe de sala', status: 'draft',     duration_hours: 8 },
]

// Time entries for history: past 2 weeks for e1
export const PORTAL_TIME_ENTRIES: TimeEntry[] = [
  // Week 2026-03-10
  { id: 'ph1',  employment_id: 'e1', date: '2026-03-10', timestamp: '09:02', type: 'in',  source: 'kiosk'  },
  { id: 'ph2',  employment_id: 'e1', date: '2026-03-10', timestamp: '13:01', type: 'break_start', source: 'kiosk' },
  { id: 'ph3',  employment_id: 'e1', date: '2026-03-10', timestamp: '14:00', type: 'break_end',   source: 'kiosk' },
  { id: 'ph4',  employment_id: 'e1', date: '2026-03-10', timestamp: '17:04', type: 'out', source: 'kiosk'  },
  { id: 'ph5',  employment_id: 'e1', date: '2026-03-11', timestamp: '08:58', type: 'in',  source: 'kiosk'  },
  { id: 'ph6',  employment_id: 'e1', date: '2026-03-11', timestamp: '17:00', type: 'out', source: 'kiosk'  },
  { id: 'ph7',  employment_id: 'e1', date: '2026-03-12', timestamp: '12:00', type: 'in',  source: 'mobile' },
  { id: 'ph8',  employment_id: 'e1', date: '2026-03-12', timestamp: '20:03', type: 'out', source: 'mobile' },
  { id: 'ph9',  employment_id: 'e1', date: '2026-03-13', timestamp: '09:10', type: 'in',  source: 'kiosk'  },
  { id: 'ph10', employment_id: 'e1', date: '2026-03-13', timestamp: '17:06', type: 'out', source: 'kiosk'  },
  { id: 'ph11', employment_id: 'e1', date: '2026-03-14', timestamp: '09:00', type: 'in',  source: 'kiosk'  },
  { id: 'ph12', employment_id: 'e1', date: '2026-03-14', timestamp: '13:02', type: 'out', source: 'kiosk'  },
  // Week 2026-03-17 (reuse MOCK_TIME_ENTRIES for e1: te1+te2, te17+te18)
  // Already in MOCK_TIME_ENTRIES — combined at portal level
]

// WorkDays for portal history (e1, prev week)
export const PORTAL_WORK_DAYS: WorkDay[] = [
  { id: 'pwd1', employment_id: 'e1', date: '2026-03-10', planned_hours: 8,   actual_hours: 8.03, deviation_hours:  0.03, incident_count: 0, status: 'approved' },
  { id: 'pwd2', employment_id: 'e1', date: '2026-03-11', planned_hours: 8,   actual_hours: 8.03, deviation_hours:  0.03, incident_count: 0, status: 'approved' },
  { id: 'pwd3', employment_id: 'e1', date: '2026-03-12', planned_hours: 8,   actual_hours: 8.05, deviation_hours:  0.05, incident_count: 0, status: 'approved' },
  { id: 'pwd4', employment_id: 'e1', date: '2026-03-13', planned_hours: 8,   actual_hours: 7.93, deviation_hours: -0.07, incident_count: 0, status: 'approved' },
  { id: 'pwd5', employment_id: 'e1', date: '2026-03-14', planned_hours: 4,   actual_hours: 4.03, deviation_hours:  0.03, incident_count: 0, status: 'approved' },
]
