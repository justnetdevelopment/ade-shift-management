import type { RefObject } from 'react'
import type { CoverageSlot } from '../../types'
import { EMP_COL_PX, TOTAL_COL_PX } from './useGanttLayout'

interface GanttCoverageFooterProps {
  slots: CoverageSlot[]
  maxExpected?: number
  slotsRef: RefObject<HTMLDivElement | null>
}

function getCoverageColor(count: number, max: number): string {
  if (count === 0)           return '#f3f4f6'
  const ratio = count / max
  if (ratio < 0.4)           return '#fee2e2'   // deficit — red
  if (ratio > 1.3)           return '#fef3c7'   // excess — amber
  return '#dcfce7'                               // ok — green
}

function getCoverageTextColor(count: number, max: number): string {
  if (count === 0)           return '#d1d5db'
  const ratio = count / max
  if (ratio < 0.4)           return '#dc2626'
  if (ratio > 1.3)           return '#d97706'
  return '#15803d'
}

export function GanttCoverageFooter({ slots, maxExpected = 8, slotsRef }: GanttCoverageFooterProps) {
  const maxCount = Math.max(...slots.map(s => s.count), 1)
  const barMaxH  = 28

  return (
    <div
      className="flex flex-shrink-0 border-t-2 border-neutral-200 bg-neutral-50"
      style={{ minWidth: EMP_COL_PX + TOTAL_COL_PX }}
    >
      {/* Label */}
      <div
        className="flex-shrink-0 flex items-center px-3 border-r border-neutral-200"
        style={{ width: EMP_COL_PX }}
      >
        <div>
          <p className="text-2xs font-semibold uppercase tracking-wide text-neutral-500">
            Cobertura
          </p>
          <p className="text-2xs text-neutral-400 mt-0.5">personas / franja</p>
        </div>
      </div>

      {/* Coverage bars — fills all remaining space, synced scroll via ref */}
      <div
        ref={slotsRef as React.RefObject<HTMLDivElement>}
        className="flex-1 overflow-hidden"
        style={{ minWidth: 0 }}
      >
        <div className="flex items-end w-full" style={{ height: 44 }}>
          {slots.map((slot, i) => {
            const barH  = slot.count > 0 ? Math.max(4, (slot.count / maxCount) * barMaxH) : 0
            const bg    = getCoverageColor(slot.count, maxExpected)
            const tc    = getCoverageTextColor(slot.count, maxExpected)
            const isHour = i % 2 === 0

            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end border-r border-neutral-100 pb-1 gap-0.5"
                style={{ height: 44 }}
                title={`${slot.slot_start}: ${slot.count} persona${slot.count !== 1 ? 's' : ''}`}
              >
                {isHour && slot.count > 0 && (
                  <span
                    className="text-2xs font-bold tabular-nums leading-none"
                    style={{ color: tc }}
                  >
                    {slot.count}
                  </span>
                )}
                <div
                  className="w-full rounded-t-sm transition-all duration-200 px-0.5"
                  style={{
                    height:          barH,
                    backgroundColor: bg,
                    border:          `1px solid ${bg === '#f3f4f6' ? '#e5e7eb' : bg}`,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Right corner */}
      <div
        className="flex-shrink-0 border-l border-neutral-200"
        style={{ width: TOTAL_COL_PX }}
      />
    </div>
  )
}
