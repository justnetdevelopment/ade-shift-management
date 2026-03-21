# WorkForce Pro — Information Architecture

> Phase 2 output. Do not start Phase 4 (Build) until this file is complete.

## Navigation Pattern

**Sidebar + Content** — multi-module, multi-role, desktop-first B2B tool.

```
App Shell
├── Sidebar (fixed left, collapsible)
│   ├── Planning          ← Primary module (built first)
│   ├── Employees
│   ├── Time Tracking
│   ├── Monthly Closure
│   ├── Balances
│   ├── Costs
│   ├── Inspection Mode
│   └── Settings / Rules
└── Content Area (scrollable)
```

## Screen Map — Planning Module

```
/planning
├── PlanningPage (main layout)
│   ├── PlanningToolbar
│   │   ├── WeekNavigator (← prev / week label / next →)
│   │   ├── CenterFilter + RoleFilter
│   │   ├── PublicationStatusBadge
│   │   └── PublicationActions (Save Draft / Publish / Copy Week)
│   ├── ValidationPanel (collapsible; shows errors/warnings/info)
│   ├── PlanningGrid
│   │   ├── GridHeader (Mon–Sun date columns)
│   │   ├── EmployeeRow × N
│   │   │   ├── EmployeeInfo (name, role, contracted hours, week total)
│   │   │   └── ShiftCell × 7 (one per day)
│   │   │       ├── Empty state → click/drop to create
│   │   │       ├── Filled state → shift time range + role
│   │   │       ├── Error state → red border + icon
│   │   │       ├── Warning state → amber border + icon
│   │   │       └── Locked state → grayed out
│   └── ShiftDrawer (right slide-over, conditional)
│       ├── Shift time picker
│       ├── Center selector
│       ├── Role selector
│       ├── Validation summary
│       └── Save / Delete / Cancel actions
```

## Critical User Flows

### 1. Manager builds weekly plan (daily task)
```
Open /planning → Select week → Grid loads with existing shifts
→ Drag employee to day cell → Shift Drawer opens with defaults
→ Set time range → Save → Cell shows shift + live validation
→ Fix any 🔴 errors → Click Publish → Employees notified
```

### 2. Contract violation detected
```
Manager drags shift → Hours would exceed contract →
Cell turns 🔴 Error → ValidationPanel surfaces rule:
"32.5h planned vs 10h contracted" →
Manager must acknowledge override with reason → HR alerted
```

### 3. Copy previous week
```
Planning toolbar → "Copy last week" →
Confirmation modal: "Copy 14 shifts from 10–16 Mar to 17–23 Mar?" →
Confirm → Shifts duplicated in draft state → Validation re-runs
```
