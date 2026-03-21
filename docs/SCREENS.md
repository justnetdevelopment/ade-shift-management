# WorkForce Pro — UI Surface Inventory

> Phase 1 output. Do not build until Phase 2 (ARCHITECTURE.md) is complete.

## Planning Module Surfaces

| Surface | Type | Primary Persona | Data In | Data Out |
|---|---|---|---|---|
| **Planning Grid** | Grid/Planner | Manager | Employment, Shift, Rule violations | Shift (create/update/delete) |
| **Week Navigator** | Component | Manager | Current week date | Selected week range |
| **Center / Role Filter** | Component | Manager | Center list, Role list | Active filter state |
| **Shift Cell** | Cell | Manager | Shift, Rule violations | Shift (via drag or click) |
| **Shift Create/Edit Drawer** | Drawer | Manager | Employment, Shift | Shift (upsert) |
| **Validation Alert Panel** | Panel | Manager | Rule violations (errors, warnings, info) | — (read-only) |
| **Publication Controls** | Toolbar section | Manager | Planning status (draft/review/published/locked) | Planning status transition |
| **Copy Previous Week** | Action | Manager | Previous week's Shifts | Shift (bulk create) |
| **Employee Row** | Row | Manager | Employment, contracted hours, week total hours | — |

## Cell States (all 6 required by PRD)

| State | Color | Meaning |
|---|---|---|
| Empty | Neutral | No shift assigned |
| Filled | Indigo | Shift assigned, no violations |
| Conflict — Error 🔴 | Red | Hours exceed contract OR shift > daily max OR inactive employment |
| Warning 🟡 | Amber | Rest gap violation OR role mismatch |
| Info 🔵 | Blue | Holiday scheduled (auto-generates compensation) |
| Locked | Gray | Period locked; no edits allowed |

## Publication Workflow States

`draft` → `review` → `published` → `locked`

Each transition is visible in the toolbar and reflected in cell appearance.
