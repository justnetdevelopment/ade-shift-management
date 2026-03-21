# Component Patterns Reference

> Phase 4 reference — use when implementing complex components.

---

## App Shell Pattern

```tsx
// AppShell.tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## Three-State Wrapper Pattern

Every data-dependent screen must use this wrapper. No exceptions.

```tsx
// DataScreen.tsx
function EmployeeList() {
  const { data, isLoading, isError } = useEmployees()

  if (isLoading) return <EmployeeListSkeleton />
  if (isError)   return <ErrorState message="Could not load employees" onRetry={refetch} />
  if (!data?.length) return <EmptyState
    icon={<Users />}
    title="No employees yet"
    description="Add your first employee to get started"
    action={<Button onClick={openAddForm}>Add employee</Button>}
  />

  return <EmployeeTable employees={data} />
}
```

---

## Planning Grid Architecture

```tsx
// PlanningGrid.tsx
// This is the most complex component in the system. Read this fully.

interface PlanningGridProps {
  weekStart: Date
  employees: Employment[]
  shifts: Shift[]
  onShiftCreate: (employmentId: string, date: Date) => void
  onShiftEdit: (shiftId: string) => void
  isLocked: boolean
}

// Cell renders: one Employment × one Day
interface GridCellProps {
  employment: Employment
  date: Date
  shifts: Shift[]           // shifts for this employment on this date
  isHoliday: boolean
  onAdd: () => void
  onEdit: (id: string) => void
  isLocked: boolean
}

// Cell states (derive from data, not from explicit state):
// - empty:     shifts.length === 0 && !isHoliday
// - filled:    shifts.length > 0
// - conflict:  shifts.reduce((h, s) => h + duration(s), 0) > employment.contractedHoursWeek
// - holiday:   isHoliday === true
// - locked:    isLocked === true
```

**Performance rules for the grid:**
- Use `React.memo` on GridCell — this component renders O(employees × 7) times
- Use `useMemo` for shift grouping by employment+date
- Debounce drag-and-drop updates — don't refetch on every drag event
- Never put a `useEffect` that re-fetches inside GridCell

---

## Wizard / Multi-Step Form Pattern

```tsx
// ClosureWizard.tsx
const STEPS = [
  { id: 'pre-calc',   label: 'Pre-calculation',     component: PreCalcStep },
  { id: 'manager',    label: 'Manager approvals',   component: ManagerApprovalStep },
  { id: 'hr-validate',label: 'HR validation',       component: HRValidationStep },
  { id: 'signatures', label: 'Employee signatures', component: SignatureStep },
  { id: 'lock',       label: 'Lock period',         component: LockStep },
]

function ClosureWizard({ period }: { period: Period }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  const canAdvance = completed.has(STEPS[currentStep].id)
  const StepComponent = STEPS[currentStep].component

  return (
    <div>
      <WizardProgress steps={STEPS} currentStep={currentStep} completed={completed} />
      <StepComponent
        period={period}
        onComplete={() => {
          setCompleted(prev => new Set([...prev, STEPS[currentStep].id]))
          setCurrentStep(prev => prev + 1)
        }}
      />
    </div>
  )
}
```

---

## Drawer / Side Panel Pattern

```tsx
// ShiftDetailDrawer.tsx
// Use for: Shift detail, Employee quick-view, WorkDay inspection
// Rule: drawers open FROM THE RIGHT; width is fixed at 480px on desktop

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode  // action buttons
}

// Animation: slide in from right, 250ms ease-out
// Backdrop: semi-transparent, click to close
// Mobile: full-screen bottom sheet instead
```

---

## Confirmation Dialog Pattern

For ALL destructive actions (delete, override, lock, archive):

```tsx
// ConfirmationDialog requirements:
// 1. Clearly state what will happen: "This will permanently delete shift on Monday 9am"
// 2. State the consequence: "This cannot be undone. The employee will be notified."
// 3. Require explicit acknowledgment for high-stakes actions (type to confirm)
// 4. Destructive button is red, is NOT the default focused element
// 5. Cancel is always the default focused element

<ConfirmationDialog
  title="Delete shift"
  description="Delete Monday 9:00–17:00 for Ana García? The employee will be notified."
  consequence="This cannot be undone."
  confirmLabel="Delete shift"
  confirmVariant="destructive"
  onConfirm={handleDelete}
  onCancel={onClose}
/>
```

---

## Form Validation Pattern

```tsx
// Rules:
// 1. Validate on blur (not on keypress)
// 2. Show inline error below the field
// 3. Error message must be specific and actionable
// 4. On submit attempt with errors: scroll to first error + focus it

// Good error messages:
"Planned hours (32.5h) exceed contracted hours (10h/week)"
"End time must be after start time"
"At least one shift role is required"

// Bad error messages:
"Invalid value"
"Field is required"
"Error"
```

---

## Empty State Pattern

Every empty state must have: icon + title + description + (optional) primary action.

```tsx
<EmptyState
  icon={<Calendar className="w-12 h-12 text-neutral-400" />}
  title="No shifts this week"
  description="Start building the schedule by clicking any cell in the grid, or copy last week's plan."
  action={<Button variant="primary">Copy last week</Button>}
/>
```

---

## Status Badge Reference

```tsx
// Always use these variants. Never create ad-hoc colored spans.
<StatusBadge variant="draft" />      // grey  — Planning: not published
<StatusBadge variant="published" />  // green — Planning: published
<StatusBadge variant="live" />       // purple — Currently clocked in
<StatusBadge variant="complete" />   // green — WorkDay: approved and closed
<StatusBadge variant="conflict" />   // red   — Contract violation
<StatusBadge variant="warning" />    // orange — Soft rule violation
<StatusBadge variant="absent" />     // red   — No-show
<StatusBadge variant="locked" />     // grey  — Period locked, read-only
<StatusBadge variant="pending" />    // blue  — Awaiting approval
```

---

## Inspection View Pattern

The inspection view is fundamentally different from all other screens:
- Zero editing capability — every interactive element must be disabled or hidden
- Print/export is the primary action (always visible in top-right)
- Data density is maximum — show all fields, no progressive disclosure
- Audit log is always visible alongside the data
- Access is logged automatically on mount (side effect in useEffect)

```tsx
function InspectionView() {
  // Log access on mount — non-negotiable
  useEffect(() => {
    auditService.logInspectorAccess({
      inspectorId: user.id,
      timestamp: new Date(),
      filters: activeFilters,
    })
  }, [])

  return (
    <InspectionLayout>
      <InspectionFilters />
      <PrintButton />  {/* always visible */}
      <WorkingTimeTable readOnly />
    </InspectionLayout>
  )
}
```
