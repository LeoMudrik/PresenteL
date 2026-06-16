import { NavLink } from 'react-router-dom'
import { Home, Gift, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/presentes', icon: Gift, label: 'Presentes' },
  { to: '/carrinho', icon: ShoppingCart, label: 'Carrinho' },
]

export default function Sidebar() {
  const { totalItems } = useCart()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 shadow-sm pt-8">
        <div className="px-4 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-primary-700 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700'
                }`
              }
            >
              <Icon size={20} />
              <span>{label}</span>
              {label === 'Carrinho' && totalItems > 0 && (
                <span className="ml-auto bg-secondary-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-4">
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-4 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-xs font-semibold text-primary-700">Festa do Lucca!</p>
            <p className="text-xs text-gray-500 mt-1">Escolha um presente especial</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
        <div className="flex">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-all ${
                  isActive ? 'text-primary-700' : 'text-gray-400'
                }`
              }
            >
              <div className="relative">
                <Icon size={22} />
                {label === 'Carrinho' && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-secondary-500 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </div>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
