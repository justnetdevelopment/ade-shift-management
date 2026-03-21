# DESIGN-SYSTEM.md — Template

> Generated during Phase 3 of the PRD → UI process.
> Define all tokens here before writing a single component.

---

## 1. Design Direction Statement

**Product category:** B2B Workforce Management Tool
**Primary persona:** Restaurant Manager and HR professional
**Tone:** Precision instrument. Utility-first. Zero decoration.
**Aesthetic direction:** [choose one and commit]
  - Industrial/utilitarian — structured, dense, functional
  - Editorial/refined — clean hierarchy, generous whitespace, typographic discipline
  - Dark-mode professional — high contrast, reduced eye strain for long sessions

**The one thing this UI should make someone feel:** "This system is completely in control."

---

## 2. Color Tokens

```css
/* tokens.css */
:root {
  /* Brand */
  --color-primary-900: #0F2540;
  --color-primary-800: #1A3A5C;   /* primary — headers, sidebar */
  --color-primary-700: #1E4976;
  --color-primary-600: #2560A0;
  --color-primary-500: #2E86AB;   /* accent — interactive elements */
  --color-primary-400: #4FA3C5;
  --color-primary-300: #7ABFD8;
  --color-primary-100: #E8F4F8;   /* backgrounds, hover states */
  --color-primary-50:  #F2F9FC;

  /* Neutrals */
  --color-neutral-950: #0A0A0A;
  --color-neutral-900: #1A1A1A;
  --color-neutral-800: #2D2D2D;
  --color-neutral-700: #444444;
  --color-neutral-600: #5C5C5C;
  --color-neutral-500: #737373;
  --color-neutral-400: #9E9E9E;
  --color-neutral-300: #C4C4C4;
  --color-neutral-200: #E0E0E0;
  --color-neutral-100: #F0F0F0;
  --color-neutral-50:  #F8F8F8;
  --color-white:       #FFFFFF;

  /* Semantic — SACRED. Never repurpose these. */
  --color-success-600: #1A7A4A;
  --color-success-500: #27AE60;
  --color-success-100: #E8F5EE;

  --color-warning-600: #C17A1A;
  --color-warning-500: #E67E22;
  --color-warning-100: #FEF3E2;

  --color-error-600:   #9B2215;
  --color-error-500:   #C0392B;
  --color-error-100:   #FCEAE8;

  --color-info-600:    #1A5FAA;
  --color-info-500:    #2980B9;
  --color-info-100:    #EBF5FB;

  /* Status colors — WorkForce Pro specific */
  --color-status-planned:    #2E86AB;   /* shift is planned */
  --color-status-published:  #27AE60;   /* plan is published */
  --color-status-live:       #8E44AD;   /* currently clocked in */
  --color-status-complete:   #1A7A4A;   /* workday closed and approved */
  --color-status-conflict:   #C0392B;   /* contract exceedance or error */
  --color-status-warning:    #E67E22;   /* soft violation */
  --color-status-locked:     #5C5C5C;   /* period locked, read-only */
  --color-status-absent:     #C0392B;   /* no-show */
}
```

---

## 3. Typography Scale

```css
:root {
  /* Font families */
  --font-display: 'Sora', sans-serif;       /* headings, page titles */
  --font-body:    'DM Sans', sans-serif;    /* body text, labels, inputs */
  --font-mono:    'JetBrains Mono', monospace; /* times, codes, numbers */

  /* Scale */
  --text-2xl:  2rem;      /* 32px — page titles */
  --text-xl:   1.5rem;    /* 24px — section headings */
  --text-lg:   1.25rem;   /* 20px — card headings */
  --text-base: 1rem;      /* 16px — body */
  --text-sm:   0.875rem;  /* 14px — labels, table cells */
  --text-xs:   0.75rem;   /* 12px — badges, captions */

  /* Weights */
  --font-bold:    700;
  --font-medium:  500;
  --font-regular: 400;

  /* Line heights */
  --leading-tight:  1.2;
  --leading-normal: 1.5;
  --leading-loose:  1.75;
}
```

---

## 4. Spacing Scale

```css
:root {
  /* 4px base grid */
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
}
```

---

## 5. Elevation

```css
:root {
  --shadow-sm:  0 1px 2px rgba(0,0,0,0.06);             /* table rows, inline elements */
  --shadow-md:  0 2px 8px rgba(0,0,0,0.10);             /* cards, dropdowns */
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.14);            /* modals, drawers */
  --shadow-xl:  0 16px 48px rgba(0,0,0,0.18);           /* overlay panels */
}
```

---

## 6. Border System

```css
:root {
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-full: 9999px;  /* pills, avatars */

  --border-subtle:    1px solid var(--color-neutral-200);
  --border-default:   1px solid var(--color-neutral-300);
  --border-strong:    1px solid var(--color-neutral-500);
  --border-focus:     2px solid var(--color-primary-500);
  --border-error:     1px solid var(--color-error-500);
}
```

---

## 7. Component Specifications

### Button

| Variant | Use case | Style |
|---|---|---|
| `primary` | Main CTA per screen (1 max) | Filled, primary-800 bg |
| `secondary` | Supporting actions | Outlined, primary-800 border |
| `ghost` | Low-priority actions | No border, hover bg only |
| `destructive` | Delete, override, lock | Filled, error-500 bg |
| `icon` | Icon-only actions | No label, tooltip required |

**States for all buttons:** default, hover, focus (ring), active, disabled, loading

### Badge / Status Chip

Always use semantic color tokens. Never custom colors inline.

```
<Badge variant="published" /> → green background
<Badge variant="conflict" />  → red background
<Badge variant="warning" />   → orange background
```

### Table

- Header row: neutral-100 bg, bold labels, sortable columns show chevron
- Data rows: white bg, 44px min height, hover neutral-50
- Every table needs: loading skeleton, empty state, error state
- Pagination: always show total count ("Showing 1–25 of 147")

### Planning Grid Cell

States (must all be visually distinct):

| State | Visual |
|---|---|
| Empty | Dashed border, neutral-100 bg, "+" on hover |
| Filled (draft) | Solid fill, primary-100 bg, shift time text |
| Filled (published) | Solid fill, success-100 bg, checkmark indicator |
| Conflict (over hours) | Error-100 bg, red left border, warning icon |
| Holiday | Info-100 bg, calendar icon |
| Absent (no-show) | Error-500 bg, strikethrough text |
| Locked | Neutral-200 bg, lock icon, cursor: not-allowed |

---

## 8. Iconography

**Library:** Lucide React (consistent, professionally maintained)

**Usage rules:**
- Icons always accompany a label (or have aria-label) — never icon-only without tooltip
- Icon size: 16px for inline text, 20px for buttons, 24px for navigation
- Never mix icon libraries within the same product

**Reserved icons (must be consistent app-wide):**

| Icon | Meaning | Never use for anything else |
|---|---|---|
| `AlertTriangle` | Warning / soft violation | |
| `AlertCircle` | Error / hard violation | |
| `CheckCircle` | Success / approved | |
| `Lock` | Locked / read-only | |
| `Clock` | Time tracking | |
| `Calendar` | Planning / scheduling | |
| `Users` | Employees | |
| `BarChart` | Costs / KPIs | |
| `Shield` | Inspection / legal | |

---

## 9. Motion Principles

- **Duration:** 150ms for micro (hover, focus); 250ms for transitions (open drawer, expand); 400ms for page (initial load only)
- **Easing:** `ease-out` for enter; `ease-in` for exit; `ease-in-out` for transforms
- **What animates:** drawer open/close; modal enter/exit; page load (staggered card reveal); status badge change
- **What does NOT animate:** table row updates; cell state changes in planning grid (too many, causes flicker); error messages (must appear instantly)

---

## 10. Tailwind Config (if using Tailwind)

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F2F9FC', 100: '#E8F4F8', 300: '#7ABFD8',
          400: '#4FA3C5', 500: '#2E86AB', 600: '#2560A0',
          700: '#1E4976', 800: '#1A3A5C', 900: '#0F2540',
        },
        success: { 100: '#E8F5EE', 500: '#27AE60', 600: '#1A7A4A' },
        warning: { 100: '#FEF3E2', 500: '#E67E22', 600: '#C17A1A' },
        error:   { 100: '#FCEAE8', 500: '#C0392B', 600: '#9B2215' },
        info:    { 100: '#EBF5FB', 500: '#2980B9', 600: '#1A5FAA' },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
    }
  }
}
```
