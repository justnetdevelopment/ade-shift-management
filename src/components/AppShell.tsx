import type { ReactNode } from 'react'
import {
  CalendarDays,
  Users,
  Clock,
  FileCheck,
  Wallet,
  BarChart3,
  Shield,
  Settings,
  Gem,
} from 'lucide-react'
import type { AppPage } from '../types'

const NAV_ITEMS: { icon: typeof CalendarDays; label: string; page: AppPage }[] = [
  { icon: CalendarDays, label: 'Plan.',      page: 'planning'      },
  { icon: Users,        label: 'Empleados',  page: 'employees'     },
  { icon: Clock,        label: 'Fichajes',   page: 'time-tracking' },
  { icon: FileCheck,    label: 'Cierre',     page: 'closure'       },
  { icon: Wallet,       label: 'Saldos',     page: 'balances'      },
  { icon: BarChart3,    label: 'Costes',     page: 'costs'         },
  { icon: Shield,       label: 'Inspec.',    page: 'inspection'    },
  { icon: Settings,     label: 'Config.',    page: 'settings'      },
]

interface AppShellProps {
  children: ReactNode
  activePage: AppPage
  onPageChange: (page: AppPage) => void
}

export function AppShell({ children, activePage, onPageChange }: AppShellProps) {
  return (
    <div className="flex h-screen bg-neutral-100 font-sans overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-16 flex-shrink-0 flex flex-col bg-[#111318] border-r border-white/5">

        {/* Logo */}
        <div className="flex items-center justify-center h-14 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-shift-600 flex items-center justify-center shadow-md">
            <Gem className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-center gap-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, page }) => {
            const active =
              activePage === page ||
              (page === 'employees' && activePage === 'employee-schedule')
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                title={label}
                className={`relative flex flex-col items-center gap-1.5 w-12 py-2.5 rounded-xl transition-all duration-150 ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-shift-500 rounded-r-full" />
                )}
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-[9px] leading-none font-medium">{label}</span>
              </button>
            )
          })}
        </nav>

        {/* User + version */}
        <div className="flex flex-col items-center gap-2 pb-4 border-t border-white/5 pt-3">
          <div
            className="w-8 h-8 rounded-full bg-success-600 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-success-500/40 transition-all"
            title="Javier Morales"
          >
            <span className="text-[11px] font-bold text-white">JM</span>
          </div>
          <span className="text-[9px] text-neutral-600 font-medium">v1.0</span>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
