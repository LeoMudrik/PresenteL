import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Gift, Settings, QrCode, Users, ChevronRight } from 'lucide-react'

const adminNav = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/presentes', icon: Gift, label: 'Presentes' },
  { to: '/admin/config', icon: Settings, label: 'Config. Festa' },
  { to: '/admin/pix', icon: QrCode, label: 'Config. PIX' },
  { to: '/admin/contas', icon: Users, label: 'Contas' },
]

export default function AdminSidebar() {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-gray-900 text-white pt-6">
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-400 text-lg">⚙️</span>
            <span className="font-bold text-lg">Edições</span>
          </div>
          <p className="text-xs text-gray-400">Painel Administrativo</p>
        </div>

        <nav className="flex flex-col gap-1 px-3 flex-1">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-primary-700 text-white shadow-lg'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-gray-800 rounded-2xl p-4 text-center">
            <p className="text-yellow-400 text-xl">👑</p>
            <p className="text-xs text-gray-400 mt-1">Área de Administração</p>
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-30 overflow-x-auto">
        <div className="flex min-w-max">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-4 gap-1 text-xs font-medium transition-all ${
                  isActive ? 'text-primary-400' : 'text-gray-400'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
