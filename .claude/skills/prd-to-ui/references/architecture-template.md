# ARCHITECTURE.md — Template

> Generated during Phase 2 of the PRD → UI process.
> Define navigation, screen map, and user flows before writing any component code.

---

## 1. Navigation Decision

**Pattern chosen:** Sidebar + Content Area

**Rationale:** (explain why this pattern fits the product and personas)

**Sidebar sections (top-level navigation):**

| Icon | Label | Route | Visible to |
|---|---|---|---|
| Calendar | Planning | `/planning` | Manager, HR |
| Clock | Time Tracking | `/time` | Manager, HR |
| Users | Employees | `/employees` | HR, Super Admin |
| CheckCircle | Closures | `/closures` | Manager, HR |
| Wallet | Balances | `/balances` | HR, Employee |
| BarChart | Costs | `/costs` | Finance, HR |
| Shield | Inspection | `/inspection` | Inspector |
| Settings | Settings | `/settings` | HR, Super Admin |

**Role-based nav visibility:**
- Manager: Planning, Time Tracking, Closures
- HR: Planning, Time Tracking, Employees, Closures, Balances, Settings
- Employee: (own schedule, own balances — simplified view)
- Finance: Costs only
- Inspector: Inspection only
- Super Admin: everything

---

## 2. Screen Map

```
App Shell (AuthWrapper + SidebarLayout)
│
├── /planning
│   ├── WeeklyPlanningGrid          [SCR-001] — primary view
│   │   ├── ShiftDetailDrawer       [SCR-002] — opens on shift click
│   │   └── AddEditShiftModal       [SCR-003] — opens on cell click / add button
│   └── /planning/archive           — past published plans (read-only)
│
├── /time
│   ├── TimeTrackingDashboard       [SCR-007] — live view, today's status
│   └── /time/:date                 — historical day view
│
├── /employees
│   ├── EmployeeList                [SCR-004]
│   └── /employees/:id
│       ├── EmployeeDetail          [SCR-005]
│       └── EmploymentForm          [SCR-006] — create/edit employment
│
├── /closures
│   ├── ClosureList                 — periods list
│   └── /closures/:period
│       ├── WorkDayDetail           [SCR-008]
│       └── ClosureWizard           [SCR-009]
│
├── /balances                       [SCR-010]
│
├── /costs                          [SCR-011]
│
├── /inspection                     [SCR-012] — restricted role
│
└── /settings
    ├── RulesEngine                 [SCR-013]
    └── UserManagement              [SCR-014]
```

---

## 3. Critical User Flows

### Flow 1 — Manager publishes the weekly plan

```
Dashboard (today's alerts)
  → Planning Grid (/planning)
    → Add shift (cell click → AddEditShiftModal)
      → Validation fires (contracted hours check)
        → [ERROR PATH] Alert shown → manager acknowledges override → form re-enabled
        → [HAPPY PATH] Shift added to grid
    → Review complete → "Publish" button
      → Confirmation dialog ("Notify 12 employees?")
        → Published → grid cells turn to "published" state
          → Employees receive push notification
```

### Flow 2 — HR completes monthly closure

```
Closures list (/closures)
  → Select period → ClosureWizard [SCR-009]
    → Step 1: Pre-calculation summary (unresolved incidents list)
      → For each incident: resolve or acknowledge
    → Step 2: Manager approval status (list of pending approvals)
      → Follow up with managers (link to WorkDay detail)
    → Step 3: HR validation
      → Review totals → apply adjustments → confirm
    → Step 4: Employee signatures
      → Send signature requests → track completion
    → Step 5: Lock period
      → Confirmation → period locked → export available
```

### Flow 3 — Employee clocks in (mobile)

```
Mobile app / PWA → Clock screen
  → GPS check (within radius?)
    → [FAIL] "You are outside the allowed area" → contact manager
    → [PASS] "Clock In" button → tap
      → TimeEntry created → confirmation screen ("Clocked in at 09:04")
        → View today's shift details
```

### Flow 4 — Inspector accesses working time records

```
Login with Inspector credentials
  → Inspection view (/inspection) — only nav item visible
    → Filter: company / center / date range / employee
      → Records table populates
        → "Export PDF" → generates legal-format working time register
        → "Export CSV" → raw data download
          → All access logged automatically
```

### Flow 5 — HR resolves a balance dispute

```
Employees list → Search employee → Employee Detail [SCR-005]
  → Balance tab → select balance type → view transaction history
    → Identify discrepancy → "Add adjustment"
      → AdjustmentForm (type, amount, reason, reference)
        → Saved → audit event created → employee notified
```

---

## 4. State Management Strategy

| State type | Where it lives | Why |
|---|---|---|
| Server data (employees, shifts, entries) | TanStack Query cache | Automatic refetch, optimistic updates |
| UI state (selected cell, open drawer, filters) | Zustand store per module | No unnecessary re-renders |
| Form state | React Hook Form | Validation, dirty tracking |
| Auth / session | Auth provider context | Global, rarely changes |
| Real-time updates (clock-ins, alerts) | WebSocket → query invalidation | Live without polling |

---

## 5. Responsive Strategy

| Breakpoint | Strategy |
|---|---|
| Desktop (≥1280px) | Full layout — all features available |
| Tablet (768–1279px) | Sidebar collapses to icon-only; grid columns reduce |
| Mobile (<768px) | Bottom tab bar; Planning Grid → list view; Clock-in optimized |

**Mobile-specific surfaces:**
- Clock-in screen (employee primary task)
- Today's schedule view
- Alert acknowledgment for managers
- All other screens degrade to read-only on mobile
