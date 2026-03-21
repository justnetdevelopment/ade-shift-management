---
name: prd-to-ui
description: >
  Professional methodology for translating a Product Requirements Document (PRD) into
  a complete, production-ready UI/UX implementation. Use this skill whenever the user
  wants to go from a PRD, spec, or requirements document to actual screens, components,
  or a design system. Triggers include: "build the UI from the PRD", "implement the
  screens", "design the interface", "create the components from the spec", "turn this
  PRD into a frontend", "what screens do I need", "design the planning view", or any
  request that involves translating product requirements into visual interfaces.
  Always use this skill when a PRD.md or requirements document is present in the project
  and the user wants to build any part of the frontend — even if they only ask for a
  single screen or component.
---

# PRD → UI/UX Professional Methodology

This skill guides a structured, professional process for translating any PRD into a
production-ready UI/UX implementation. It prevents the most common failure mode:
jumping straight to code before understanding the full information architecture.

## The Five-Phase Process

```
Phase 1: EXTRACT    →  Read the PRD; identify all UI surfaces
Phase 2: ARCHITECT  →  Define IA, user flows, and screen map
Phase 3: DESIGN     →  Establish design system and visual language
Phase 4: BUILD      →  Implement screen by screen, component by component
Phase 5: VALIDATE   →  Check every screen against original PRD requirements
```

Never skip or merge phases. Each phase has a mandatory output before the next begins.

---

## Phase 1 — Extract

**Goal:** Understand every UI surface implied by the PRD before writing a single line of code.

### 1.1 Read these sections of the PRD first (in order)
1. Users & Personas → who will use each screen
2. Module Specifications → what functionality each screen must expose
3. Core Entities / Data Model → what data each screen reads and writes
4. User Roles / RBAC → what each persona can see and do
5. KPIs & Reporting → what dashboards or summary views are needed

### 1.2 Extract the UI Surface Inventory

For each module in the PRD, identify:

| Surface | Type | Primary Persona | Data In | Data Out |
|---|---|---|---|---|
| (name) | List / Form / Dashboard / Grid / Modal / Wizard | (role) | (entities read) | (entities written) |

**Surface Types:**
- **List View** — browse, filter, search a collection
- **Detail View** — read all fields of a single record
- **Form** — create or edit a record
- **Grid / Planner** — dense 2D view (shifts, calendars, schedules)
- **Dashboard** — KPIs, charts, summary cards
- **Wizard** — multi-step guided workflow
- **Modal / Drawer** — inline sub-task without navigation
- **Inspection View** — read-only, export-focused

### 1.3 Output of Phase 1
A complete `SCREENS.md` file listing every screen, its type, its persona, and its data dependencies.
**Do not proceed to Phase 2 until this file exists.**

→ See `references/screens-template.md` for the exact format.

---

## Phase 2 — Architect

**Goal:** Define how screens connect, how users navigate, and what the information hierarchy is.

### 2.1 Navigation Structure

Choose one primary navigation pattern based on the product's complexity:

| Pattern | When to use |
|---|---|
| **Sidebar + Content** | Many top-level sections; power users; desktop-first |
| **Top Nav + Sub-nav** | 3–6 sections; mixed user types |
| **Bottom Tab Bar** | Mobile-first; ≤5 main sections |
| **Contextual (no global nav)** | Single-purpose tools; kiosk/inspection modes |

For WorkForce-type apps (multi-module, multi-role, desktop-first): use **Sidebar + Content**.

### 2.2 Screen Map

Build a visual hierarchy:

```
App Shell
├── [Module 1]
│   ├── List View
│   ├── Detail / Edit View
│   └── Create Form
├── [Module 2]
│   ├── Grid View (primary)
│   └── Shift Detail (drawer)
└── [Settings]
    ├── Rules Engine
    └── User Management
```

### 2.3 User Flows

For each critical workflow identified in the PRD, map the happy path and the error path:

```
[Trigger] → Screen A → (decision) → Screen B → (action) → Confirmation
                              ↓
                          Error State → Recovery
```

Key workflows to always map:
- Onboarding / first login
- Primary daily task per persona (the thing they do most)
- The most complex workflow (e.g., monthly closure)
- Inspection / audit access

### 2.4 Output of Phase 2
A `ARCHITECTURE.md` with: navigation pattern decision + screen map + 3–5 critical user flows.
**Do not proceed to Phase 3 until this file exists.**

→ See `references/architecture-template.md`

---

## Phase 3 — Design System

**Goal:** Establish a coherent visual language before building any screen.

### 3.1 Design System Checklist

Before writing component code, define:

- [ ] **Color tokens** — primary, secondary, accent, semantic (success/warning/error/info), neutrals
- [ ] **Typography scale** — display, heading 1–3, body, caption, label, monospace
- [ ] **Spacing scale** — 4px base grid (4, 8, 12, 16, 24, 32, 48, 64, 96)
- [ ] **Elevation / shadow system** — 3–4 levels (flat, raised, floating, overlay)
- [ ] **Border radius system** — consistent across interactive elements
- [ ] **Icon set** — one library, used consistently (Lucide, Phosphor, Heroicons)
- [ ] **Motion principles** — duration scale, easing curves, what animates vs what doesn't

### 3.2 Design Direction for Professional Tools

For B2B workforce management applications specifically, commit to this direction:

**Tone:** Precision instrument. Every pixel earns its place.
**Not:** Consumer app. Marketing site. Dashboard template.

**Key principles:**
- **Information density** — more data visible = more professional. Don't hide data in accordions by default.
- **Predictability** — consistent placement of actions, labels, status indicators across all screens
- **Status clarity** — system state is always visible. Never leave the user guessing what is happening.
- **Data primacy** — typography and spacing serve the data, not the other way around

**Color philosophy for workforce tools:**
- Neutral base (dark navy or warm gray) with strong functional accents
- Semantic color is sacred: never use red for anything that isn't an error or critical alert
- Status colors must be consistent across every module (a "green" WorkDay means the same thing everywhere)

### 3.3 Component Architecture

Structure components in three layers:

```
Design Tokens (CSS variables / Tailwind config)
    ↓
Primitive Components (Button, Input, Badge, Avatar, Icon)
    ↓
Composite Components (ShiftCard, EmployeeRow, BalanceSummary, CostWidget)
    ↓
Page Templates (PlanningGrid, ClosureWizard, InspectionReport)
```

**Rules:**
- Primitives have no business logic — they only receive props
- Composite components know about domain entities (Employment, Shift, etc.) but don't fetch data
- Page templates handle data fetching and pass data down
- Never put API calls inside primitive or composite components

### 3.4 Output of Phase 3
A `DESIGN-SYSTEM.md` + a `tokens.css` (or `tailwind.config.ts`) file.
**Do not build screens until design tokens are defined.**

→ See `references/design-system-template.md`

---

## Phase 4 — Build

**Goal:** Implement screens in priority order, following the design system without deviation.

### 4.1 Build Order

Always build in this sequence:

1. **App Shell** — layout, sidebar/nav, auth wrapper, empty states
2. **Design system primitives** — Button, Input, Badge, Table, Card
3. **Most-used screen first** — the screen the primary persona uses daily
4. **Secondary screens** — in order of usage frequency
5. **Admin / config screens** — last

For WorkForce Pro specifically:
1. App shell + auth
2. Planning Grid (most complex, most used)
3. Employee List + Detail
4. Time Tracking view
5. WorkDay / Closure workflow
6. Balance summary
7. Cost dashboard
8. Inspection mode
9. Settings / Rules engine

### 4.2 Screen Implementation Protocol

For every screen, follow this order:

```
1. Read the PRD section for this module
2. Review SCREENS.md entry for this screen
3. Identify all data entities it touches
4. Define the component tree (on paper / in comments)
5. Implement the layout skeleton (no real data)
6. Add design system tokens and styling
7. Wire up real data / props
8. Handle loading state
9. Handle empty state
10. Handle error state
11. Add validation (if form)
12. Accessibility pass (keyboard nav, aria labels, color contrast)
```

Never skip steps 8, 9, 10. A screen without its three states is not done.

### 4.3 Grid / Planner Screens (special case)

Dense 2D planning grids require additional care:

- **Performance first** — virtualize rows and columns if > 50 employees or > 7 days visible
- **Cell states** — every cell must have: empty, filled, conflict (error), over-contracted (warning), published, locked
- **Drag-and-drop** — use a library (dnd-kit); never implement from scratch
- **Keyboard navigation** — Tab between cells; Enter to edit; Escape to cancel
- **Responsive strategy** — desktop-first; on mobile, collapse to list view

### 4.4 Forms (special case)

For create/edit forms:

- Validation fires on blur, not on keystroke
- Error messages are specific: "Contracted hours: 32.5h exceeds contract limit of 10h" not "Invalid value"
- Required fields are marked; optional fields are not (not the other way around)
- Destructive actions (delete, override) require a confirmation step with explicit consequence stated
- Long forms (>8 fields) use sections or steps

### 4.5 Output of Phase 4

Working, styled, accessible React components with:
- Real data shapes matching entity definitions from the PRD
- All three states (loading / empty / error)
- TypeScript types that match the data model exactly

---

## Phase 5 — Validate

**Goal:** Verify that every UI surface satisfies the original PRD requirements.

### 5.1 PRD Compliance Checklist

For each screen, verify:

- [ ] All data fields from the PRD entity are visible or accessible
- [ ] All user roles that need this screen can access it (RBAC)
- [ ] All validation rules from the PRD are enforced in the UI
- [ ] All alert/severity levels from the PRD are visually distinct
- [ ] All workflows that pass through this screen are completable end-to-end
- [ ] Export / print requirements (if any) are implemented
- [ ] Audit trail is visible where the PRD requires it

### 5.2 Cross-Screen Consistency Check

- [ ] Status colors are identical across all modules
- [ ] Entity names are spelled the same everywhere (Employment not Contract, WorkDay not Workday)
- [ ] Empty states have a consistent format (icon + heading + action)
- [ ] Loading states use the same skeleton pattern
- [ ] Error messages follow the same structure

---

## Reference Files

Read these files as needed during each phase:

| File | Read when |
|---|---|
| `references/screens-template.md` | Starting Phase 1 — use to build SCREENS.md |
| `references/architecture-template.md` | Starting Phase 2 — use to build ARCHITECTURE.md |
| `references/design-system-template.md` | Starting Phase 3 — use to build design tokens |
| `references/component-patterns.md` | Phase 4 — reference for complex component patterns |

---

## Common Mistakes to Avoid

- **Starting to code before Phase 2 is done** — leads to nav structure changes that break everything
- **Defining colors inline** — always use tokens; hardcoded hex values are banned
- **Skipping empty/error states** — they are not "nice to have"; they are required
- **Using the same layout for all personas** — Manager and Inspector have fundamentally different needs
- **Mixing domain logic into UI components** — business rules belong in hooks or services, not in JSX
- **Building admin screens before core screens** — admins are not primary users
- **Inconsistent entity naming** — if the PRD says `Employment`, the UI says `Employment` everywhere
