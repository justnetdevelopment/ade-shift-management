/**
 * Gantt-specific mock data:
 *  - Extra shifts for employees e7–e25 (same week 2026-03-17)
 *  - Absences
 *  - Employee cost rates
 *  - Revenue daily
 */

import type { Shift, Absence, EmployeeCost, RevenueDaily } from './types'

// ─── Extra shifts (e7–e25) for week 2026-03-17 ────────────────────────────────
// Designed to show a realistic restaurant operation spread across the day.

export const MOCK_EXTRA_SHIFTS: Shift[] = [
  // ── e7 hamza jahangir (Cocina, 40h) — Mon–Fri 08:00–16:00 ──────────────────
  { id: 'g1',  employment_id: 'e7',  date: '2026-03-17', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g2',  employment_id: 'e7',  date: '2026-03-18', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g3',  employment_id: 'e7',  date: '2026-03-19', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g4',  employment_id: 'e7',  date: '2026-03-20', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 8 },
  { id: 'g5',  employment_id: 'e7',  date: '2026-03-21', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 8 },

  // ── e8 nicole noemi (Sala, 20h) — Tue–Fri 13:00–18:00 ─────────────────────
  { id: 'g6',  employment_id: 'e8',  date: '2026-03-18', start_time: '13:00', end_time: '18:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 5 },
  { id: 'g7',  employment_id: 'e8',  date: '2026-03-19', start_time: '13:00', end_time: '18:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 5 },
  { id: 'g8',  employment_id: 'e8',  date: '2026-03-20', start_time: '13:00', end_time: '18:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 5 },
  { id: 'g9',  employment_id: 'e8',  date: '2026-03-21', start_time: '13:00', end_time: '18:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 5 },

  // ── e9 lamine sane (Cocina, 20h) — Mon/Wed/Thu/Sat 16:00–21:00 ─────────────
  { id: 'g10', employment_id: 'e9',  date: '2026-03-17', start_time: '16:00', end_time: '21:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 5 },
  { id: 'g11', employment_id: 'e9',  date: '2026-03-19', start_time: '16:00', end_time: '21:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 5 },
  { id: 'g12', employment_id: 'e9',  date: '2026-03-20', start_time: '16:00', end_time: '21:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 5 },
  { id: 'g13', employment_id: 'e9',  date: '2026-03-22', start_time: '16:00', end_time: '21:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 5 },

  // ── e10 jose carlos (Sala, 40h) — Mon–Fri 11:00–19:00 ─────────────────────
  { id: 'g14', employment_id: 'e10', date: '2026-03-17', start_time: '11:00', end_time: '19:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g15', employment_id: 'e10', date: '2026-03-18', start_time: '11:00', end_time: '19:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g16', employment_id: 'e10', date: '2026-03-19', start_time: '11:00', end_time: '19:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g17', employment_id: 'e10', date: '2026-03-20', start_time: '11:00', end_time: '19:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 8 },
  { id: 'g18', employment_id: 'e10', date: '2026-03-21', start_time: '11:00', end_time: '19:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 8 },

  // ── e11 hamza souane (Cocina, 32h) — Mon–Thu 10:00–18:00 ──────────────────
  { id: 'g19', employment_id: 'e11', date: '2026-03-17', start_time: '10:00', end_time: '18:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g20', employment_id: 'e11', date: '2026-03-18', start_time: '10:00', end_time: '18:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g21', employment_id: 'e11', date: '2026-03-19', start_time: '10:00', end_time: '18:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g22', employment_id: 'e11', date: '2026-03-20', start_time: '10:00', end_time: '18:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 8 },

  // ── e12 carlos arturo (Sala, 20h) — Wed/Thu/Fri 18:00–01:00 (nocturno) ─────
  { id: 'g23', employment_id: 'e12', date: '2026-03-19', start_time: '18:00', end_time: '00:30', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 6.5 },
  { id: 'g24', employment_id: 'e12', date: '2026-03-20', start_time: '18:00', end_time: '00:30', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 6.5 },
  { id: 'g25', employment_id: 'e12', date: '2026-03-21', start_time: '18:00', end_time: '00:30', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 6.5 },

  // ── e13 sellam (Mantenimiento, 40h) — Mon–Fri 08:00–16:00 ─────────────────
  { id: 'g26', employment_id: 'e13', date: '2026-03-17', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Mantenimiento', status: 'published', duration_hours: 8 },
  { id: 'g27', employment_id: 'e13', date: '2026-03-18', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Mantenimiento', status: 'published', duration_hours: 8 },
  { id: 'g28', employment_id: 'e13', date: '2026-03-19', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Mantenimiento', status: 'published', duration_hours: 8 },
  { id: 'g29', employment_id: 'e13', date: '2026-03-20', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Mantenimiento', status: 'draft',     duration_hours: 8 },
  { id: 'g30', employment_id: 'e13', date: '2026-03-21', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Mantenimiento', status: 'draft',     duration_hours: 8 },

  // ── e14 ana isabel (Sala, 20h) — Thu–Sat 17:00–01:00 (nocturno) ───────────
  { id: 'g31', employment_id: 'e14', date: '2026-03-19', start_time: '17:00', end_time: '00:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 7 },
  { id: 'g32', employment_id: 'e14', date: '2026-03-20', start_time: '17:00', end_time: '00:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 7 },
  { id: 'g33', employment_id: 'e14', date: '2026-03-22', start_time: '12:00', end_time: '18:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 6 },

  // ── e15 israel flores (Cocina, 32h) — Mon–Thu 14:00–22:00 ─────────────────
  { id: 'g34', employment_id: 'e15', date: '2026-03-17', start_time: '14:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g35', employment_id: 'e15', date: '2026-03-18', start_time: '14:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g36', employment_id: 'e15', date: '2026-03-19', start_time: '14:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g37', employment_id: 'e15', date: '2026-03-20', start_time: '14:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 8 },

  // ── e16 abrahan (Sala, 20h) — Mon–Thu 12:00–17:00 ─────────────────────────
  { id: 'g38', employment_id: 'e16', date: '2026-03-17', start_time: '12:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 5 },
  { id: 'g39', employment_id: 'e16', date: '2026-03-18', start_time: '12:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 5 },
  { id: 'g40', employment_id: 'e16', date: '2026-03-19', start_time: '12:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 5 },
  { id: 'g41', employment_id: 'e16', date: '2026-03-20', start_time: '12:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 5 },

  // ── e17 prueba justnet (Sala, 40h) — Mon–Fri 09:00–17:00 ──────────────────
  { id: 'g42', employment_id: 'e17', date: '2026-03-17', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g43', employment_id: 'e17', date: '2026-03-18', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g44', employment_id: 'e17', date: '2026-03-19', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g45', employment_id: 'e17', date: '2026-03-20', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 8 },
  { id: 'g46', employment_id: 'e17', date: '2026-03-21', start_time: '09:00', end_time: '17:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 8 },

  // ── e18 fabio rejon (Sala, 40h) — Mon–Thu 18:00–02:00 (nocturno) ──────────
  { id: 'g47', employment_id: 'e18', date: '2026-03-17', start_time: '18:00', end_time: '02:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g48', employment_id: 'e18', date: '2026-03-18', start_time: '18:00', end_time: '02:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g49', employment_id: 'e18', date: '2026-03-19', start_time: '18:00', end_time: '02:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g50', employment_id: 'e18', date: '2026-03-20', start_time: '18:00', end_time: '02:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 8 },
  { id: 'g51', employment_id: 'e18', date: '2026-03-21', start_time: '18:00', end_time: '02:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 8 },

  // ── e19 kelly (Sala, 20h) — Wed–Sat 20:00–01:00 (nocturno) ───────────────
  { id: 'g52', employment_id: 'e19', date: '2026-03-18', start_time: '20:00', end_time: '01:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 5 },
  { id: 'g53', employment_id: 'e19', date: '2026-03-19', start_time: '20:00', end_time: '01:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 5 },
  { id: 'g54', employment_id: 'e19', date: '2026-03-20', start_time: '20:00', end_time: '01:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 5 },
  { id: 'g55', employment_id: 'e19', date: '2026-03-22', start_time: '20:00', end_time: '01:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 5 },

  // ── e20 danny mycol (Cocina, 32h) — Mon–Thu 08:00–16:00 ───────────────────
  { id: 'g56', employment_id: 'e20', date: '2026-03-17', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g57', employment_id: 'e20', date: '2026-03-18', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g58', employment_id: 'e20', date: '2026-03-19', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 8 },
  { id: 'g59', employment_id: 'e20', date: '2026-03-20', start_time: '08:00', end_time: '16:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 8 },

  // ── e21 muhammad (Sala, 40h) — Mon–Fri 13:00–21:00 ───────────────────────
  { id: 'g60', employment_id: 'e21', date: '2026-03-17', start_time: '13:00', end_time: '21:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g61', employment_id: 'e21', date: '2026-03-18', start_time: '13:00', end_time: '21:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g62', employment_id: 'e21', date: '2026-03-19', start_time: '13:00', end_time: '21:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 8 },
  { id: 'g63', employment_id: 'e21', date: '2026-03-20', start_time: '13:00', end_time: '21:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 8 },
  { id: 'g64', employment_id: 'e21', date: '2026-03-21', start_time: '13:00', end_time: '21:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 8 },

  // ── e22 abderrahim (Cocina, 20h) — Thu–Sat 17:00–21:00 ───────────────────
  { id: 'g65', employment_id: 'e22', date: '2026-03-19', start_time: '17:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'published', duration_hours: 5 },
  { id: 'g66', employment_id: 'e22', date: '2026-03-20', start_time: '17:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 5 },
  { id: 'g67', employment_id: 'e22', date: '2026-03-21', start_time: '17:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 5 },
  { id: 'g68', employment_id: 'e22', date: '2026-03-22', start_time: '17:00', end_time: '22:00', center_id: 'c5', role: 'Cocina', status: 'draft',     duration_hours: 5 },

  // ── e23 daniela: VACATION ENTIRE WEEK — no shifts ─────────────────────────

  // ── e24 jainaba (Sala, 20h) — Mon–Fri 16:00–20:00 ────────────────────────
  { id: 'g69', employment_id: 'e24', date: '2026-03-17', start_time: '16:00', end_time: '20:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 4 },
  { id: 'g70', employment_id: 'e24', date: '2026-03-18', start_time: '16:00', end_time: '20:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 4 },
  { id: 'g71', employment_id: 'e24', date: '2026-03-19', start_time: '16:00', end_time: '21:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 5 },
  { id: 'g72', employment_id: 'e24', date: '2026-03-20', start_time: '16:00', end_time: '20:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 4 },
  { id: 'g73', employment_id: 'e24', date: '2026-03-21', start_time: '16:00', end_time: '19:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 3 },

  // ── e25 marilyn (Sala, 20h) — Tue–Sat 10:00–14:00 ────────────────────────
  { id: 'g74', employment_id: 'e25', date: '2026-03-18', start_time: '10:00', end_time: '14:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 4 },
  { id: 'g75', employment_id: 'e25', date: '2026-03-19', start_time: '10:00', end_time: '14:00', center_id: 'c5', role: 'Sala', status: 'published', duration_hours: 4 },
  { id: 'g76', employment_id: 'e25', date: '2026-03-20', start_time: '10:00', end_time: '14:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 4 },
  { id: 'g77', employment_id: 'e25', date: '2026-03-21', start_time: '10:00', end_time: '14:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 4 },
  { id: 'g78', employment_id: 'e25', date: '2026-03-22', start_time: '10:00', end_time: '14:00', center_id: 'c5', role: 'Sala', status: 'draft',     duration_hours: 4 },
]

// ─── Absences ─────────────────────────────────────────────────────────────────

export const MOCK_ABSENCES: Absence[] = [
  {
    id: 'abs1',
    employment_id: 'e23',
    type: 'vacation',
    label: 'Vacaciones',
    start_date: '2026-03-16',
    end_date: '2026-03-22',
    status: 'approved',
    reason: 'Vacaciones de semana santa',
    blocks_planning: true,
  },
  {
    id: 'abs2',
    employment_id: 'e4',
    type: 'sick_leave',
    label: 'Baja médica',
    start_date: '2026-03-20',
    end_date: '2026-03-24',
    status: 'approved',
    reason: 'Gastroenteritis',
    blocks_planning: true,
  },
  {
    id: 'abs3',
    employment_id: 'e2',
    type: 'personal',
    label: 'Asuntos propios',
    start_date: '2026-03-21',
    end_date: '2026-03-21',
    status: 'approved',
    blocks_planning: false,  // warning but not blocked
  },
]

// ─── Employee cost rates ───────────────────────────────────────────────────────
// hourly_rate = gross €/h  |  ss_rate = employer SS ~29.8%

export const MOCK_EMPLOYEE_COSTS: EmployeeCost[] = [
  { employment_id: 'e1',  hourly_rate: 15.20, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e2',  hourly_rate: 10.80, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e3',  hourly_rate: 12.50, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e4',  hourly_rate: 9.50,  ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e5',  hourly_rate: 10.80, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e6',  hourly_rate: 14.00, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e7',  hourly_rate: 12.50, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e8',  hourly_rate: 10.80, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e9',  hourly_rate: 11.00, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e10', hourly_rate: 13.50, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e11', hourly_rate: 12.00, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e12', hourly_rate: 11.50, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e13', hourly_rate: 12.00, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e14', hourly_rate: 10.80, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e15', hourly_rate: 11.50, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e16', hourly_rate: 10.50, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e17', hourly_rate: 11.80, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e18', hourly_rate: 13.00, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e19', hourly_rate: 10.80, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e20', hourly_rate: 11.00, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e21', hourly_rate: 12.80, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e22', hourly_rate: 11.00, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e23', hourly_rate: 10.80, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e24', hourly_rate: 10.50, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
  { employment_id: 'e25', hourly_rate: 10.50, ss_rate: 0.298, overtime_mult: 1.25, night_mult: 1.25, night_start: '22:00', night_end: '06:00' },
]

// ─── Revenue daily (center c5, week 2026-03-17) ───────────────────────────────

export const MOCK_REVENUE_DAILY: RevenueDaily[] = [
  { center_id: 'c5', date: '2026-03-17', revenue_actual: 9_840,  revenue_estimated: 9_000,  covers: 312, source: 'manual',   target_labor_ratio: 0.15 },
  { center_id: 'c5', date: '2026-03-18', revenue_actual: 12_350, revenue_estimated: 11_500, covers: 398, source: 'manual',   target_labor_ratio: 0.15 },
  { center_id: 'c5', date: '2026-03-19', revenue_actual: 11_200, revenue_estimated: 11_000, covers: 362, source: 'manual',   target_labor_ratio: 0.15 },
  { center_id: 'c5', date: '2026-03-20', revenue_actual: null,   revenue_estimated: 10_500, covers: null, source: 'estimate', target_labor_ratio: 0.15 },
  { center_id: 'c5', date: '2026-03-21', revenue_actual: null,   revenue_estimated: 16_200, covers: null, source: 'estimate', target_labor_ratio: 0.15 },
  { center_id: 'c5', date: '2026-03-22', revenue_actual: null,   revenue_estimated: 18_500, covers: null, source: 'estimate', target_labor_ratio: 0.15 },
  { center_id: 'c5', date: '2026-03-23', revenue_actual: null,   revenue_estimated: 14_000, covers: null, source: 'estimate', target_labor_ratio: 0.15 },
]
