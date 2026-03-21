# SCREENS.md — Template

> Generated during Phase 1 of the PRD → UI process.
> One entry per UI surface. Complete all columns before moving to Phase 2.

---

## Screen Inventory

### [MODULE NAME]

#### Screen: [Screen Name]

| Field | Value |
|---|---|
| **ID** | SCR-001 |
| **Module** | e.g., Planning |
| **Type** | List / Detail / Form / Grid / Dashboard / Wizard / Modal / Inspection |
| **Route** | `/planning/week` |
| **Primary Persona** | Manager / HR / Employee / Finance / Inspector |
| **Also accessible to** | (other roles, or "none") |
| **PRD Reference** | Section 6.2 |

**Purpose (one sentence):**
What this screen enables the user to accomplish.

**Data Displayed:**
- Entity 1 fields: field_a, field_b, field_c
- Entity 2 fields: field_x, field_y
- Derived/computed: total_hours, deviation_pct

**Actions Available:**
- Primary action: (e.g., "Publish planning")
- Secondary actions: (e.g., "Add shift", "Copy week", "Export")
- Destructive actions: (e.g., "Delete shift" — requires confirmation)

**Validation Rules (from PRD):**
- Rule 1: (e.g., "Planned hours > contracted hours → show error, block publish")
- Rule 2: (e.g., "Shift on public holiday → auto-generate balance entry")

**States Required:**
- [ ] Loading skeleton
- [ ] Empty state (no data yet)
- [ ] Populated state
- [ ] Error state (data fetch failed)
- [ ] Locked state (if period is closed)

**Relationships:**
- Navigates to: SCR-002 (Shift Detail)
- Opened from: SCR-000 (Dashboard)
- Contains modals: SCR-003 (Add Shift Modal)

**Notes / Open Questions:**
- (any unresolved design decisions for this screen)

---

## Full Inventory Table (summary)

| ID | Screen Name | Module | Type | Persona | Route | Priority |
|---|---|---|---|---|---|---|
| SCR-001 | Weekly Planning Grid | Planning | Grid | Manager | `/planning` | P0 |
| SCR-002 | Shift Detail Drawer | Planning | Modal | Manager | (drawer) | P0 |
| SCR-003 | Add/Edit Shift Form | Planning | Form | Manager | (modal) | P0 |
| SCR-004 | Employee List | Employees | List | HR | `/employees` | P0 |
| SCR-005 | Employee Detail | Employees | Detail | HR | `/employees/:id` | P0 |
| SCR-006 | Employment Form | Employees | Form | HR | `/employees/:id/employment/new` | P0 |
| SCR-007 | Time Tracking Dashboard | Time | Dashboard | Manager | `/time` | P0 |
| SCR-008 | WorkDay Detail | Closure | Detail | Manager/HR | `/workdays/:id` | P1 |
| SCR-009 | Monthly Closure Wizard | Closure | Wizard | HR | `/closure/:period` | P1 |
| SCR-010 | Balance Summary | Balances | Dashboard | HR/Employee | `/balances` | P1 |
| SCR-011 | Cost Dashboard | Costs | Dashboard | Finance | `/costs` | P1 |
| SCR-012 | Inspection View | Inspection | Inspection | Inspector | `/inspection` | P1 |
| SCR-013 | Rules Engine | Settings | Form/List | HR | `/settings/rules` | P2 |
| SCR-014 | User Management | Settings | List | Super Admin | `/settings/users` | P2 |

**Priority:**
- **P0** — Required for MVP launch
- **P1** — Required for V1.0
- **P2** — Can launch without; deliver in next cycle
