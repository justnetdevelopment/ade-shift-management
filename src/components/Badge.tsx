import type { ReactNode } from 'react'

type BadgeVariant = 'draft' | 'review' | 'published' | 'locked' | 'error' | 'warning' | 'info' | 'neutral'

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  draft:     'bg-neutral-100 text-neutral-600 ring-neutral-200',
  review:    'bg-warning-100 text-warning-700 ring-warning-200',
  published: 'bg-success-100 text-success-700 ring-success-200',
  locked:    'bg-navy-100 text-navy-700 ring-navy-200',
  error:     'bg-error-50 text-error-700 ring-error-200',
  warning:   'bg-warning-50 text-warning-700 ring-warning-200',
  info:      'bg-info-50 text-info-700 ring-info-200',
  neutral:   'bg-neutral-100 text-neutral-600 ring-neutral-200',
}

const LABELS: Record<string, string> = {
  draft:     'Borrador',
  review:    'En revisión',
  published: 'Publicado',
  locked:    'Cerrado',
}

interface BadgeProps {
  variant: BadgeVariant
  children?: ReactNode
  label?: string
}

export function Badge({ variant, children, label }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${VARIANT_CLASSES[variant]}`}>
      {children ?? label ?? LABELS[variant] ?? variant}
    </span>
  )
}
