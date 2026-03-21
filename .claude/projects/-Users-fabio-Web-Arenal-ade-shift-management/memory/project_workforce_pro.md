---
name: WorkForce Pro — project context
description: Context on the WorkForce Pro shift management app and what's been built
type: project
---

WorkForce Pro is a workforce/shift management SaaS for Spanish restaurant groups (multi-entity). The PRD is at docs/PRD.md.

**Why:** Addresses fragmented operations — no tool unifies planning, compliance, time tracking, and cost.

**Stack:** React + TypeScript + Tailwind CSS + dnd-kit + date-fns + Zustand + TanStack Query (Vite project)

**Built so far (2026-03-21):** Planning screen (Phase 1 MVP). Includes:
- App shell (sidebar nav, navy dark theme)
- Planning grid: weekly view, employees × days, 6 cell states (empty/filled/error/warning/info/locked)
- Drag-and-drop shifts (dnd-kit)
- Shift create/edit drawer (right slide-over)
- Validation panel (error 🔴 / warning 🟡 / info 🔵)
- Publication workflow controls (draft → review → published → locked)
- Center + role filters, week navigation, copy previous week

**Mock data:** 6 employees, week of 2026-03-17. Includes seeded violations (Carlos Ruiz 32.5h vs 20h contract, David Sánchez rest gap, Laura Moreno holiday info).

**Dev server:** `npm run dev` → http://localhost:5173

**How to apply:** When building subsequent modules (Employees, Time Tracking, Closure, Balances, Costs, Inspection), reuse AppShell, Badge, and color token conventions already established.
