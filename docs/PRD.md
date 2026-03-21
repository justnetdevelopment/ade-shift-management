# WorkForce Pro — Product Requirements Document

**Version:** 1.0
**Date:** March 2025
**Status:** Draft for Review
**Classification:** Internal — Confidential
**Target Release:** Q4 2025 (MVP) · Q2 2026 (Full Platform)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Users & Personas](#4-users--personas)
5. [Conceptual Data Model](#5-conceptual-data-model)
6. [Module Specifications](#6-module-specifications)
7. [Inter-Company Mobility](#7-inter-company-mobility)
8. [KPIs & Reporting](#8-kpis--reporting)
9. [Technical Architecture](#9-technical-architecture)
10. [Competitive Differentiation](#10-competitive-differentiation)
11. [Product Roadmap](#11-product-roadmap)
12. [Open Questions & Decisions Pending](#12-open-questions--decisions-pending)
13. [Glossary](#13-glossary)

---

## 1. Executive Summary

WorkForce Pro is a comprehensive workforce and shift management platform designed specifically for restaurant groups operating multiple legal entities. It addresses a critical gap in the market: the absence of a unified system that connects shift planning, real-time clock-in/out tracking, legal compliance, inter-company mobility, and payroll cost calculation into a single coherent workflow.

Current solutions (such as Skello, HotSchedules, or Deputy) excel at shift visualization but treat planning and legal compliance as separate concerns. WorkForce Pro unifies them through a rigorous **six-layer data model**:

| Layer | Description |
|---|---|
| **Contract** | What should happen per labor law and agreement |
| **Planning** | What is expected operationally |
| **Reality** | What actually occurred (time entries) |
| **Closure** | What is validated and signed off |
| **Balances** | What has accumulated (vacation days, compensatory time) |
| **Cost** | What it costs the business |

> **Core Value Proposition:** Any deviation between these six layers becomes visible, traceable, auditable, and correctable — in real time.

---

## 2. Problem Statement

### 2.1 Current Pain Points

Restaurant groups managing multiple locations face a fragmented operational reality:

| Pain Point | Current State | Business Impact |
|---|---|---|
| No contract-aware planning | Scheduling done without reference to contracted hours | Legal exposure; uncontrolled overtime costs |
| Siloed time tracking | Clock-in system disconnected from planning tool | No plan-vs-actual comparison possible |
| Manual mobility management | Employee transfers between group entities done by hand | Errors in salary, benefits, vacation carry-over |
| Unreliable cost data | Labor cost calculated post-hoc, often in spreadsheets | Budget overruns discovered too late |
| Inspection risk | No single source of truth for labor inspectors | Fines, reputational damage, legal liability |
| Opaque balances | Vacation, holiday, and overtime banks mixed together | Employee disputes; payroll errors |

### 2.2 Illustrative Example

A worker is contracted for **10 hours per week**. The current planning tool shows them scheduled for **32.5 hours**. No alert fires. The manager is unaware. The discrepancy goes to payroll, triggers unexpected overtime costs, creates a legal compliance issue, and cannot be demonstrated to an inspector.

WorkForce Pro prevents this at the planning stage and traces it through every subsequent layer.

---

## 3. Goals & Success Metrics

### 3.1 Product Goals

1. Unify planning, time tracking, compliance, and cost into one platform
2. Eliminate legal risk from contract violations detected too late
3. Enable real-time labor cost visibility at shift, employee, and center level
4. Support labor inspector audits with exportable, immutable audit trails
5. Handle complex inter-company employee mobility with zero data loss

### 3.2 Success Metrics

| Metric | Baseline (Current) | Target (12 months) |
|---|---|---|
| Contract violations detected pre-publication | 0% | >95% |
| Time to identify plan-vs-real deviation | >24 hours | <5 minutes |
| Labor cost forecast accuracy | ±20% | ±3% |
| Monthly closure cycle time (HR) | 3–5 days | <1 day |
| Inspection response time | Days | <30 minutes |
| Employee balance dispute rate | Baseline TBD | −60% |

---

## 4. Users & Personas

| Persona | Primary Tasks | Critical Needs | Pain Today |
|---|---|---|---|
| **Restaurant Manager** | Build weekly plans; monitor daily clock-ins; approve time entries | Real-time alerts; simple drag-and-drop UI; mobile access | No alert when over-scheduling; manual chasing of latecomers |
| **HR / People Ops** | Configure contracts & rules; supervise balances; close monthly periods; audit compliance | Legal rule engine; bulk operations; exportable reports | Cross-checking spreadsheets; manual balance calculations |
| **Employee / Worker** | View personal schedule; clock in/out; check own balances and history | Mobile-first; simple clock; transparent balance display | No self-service; unaware of own overtime or vacation status |
| **Group Finance** | Monitor planned vs actual labor cost; per-center cost breakdown | Real-time dashboards; integration with accounting | Cost data always stale; no drill-down by shift or employee |
| **Labor Inspector** *(read-only)* | Verify working time records; validate compliance with labor law | Immutable audit log; exportable official reports | Role does not exist in current system |

---

## 5. Conceptual Data Model

> **This is the foundation of the entire system.** The integrity of WorkForce Pro depends entirely on maintaining clear separation between its six core data layers.

### 5.1 Core Entities

| Entity | Layer | Key Attributes | Critical Constraint |
|---|---|---|---|
| `Person` | Foundation | id, legal_name, national_id, contact, documents | One person can hold multiple Employments across group entities |
| `Employment` | Contract | company_id, person_id, role, salary, contracted_hours_week, start_date, end_date | A single Person may have concurrent or sequential Employments |
| `Shift` | Planning | employment_id, date, start_time, end_time, center_id, role, published | Total planned hours must not exceed contracted hours without explicit override + alert |
| `TimeEntry` | Reality | employment_id, timestamp, type (in/out/break), source, device_id | Every entry is immutable after 24h without HR-level approval |
| `WorkDay` | Closure | shift_id, time_entry_ids, final_hours, adjustments, approval_status | Requires manager approval → HR approval → employee signature |
| `Balance` | Balances | employment_id, type, amount, expiry_date | Vacation, holidays, and overtime must be tracked in **separate** balance buckets — never mixed |
| `Rule` | Rules Engine | trigger_type, condition_expression, consequence, effective_date_range, scope | Rules are versioned; retroactive application requires explicit HR action |
| `CostEntry` | Cost | workday_id, hourly_rate, gross_cost, employer_cost, center_allocation | Always derived — never manually entered; recalculated on WorkDay changes |

### 5.2 Entity Relationships

```
Person (1) ──── (N) Employment (1) ──── (N) Shift
                        │                      │
                        │               TimeEntry (N)
                        │                      │
                        ├──── (N) WorkDay ◄────┘
                        │          │
                        │     CostEntry (1)
                        │
                        └──── (N) Balance
```

### 5.3 Audit Requirements

Every write operation across **all entities** must produce an immutable audit record containing:

- **Actor:** user_id, role, IP address
- **Timestamp:** UTC with millisecond precision
- **Action:** `create` | `update` | `delete` | `approve` | `override`
- **Before/After:** full JSON snapshots of changed fields
- **Reason:** mandatory for overrides and deletions

> **Legal Note:** Audit records are retained for a minimum of 5 years and must be exportable in PDF and CSV without loss of integrity.

---

## 6. Module Specifications

### 6.1 Employee Module

**Purpose:** Maintain a single source of truth for every person in the organization, cleanly separated from their employment contracts.

**Core Features:**
- Personal profile: legal name, national ID, contact details, emergency contacts
- Document vault: contracts, ID copies, certifications — with expiry alerts
- Employment history: full timeline across all group entities
- Multi-employment support: one person, many concurrent or sequential contracts
- Onboarding workflow: document checklist, system access provisioning

**Key Rules:**
- `Person` entity is never deleted — only deactivated with timestamp and reason
- Personal data changes require HR-level approval and produce an audit event
- Separation enforced at DB level: `persons` table vs `employments` table

---

### 6.2 Planning Module

**Purpose:** Enable managers to build operationally valid, legally compliant weekly schedules.

**Core Features:**
- Weekly grid view: all employees × all days × all centers
- Drag-and-drop shift assignment with instant validation
- Role and skill-based assignment rules
- Planning versioning: save drafts; publish when ready; full diff on changes
- Publication workflow: `draft` → `review` → `published` → `locked`
- Employee notification on publication (push + email)
- Copy previous week with one click

**Validation Rules (enforced in real time):**

| Rule | Severity | Behavior |
|---|---|---|
| Total planned hours > contracted weekly hours | 🔴 Error | Blocks publishing; manager must acknowledge override |
| Shift duration > daily legal maximum | 🔴 Error | Cannot be bypassed without HR approval |
| Rest period between shifts < minimum legal gap | 🟡 Warning | Shows alert; manager can override with reason |
| Employee scheduled on a declared public holiday | 🔵 Info | Auto-generates holiday compensation balance entry |
| Role not qualified for assigned center | 🟡 Warning | Highlights cell; manager can proceed |
| Shift assigned to inactive employment | 🔴 Error | Blocks assignment entirely |

---

### 6.3 Time Tracking Module

**Purpose:** Capture real working time accurately from multiple input sources and immediately surface deviations from the plan.

**Clock-In Sources:**
- Mobile app (GPS-verified, within configurable radius of work center)
- Tablet kiosk at premises (PIN or facial recognition)
- Manager manual entry (with mandatory reason field)
- API integration with existing POS or access control systems

**Real-Time Incident Detection:**

| Incident Type | Trigger | System Action |
|---|---|---|
| No-show | No clock-in 15 min after shift start | Alert to manager; status badge turns red on grid |
| Late arrival | Clock-in after scheduled start | Auto-log delay duration; flag on WorkDay |
| Early departure | Clock-out before scheduled end | Auto-log missing time; flag for manager review |
| Unplanned overtime | Clock-out >15 min after scheduled end | Alert to manager + HR; auto-calculate extra cost delta |
| Missed break | No break entry on shifts > legal break threshold | Warning on WorkDay closure |
| Clock-in without shift | TimeEntry exists but no Shift for that day | Creates unplanned WorkDay; HR review required |

---

### 6.4 Monthly Closure Module

**Purpose:** Produce a legally valid, signed record of each employee's working time for a given period, suitable as the basis for payroll processing.

**Closure Workflow:**

1. **Pre-calculation** — system aggregates all WorkDays, TimeEntries, and open incidents
2. **Manager review** — resolve all flagged incidents; approve individual WorkDays
3. **HR validation** — verify compliance with contracted hours and legal rules; apply adjustments
4. **Employee signature** — worker reviews and digitally signs their period summary
5. **Lock** — period becomes read-only; export available for payroll system

**Outputs:**
- Period summary PDF (per employee, per center, per company)
- Payroll integration export (configurable format: CSV, JSON, API push)
- Legal working time register (compliant with Spanish RDL 8/2019)

---

### 6.5 Balance Management Module

**Purpose:** Maintain accurate, separated balances for each type of time entitlement to eliminate confusion and disputes.

| Balance Type | Accrual Logic | Consumption | Expiry |
|---|---|---|---|
| **Annual Leave (Vacation)** | Accrues daily from contract start; proportional to contracted hours | Planned absence in Planning module; auto-deducted on WorkDay closure | 31 March following year (configurable) |
| **Public Holiday Compensation** | Auto-generated when worked on an official holiday | Scheduled as compensatory day in Planning module | 12 months from accrual (configurable) |
| **Overtime Bank** | Added when validated extra hours exceed contract in WorkDay closure | Paid out via payroll OR consumed as time off | Per collective agreement rules |
| **Absence Bank** | Negative balance when unexcused absence occurs | Resolved via salary deduction or compensatory work | Resolved at period closure |

**Critical Rule:** Balance types are stored in separate records. The system must make it technically impossible to offset vacation against overtime, or holiday compensation against absence.

---

### 6.6 Rules Engine

**Purpose:** Automate the application of labor law requirements and company policy rules so that compliance is enforced systematically rather than by memory.

**Rule Categories:**

- **Temporal rules:** maximum daily/weekly hours; mandatory rest periods; night shift thresholds
- **Calendar rules:** public holiday detection (national, regional, local); working weekend rules
- **Balance rules:** accrual triggers; expiry warnings; automatic balance generation on worked holidays
- **Cost rules:** overtime multipliers; night shift bonuses; inter-company billing rates
- **Alert rules:** thresholds for manager and HR notifications

**Rule Management:**
- Rules are created, versioned, and activated/deactivated by HR with full audit trail
- Each rule stores its effective date range; historical processing uses rules valid at the time
- Rules can be scoped to: global / company / center / role / individual employment
- Rule engine is event-driven: triggers fire on entity mutations, not on a cron schedule

---

### 6.7 Labor Inspection Mode

**Purpose:** Provide labor inspectors with a structured, read-only view of all working time records that satisfies legal requirements.

**Features:**
- Separate access role: `Inspector` — read-only, zero modification capability
- Filterable by: company entity, work center, date range, individual employee
- View: employees present on any given day and their actual working hours
- View: full planning vs actual comparison for any period
- Export: official working time register in PDF (legally formatted)
- Export: raw data in CSV for inspector's own analysis tools
- All inspector access is logged with timestamp and document fingerprint

> **Regulatory Note:** Designed to comply with Spanish Real Decreto-ley 8/2019 (mandatory digital working time registration). Export format follows ITSS (Labour Inspection) preferred data structures.

---

### 6.8 Labor Cost Module

**Purpose:** Give finance and operations real-time visibility into labor costs at every level of granularity, separating planned cost from actual cost.

**Cost Dimensions:**
- By shift: cost of each individual planned or actual shift
- By employee: total monthly gross cost including all supplements
- By center: labor cost allocation per restaurant
- By company: consolidated group-level view with inter-company allocations

**Key Metrics:**

| Metric | Definition |
|---|---|
| **Planned Labor Cost** | Σ (contracted hourly rate × planned hours) for all published shifts in period |
| **Actual Labor Cost** | Σ (effective hourly rate × validated hours) from locked WorkDays |
| **Cost Deviation** | Actual minus Planned; negative = underspend, positive = overspend |
| **Effective Hourly Rate** | Gross salary / contracted hours + applicable supplements |
| **Employer Cost** | Gross salary + social security contributions (configurable % per entity) |
| **Cost per Cover** | Labor cost / restaurant covers (requires POS integration) |

---

## 7. Inter-Company Mobility

A defining capability of WorkForce Pro is the ability to manage employees who work across multiple legal entities within the same restaurant group.

### 7.1 Mobility Scenarios

| Scenario | Description |
|---|---|
| **Temporary assignment** | Employee from Company A works at Company B's center for a defined period |
| **Permanent transfer** | Employee's primary Employment moves from one entity to another |
| **Concurrent employment** | Employee holds valid contracts with two group entities simultaneously |

### 7.2 Mobility Rules

- `Person` record is always singular — never duplicated across entities
- Each `Employment` belongs to exactly one legal entity
- **Balance portability:** vacation transfers on permanent move; overtime does not
- **Cost allocation:** follows the billing entity at shift level, not the home Employment
- **Data access:** HR of each entity sees only their entity; Group HR sees all

### 7.3 Inter-Company Billing

When an employee works for a different entity than their home Employment, a billing record is generated:

```
Shift.center_company_id ≠ Employment.company_id
  → CostEntry.billed_to = Shift.center_company_id
  → CostEntry.billed_from = Employment.company_id
  → Inter-company transfer record created at period closure
```

---

## 8. KPIs & Reporting

### 8.1 Operational KPIs

- **Absenteeism rate:** unexcused absences / scheduled shifts (by center and period)
- **Punctuality rate:** on-time arrivals / total arrivals
- **Plan adherence:** planned vs actual hours ratio
- **Unfilled shift rate:** published shifts without an assigned employee

### 8.2 Legal / HR KPIs

- **Contract exceedance rate:** shifts exceeding contracted hours / total shifts
- **Pending balance alerts:** balances approaching expiry without consumption
- **Unsigned closure rate:** employee signatures pending after closure deadline
- **Rule violation count:** rule engine alerts fired per week, trended over time

### 8.3 Financial KPIs

- **Labor cost as % of revenue** (requires POS integration for revenue data)
- **Planned vs actual cost deviation** (tracked weekly and monthly)
- **Overtime cost as % of base cost** (trending to identify systematic overplanning)
- **Cost per employee per center** (for cross-location benchmarking)

---

## 9. Technical Architecture

### 9.1 Recommended Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React + TypeScript + Tailwind CSS | Component reuse; type safety; rapid UI iteration |
| **State Management** | TanStack Query + Zustand | Server-state vs client-state separation |
| **Backend** | NestJS (Node.js) | Structured modules; DI; OpenAPI auto-docs |
| **Database** | PostgreSQL (primary) + Redis (cache/queues) | ACID compliance for audit integrity; real-time cache |
| **Auth** | OAuth 2.0 / OIDC + RBAC | Multi-entity permission model; Inspector role isolation |
| **Real-time** | WebSockets (Socket.io) | Live dashboard updates; clock-in notifications |
| **Mobile** | React Native or PWA | Employee clock-in; manager alerts on mobile |
| **Infrastructure** | AWS / Azure (EU region) — GDPR compliant | Data residency in EU; SOC 2 certification path |

### 9.2 Integration Points

| System | Type | Priority |
|---|---|---|
| Nominasol / A3Nom / Sage Nómina | Payroll export (CSV/JSON) | MVP |
| NFC/RFID access terminals | Clock-in verification API | MVP |
| Factorial / Personio | Contract sync (REST API) | V1.0 |
| Lightspeed / Toast / Square (POS) | Revenue data for cost ratios | V1.5 |
| Power BI / Tableau | BI export / read-only API | V1.5 |

### 9.3 Database Schema Principles

```sql
-- Every table includes these audit columns
created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
created_by       UUID NOT NULL REFERENCES users(id),
updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_by       UUID NOT NULL REFERENCES users(id),

-- Soft deletes only — never hard delete
deleted_at       TIMESTAMPTZ,
deleted_by       UUID REFERENCES users(id),
deletion_reason  TEXT
```

- All audit events go to an append-only `audit_log` table (no UPDATE/DELETE allowed at DB level)
- Multi-tenancy via `company_id` column on every business table + Row Level Security (RLS)
- `persons` and `employments` are in separate tables with a FK — never merged

### 9.4 Security & Compliance

- GDPR Article 30 record of processing activities maintained automatically
- Data encrypted at rest (AES-256) and in transit (TLS 1.3)
- Role-based access: HR cannot access financial models; Finance cannot access personal documents
- Multi-tenancy: each restaurant group is logically isolated; data never crosses tenant boundaries
- Backup: automated daily snapshots retained 90 days; point-in-time recovery to 5 minutes

### 9.5 RBAC Roles

| Role | Scope | Key Permissions |
|---|---|---|
| `super_admin` | Group-wide | Full access including configuration |
| `group_hr` | Group-wide | All employments, balances, closures, rules |
| `entity_hr` | Single company | Employments and closures within their company |
| `manager` | Center-level | Planning, time tracking, WorkDay approval for their center |
| `employee` | Self only | View own schedule, clock in/out, view own balances |
| `inspector` | Read-only | Working time records; no personal financial data |
| `finance` | Group-wide | Cost module only; no personal data |

---

## 10. Competitive Differentiation

| Capability | WorkForce Pro | Skello | Deputy | HotSchedules |
|---|---|---|---|---|
| Contract-aware planning validation | ✅ Core | ⚠️ Partial | ❌ No | ❌ No |
| Plan vs real comparison (live) | ✅ Core | ⚠️ Partial | ⚠️ Partial | ❌ No |
| Labor inspection export mode | ✅ Core | ❌ No | ❌ No | ❌ No |
| Inter-company mobility (same group) | ✅ Core | ❌ No | ❌ No | ❌ No |
| Separated balance types | ✅ Core | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial |
| Real-time labor cost calculation | ✅ Core | ⚠️ Add-on | ⚠️ Add-on | ⚠️ Add-on |
| Immutable audit trail (all changes) | ✅ Core | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial |
| Monthly closure workflow with e-sign | ✅ Core | ❌ No | ❌ No | ❌ No |
| Configurable rules engine | ✅ Core | ⚠️ Limited | ⚠️ Limited | ⚠️ Limited |

---

## 11. Product Roadmap

### Phase 1 — MVP (Q4 2025)

**Deliverables:**
- Employee module (Person + Employment separation)
- Planning grid (weekly view, drag & drop, validation rules)
- Time tracking (mobile app + kiosk; incident detection)
- Basic rule engine (core legal rules)
- Monthly closure workflow (manager → HR → employee signature)

**Success Criteria:**
- First pilot restaurant live and operational
- Full closure cycle completed in <24 hours
- Zero contract violations reaching published plans undetected

---

### Phase 2 — V1.0 (Q1 2026)

**Deliverables:**
- Balance management module (all 4 balance types, separated)
- Labor cost module (planned vs actual; per employee / center)
- Inspection mode (read-only role; PDF/CSV export)
- Manager mobile app
- Payroll export integration (Nominasol + A3Nom)

**Success Criteria:**
- Labor inspection demo passed with real data
- Cost accuracy ±5% vs actual payroll

---

### Phase 3 — V1.5 (Q2 2026)

**Deliverables:**
- Inter-company mobility (multi-entity person management)
- Advanced rules engine (multi-entity scoping)
- BI dashboard (Power BI / Tableau integration)
- Group Finance role + consolidated cost view

**Success Criteria:**
- Group-level cost visibility across all entities
- First multi-entity pilot live

---

### Phase 4 — V2.0 (Q4 2026)

**Deliverables:**
- POS integration (cost per cover metric)
- AI-assisted planning suggestions (based on historical patterns)
- Employee self-service portal
- Public REST API for third-party integrations

**Success Criteria:**
- Cost per cover metric live in dashboard
- NPS > 60 across all user personas

---

## 12. Open Questions & Decisions Pending

| Question | Options | Owner | Priority |
|---|---|---|---|
| Which payroll systems must be supported at launch? | Nominasol; A3Nom; custom CSV; all three | Product + Engineering | High |
| Is biometric clock-in (facial recognition) in scope for MVP? | Yes; Defer to V1.5; Never | Legal + Product | High |
| How should inter-company billing be handled? | Internal transfer pricing; simple cost allocation; ignore in MVP | Finance + Product | Medium |
| Employee e-signature: qualified or simple electronic signature? | Qualified (legal weight, higher cost); Simple (sufficient?) | Legal | High |
| Multi-language requirement? | Spanish only; ES + CA; ES + EN + FR | Business | Medium |
| Offline mode for clock-in? | Required from MVP; Defer to post-MVP | Engineering + Product | Medium |

---

## 13. Glossary

| Term | Definition |
|---|---|
| **Employment** | A specific labor contract between one `Person` and one legal entity. One Person may have multiple Employments. |
| **Shift** | A planned working period assigned to an Employment for a specific date and center. Belongs to the Planning layer. |
| **TimeEntry** | An individual clock event (`in`, `out`, `break_start`, `break_end`) captured from a device or by manual entry. Belongs to the Reality layer. |
| **WorkDay** | The consolidated record of a single worked day: combines the Shift plan with all TimeEntries and produces final validated hours. Belongs to the Closure layer. |
| **Balance** | A running total of a specific entitlement (vacation days, holiday compensation, overtime hours). Never mixed between types. |
| **Closure** | The formal process of finalizing a work period (typically monthly), resulting in signed records usable for payroll. |
| **Rule** | A configurable, versioned business logic unit that detects a condition and triggers a system action automatically. |
| **Inspection Mode** | A restricted read-only access level for labor authority representatives to view working time records. |
| **Inter-company Mobility** | A configuration where one Person works under different Employments at different group entities, with full traceability maintained. |
| **Plan-vs-Real Deviation** | The quantified difference between hours assigned in the Planning layer and hours recorded in the Reality layer for a given period. |
| **CostEntry** | A derived financial record representing the economic cost of a validated WorkDay. Never entered manually. |
| **RBAC** | Role-Based Access Control — the permission model governing what each user type can read, write, approve, or export. |

---

*WorkForce Pro PRD v1.0 — Confidential — Subject to change without notice*
