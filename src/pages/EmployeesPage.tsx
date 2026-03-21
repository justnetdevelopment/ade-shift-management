import { useState } from 'react'
import { Search, ChevronDown, CalendarDays, Users } from 'lucide-react'
import { MOCK_EMPLOYMENTS, MOCK_CENTERS } from '../mock-data'

const GRID = 'grid grid-cols-[3rem_minmax(180px,1fr)_140px_150px_80px_100px_110px]'

interface EmployeesPageProps {
  onViewSchedule: (employmentId: string) => void
}

export function EmployeesPage({ onViewSchedule }: EmployeesPageProps) {
  const [search,       setSearch]       = useState('')
  const [filterCenter, setFilterCenter] = useState<string | null>(null)

  const filtered = MOCK_EMPLOYMENTS.filter(emp => {
    if (filterCenter && emp.center_id !== filterCenter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        emp.person.legal_name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q)
      )
    }
    return true
  })

  const activeCount = MOCK_EMPLOYMENTS.filter(e => e.status === 'active').length

  return (
    <div className="flex flex-col h-full">

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-4 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-neutral-900">Empleados</h1>
            <span className="text-xs text-neutral-400 tabular-nums">{activeCount} activos</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nombre o rol…"
                className="pl-8 pr-3 py-1.5 text-xs text-neutral-900 border border-neutral-200 rounded-md bg-white w-52 focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent placeholder:text-neutral-400"
              />
            </div>

            {/* Center filter */}
            <div className="relative">
              <select
                value={filterCenter ?? ''}
                onChange={e => setFilterCenter(e.target.value || null)}
                className="pl-2.5 pr-7 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md appearance-none cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-shift-500 focus:border-transparent"
              >
                <option value="">Todos los centros</option>
                {MOCK_CENTERS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">

        {/* Header row */}
        <div className={`${GRID} border-b border-neutral-200 bg-neutral-50 sticky top-0 z-10`}>
          {[
            '',
            'Nombre',
            'Rol',
            'Centro',
            'Contrato',
            'Estado',
            '',
          ].map((label, i) => (
            <div
              key={i}
              className={`px-3 py-2 text-2xs font-semibold text-neutral-500 uppercase tracking-wide ${i === 0 ? 'px-4' : ''}`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {filtered.map(emp => {
          const center = MOCK_CENTERS.find(c => c.id === emp.center_id)

          const statusClass =
            emp.status === 'active'   ? 'bg-success-100 text-success-700 ring-success-200' :
            emp.status === 'on_leave' ? 'bg-warning-100 text-warning-700 ring-warning-200' :
                                        'bg-neutral-100 text-neutral-500 ring-neutral-200'
          const dotClass =
            emp.status === 'active'   ? 'bg-success-500' :
            emp.status === 'on_leave' ? 'bg-warning-500' : 'bg-neutral-400'
          const statusLabel =
            emp.status === 'active'   ? 'Activo' :
            emp.status === 'on_leave' ? 'De baja' : 'Inactivo'

          return (
            <div
              key={emp.id}
              className={`${GRID} items-center border-b border-neutral-100 bg-white hover:bg-neutral-50 transition-colors`}
            >
              {/* Avatar */}
              <div className="px-4 py-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white"
                  style={{ backgroundColor: emp.person.avatar_color }}
                >
                  {emp.person.avatar_initials}
                </div>
              </div>

              {/* Name */}
              <div className="px-3 py-3 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate leading-tight">
                  {emp.person.legal_name}
                </p>
                <p className="text-2xs text-neutral-400 font-mono">{emp.person.national_id}</p>
              </div>

              {/* Role */}
              <div className="px-3 py-3">
                <p className="text-sm text-neutral-700 truncate">{emp.role}</p>
              </div>

              {/* Center */}
              <div className="px-3 py-3">
                <p className="text-sm text-neutral-700 truncate">{center?.name ?? '—'}</p>
              </div>

              {/* Contract hours */}
              <div className="px-3 py-3">
                <span className="text-sm font-mono font-semibold text-neutral-900">
                  {emp.contracted_hours_week}h
                </span>
                <span className="text-xs text-neutral-400">/sem</span>
              </div>

              {/* Status */}
              <div className="px-3 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                  {statusLabel}
                </span>
              </div>

              {/* Action */}
              <div className="px-3 py-3">
                <button
                  onClick={() => onViewSchedule(emp.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-shift-700 bg-shift-50 hover:bg-shift-100 border border-shift-200 rounded-md transition-colors whitespace-nowrap"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  Ver turno
                </button>
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Users className="w-10 h-10 text-neutral-300" />
            <p className="text-sm font-medium text-neutral-500">Sin resultados</p>
            <p className="text-xs text-neutral-400">
              Prueba con otro nombre o cambia el filtro de centro
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
